# Excel at Chess

A browser-based chess game presented as a spreadsheet. The board occupies an 8×8 cell range, with spreadsheet-style controls around it.

[Play the demo](https://keaganwayne.github.io/ExcelatChess/)

## Interface experiment

The project explores how a familiar productivity interface can represent a strategy game: cell coordinates become board positions, cell values represent pieces, and worksheet controls manage play.

Rectangular cells create an unusual visual challenge, especially when following diagonal moves. The interface offers a way to explore that tradeoff between visual style and board readability.

## Features

- Click a piece to see legal moves, then click a destination.
- Play as white or black against a browser-based Stockfish engine.
- Choose an engine setting from 1 to 10 using `Calc Depth`.
- Promote pawns to queens automatically.
- Save and resume games in the same browser using local storage.

## Technology

React and Vite provide the interface and build tooling. `chess.js` handles chess rules, and Stockfish runs in a browser Web Worker. The application can be deployed as a static site.

## Run locally

Requires Node.js and npm compatible with the project's Vite version.

```sh
npm ci
npm run dev
```

Create and preview a production build:

```sh
npm run build
npm run preview
```

## Controls

- Choose a side and a `Calc Depth` setting on the opening screen.
- Use `Initialize Sheet` to start a new game.
- Use `Resume Workbook` to restore a saved game.
- Click pieces and highlighted cells to make moves.

## Privacy and security

Game state stays in the browser. Stockfish runs locally in a Web Worker. No school database or user account backend is used. See [SECURITY.md](SECURITY.md).
