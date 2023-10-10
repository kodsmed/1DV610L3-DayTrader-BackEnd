# Lab 3 - The App

This is part of the course [1dv610 - Introduction to Software Quality](https://coursepress.lnu.se/kurs/introduktion-till-mjukvarukvalitet/) at [Linnaeus University](https://lnu.se/).  
The goal is to create an application following the Clean Code principles and that utilize the module created in [Lab 2 - graphdrawer](https://github.com/kodsmed/graphdrawer).

## A stock trading simulator

At the start of the game you are given a sum of money to invest in the stock market.  
You can buy and sell stocks and see how your portfolio develops over time.  
The game is over when you run out of money or a year has passed.  
The goal is to have as much money as possible at the end of the game.

The game is built in Typescript, compiled to Javascript and can be served on any web server.  
(The project comes preconfigured with Vite, but any web server will do.)  and then accessed through a web browser.  
Due to limitations in the API used, the game is limited to the US stock market and a limited number of stocks,  
also how fast the game can be played.
