import express, { Express, Request, Response, NextFunction, Router } from 'express';
import { createServer } from 'node:http'
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv';
import { router } from './routes/router.js'
import cors from 'cors'

class Server {
  private server: Express | false;
  private numberOfApiCallsLastInterval: number = 0;
  private readonly maxApiCallsPerInterval: number = 10;
  private apiCallsResetInterval: NodeJS.Timeout;
  private apiCallsQueue: Array<() => void> = [];


  constructor() {
    const windowSizeInSeconds = 6;
    const windowSizeInMs = windowSizeInSeconds * 1000;
    // Reset the number of API calls every windowSizeInMs seconds and release the queued API calls in sequence.
    this.apiCallsResetInterval = setInterval(() => {
      this.numberOfApiCallsLastInterval = 0;
      // release up to maxApiCallsPerInterval queued API calls
      const releaseQueue = this.apiCallsQueue.splice(0, this.maxApiCallsPerInterval) as Array<() => void>;
      releaseQueue.forEach((callback) => callback());
    }, windowSizeInMs);
    this.server = false;
  }

  public start() {
    try {
      dotenv.config();

      const baseURL = process.env.BASE_URL || '/'

      const app: Express = express();
      this.server = app;
      const httpServer = createServer(app)
      const port = process.env.PORT;

      app.use(cors());

      if (app.get('env') === 'production') {
        // Set up helmet to shoreup the outgoing headers.
        app.use(helmet())

        // Allow bootstrap
        app.use(
          helmet.contentSecurityPolicy({
            directives: {
              defaultSrc: [
                'self'
              ],

              scriptSrc: [
                'self'
              ],

              styleSrc: [
                'self'
              ],

              imgSrc: [
                'self'
              ]
            }
          })
        )
      }

      const limiter = rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 30, // Limit each IP to 30 requests per `window`
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false // Disable the `X-RateLimit-*` headers
      })
      app.use(limiter)

      const directoryFullName = dirname(fileURLToPath(import.meta.url))
      app.use(express.static(join(directoryFullName, '..', 'dist')))

      app.set('view engine', 'ejs')
      app.set('views', join(directoryFullName, 'views'))
      app.use(expressLayouts)
      app.set('layout', join(directoryFullName, 'views', 'layouts', 'default'))

      // Populates the request object with a body object (req.body).
      app.use(express.urlencoded({ extended: false }))

      // Setup and use session middleware (https://github.com/expressjs/session)
      const sameSiteSetting = 'strict' as 'strict' | 'lax' | 'none' | undefined
      const sessionOptions = {
        name: process.env.SESSION_NAME || "DayTrader", // Don't use default session cookie name.
        secret: process.env.SESSION_SECRET || "default", // Change it!!! The secret is used to hash the session with HMAC.
        resave: false, // Resave even if a request is not changing the session.
        saveUninitialized: false, // Don't save a created but not modified session.
        cookie: {
          maxAge: 1000 * 60 * 60 * 24, // 1 day
          sameSite: sameSiteSetting,
          secure: false // Set it to true in production.
        }
      }

      if (app.get('env') === 'production') {
        app.set('trust proxy', 1) // trust first proxy
        sessionOptions.cookie.secure = true // serve secure cookies
      }

      app.use(session(sessionOptions))

      // Middleware to count the number of API calls and queue them if they exceed the limit.
      app.use((req, res, next) => {
        if (req.url.startsWith('/api')) {
          if (this.numberOfApiCallsLastInterval >= this.maxApiCallsPerInterval) {
            this.apiCallsQueue.push(() => next());
            console.log ("\uD83D\uDCB2 [DayTrader]\uD83D\uDCB2 -> API call queued. Number of queued API calls: " + this.apiCallsQueue.length)
          } else {
            this.numberOfApiCallsLastInterval++;
            next();
          }
        } else {
          next();
        }
      })

      app.use((req, res, next) => {
        // Pass the base URL to the views.
        res.locals.baseURL = baseURL
        next()
      })

      app.use('/', router)


      app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {

        if (err.cause === 404) {
          return res
            .status(404)
            .sendFile(join(directoryFullName, 'views', 'errors', '404.html'))
        }

        if (req.app.get('env') !== 'development') {
          return res
            .status(500)
            .sendFile(join(directoryFullName, 'views', 'errors', '500.html'))
        }

        res
          .status(Number(err.cause) || 500)
          .render('errors/error', { error: err })
      })


      httpServer.listen(process.env.PORT, () => {
        console.log(`"\uD83D\uDCB2 [DayTrader]\uD83D\uDCB2: Server is running at http://localhost:${port}`);
      });

    } catch (error: unknown) {

      if (error instanceof Error) {
        console.log("\uD83D\uDCB2 [DayTrader]\uD83D\uDCB2 -> Uncaught Exception: " + error);
        console.error("Error Stack:", error.stack);
      }
      process.exitCode = 1;
    }
  }

  async stop() {
    if (!this.server) {
      return;
    }

    clearInterval(this.apiCallsResetInterval);

    while (this.apiCallsQueue.length > 0) {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    }

    this.server.listen(process.env.PORT).close();
  }
}

const server = new Server();
server.start();