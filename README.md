# ExcelatChess

ExcelatChess is a browser-based chess game disguised as a spreadsheet workspace.

At first glance, it looks like a fake office sheet inspired by Google Sheets. Hidden inside the sheet is a playable chessboard rendered as coded cell values, allowing a full game to unfold inside what appears to be an ordinary spreadsheet document.

## Purpose

This project was built as a design and programming experiment:

- to create a playable chess interface that blends into a spreadsheet-style UI
- to preserve the visual language of office software rather than traditional game design
- to explore browser-based chess logic, engine integration, and disguised interface design

The goal was not just to make another chess app, but to make one that feels like a strange, believable workbook someone might leave open on their screen.

## Features

- Spreadsheet-inspired interface
- Hidden 8×8 chessboard embedded in sheet cells
- Click-to-move interaction
- Automatic queen promotion
- Play as white or black
- Adjustable engine strength from 1 to 10
- Local browser save/resume
- Static web deployment support

## How it works

The visible UI is a fake spreadsheet shell. The board is mapped to a fixed cell range inside the sheet, while actual chess rules are handled underneath by a chess rules library.

The opponent is powered by a browser-oriented Stockfish build running in the front end.

## Controls

- Select a side from the opening screen
- Choose a `Calc Depth` from 1 to 10
- Click a piece to view legal moves
- Click a highlighted destination to move
- Use `Initialize Sheet` to restart
- Use `Resume Workbook` to continue a saved local game

## Tech Stack

- React
- Vite
- chess.js
- Browser-oriented Stockfish engine
- Static assets served through Vite public files

## Development Notes

During development, multiple engine approaches were tested.

An earlier wasm-based route was explored, but it introduced browser/runtime friction for the intended static hosting workflow. The final implementation uses a browser-oriented Stockfish build that fits the project better for local browser play and static deployment.

## Running Locally

Install dependencies:

```bash
npm install