# Lab 3 - The App

This is part of the course [1dv610 - Introduction to Software Quality](https://coursepress.lnu.se/kurs/introduktion-till-mjukvarukvalitet/) at [Linnaeus University](https://lnu.se/).  
The goal is to create an application following the Clean Code principles and that utilize the module created in [Lab 2 - graphdrawer](https://github.com/kodsmed/graphdrawer).

## A stock trading simulator - Backend

This is the backend for a stock trading simulator, it uses the [Finnhub.io](https://finnhub.io/) API to fetch stock data and re-sends it to the frontend.  
Imposing some rate limits to the API calls to avoid getting blocked by the API provider and to avoid unnecessary calls to the API.

### Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. change the name of the `.env.example` file to `.env`
3. Get an free API key from [Finnhub.io](https://finnhub.io/register) and add it to the `.env` file.  
**Do not commit the API key!**   
**Never serve API keys!**   
5. Make any other changes to the `.env` file if needed.   
You may need a different port if you are already running something on port 8080.
6. Compile the typescript files with `npm run build`
7. Start the server with `npm start`
8. Note what port the server is running on, default is 8080
