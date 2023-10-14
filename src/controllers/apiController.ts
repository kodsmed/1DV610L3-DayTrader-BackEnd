import express, { Request, Response, NextFunction, Router } from 'express';
export class ApiController {
  getStockHistory(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id
    // grab the URL parameter
    const { from, to } = req.query

    console.log(`You requested the stock with the ID of ${id} from ${from} to ${to}`)

    res.send(`Hello from the API controller! You requested the stock with the ID of ${id} from ${from} to ${to}`)
  }
}