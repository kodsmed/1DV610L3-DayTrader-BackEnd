import dotenv from 'dotenv';
import express, { Request, Response, NextFunction, Router } from 'express';

export class ApiController {
  async getStockHistory(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id
    const { from, to } = req.query

    try {
    dotenv.config({ path: './.env' });
    const apiKey = process.env.FINNHUB_API_KEY;

    console.log('Time: ', new Date().toLocaleString())
    console.log(`Request: the stock with the ID of ${id} from ${from} to ${to}`)

    const apiURL = `https://finnhub.io/api/v1/stock/candle?symbol=${id}&resolution=D&from=${from}&to=${to}&token=${apiKey}`;

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(`${apiURL}`, options);
    const data = await response.json();

    const redactedData = {
      status: data.s === 'ok' ? 'success' : 'error',
      ticker: id,
      timestamps: data.t,
      closePrices: data.c,
    }
    res.send(redactedData)

    } catch (error) {
      res.send(`Error: You requested the stock with the ID of ${id} from ${from} to ${to}, no data could be retrieved.`)
    }
  }
}
