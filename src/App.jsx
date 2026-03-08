import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";

const COLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ROWS = Array.from({ length: 32 }, (_, i) => i + 1);
const BOARD_RANGE = { startCol: "C", endCol: "J", startRow: 12, endRow: 19 };
const STORAGE_KEY = "stealthSheetsChess_v2_stockfish";

function colToIndex(col) {
  return COLS.indexOf(col);
}

function indexToCol(i) {
  return COLS[i];
}

function getCellId(col, row) {
  return `${col}${row}`;
}

function isBoardCell(col, row) {
  return (
    colToIndex(col) >= colToIndex(BOARD_RANGE.startCol) &&
    colToIndex(col) <= colToIndex(BOARD_RANGE.endCol) &&
    row >= BOARD_RANGE.startRow &&
    row <= BOARD_RANGE.endRow
  );
}

function spreadsheetToChess(col, row, orientation) {
  const x = colToIndex(col) - colToIndex(BOARD_RANGE.startCol);
  const y = row - BOARD_RANGE.startRow;

  if (orientation === "white") {
    return String.fromCharCode(97 + x) + String(8 - y);
  }
  return String.fromCharCode(97 + (7 - x)) + String(1 + y);
}

function createGame(fen) {
  const game = new Chess();
  if (fen) game.load(fen);
  return game;
}

function displayLabel(game, piece, square) {
  if (!piece) return "";
  if (piece.type === "k") return `K1${piece.color === "w" ? "PLA" : "OPP"}`;
  if (piece.type === "q") return `Q1${piece.color === "w" ? "PLA" : "OPP"}`;

  const scanOrder = [
    "a8","b8","c8","d8","e8","f8","g8","h8",
    "a7","b7","c7","d7","e7","f7","g7","h7",
    "a2","b2","c2","d2","e2","f2","g2","h2",
    "a1","b1","c1","d1","e1","f1","g1","h1",
  ];

  const matches = scanOrder.filter((sq) => {
    const p = game.get(sq);
    return p && p.type === piece.type && p.color === piece.color;
  });

  let num = matches.indexOf(square) + 1;
  if (num < 1) num = 1;

  const prefix =
    piece.type === "p" ? "P" :
    piece.type === "r" ? "R" :
    piece.type === "n" ? "H" : "B";

  return `${prefix}${num}${piece.color === "w" ? "PLA" : "OPP"}`;
}

function getGameResult(game) {
  if (game.isCheckmate()) return game.turn() === "w" ? "Checkmate: OPP wins" : "Checkmate: PLA wins";
  if (game.isStalemate()) return "Stalemate: workbook state locked";
  if (game.isInsufficientMaterial()) return "Draw: insufficient material";
  if (game.isThreefoldRepetition()) return "Draw: repetition detected";
  if (game.isDraw()) return "Draw: workbook state locked";
  return null;
}

function buildSheetData() {
  const data = new Map();
  const set = (col, row, text, className = "") => data.set(getCellId(col, row), { text, className });

  set("A",1,"Because it all came from this: Table, Sales Data. Bam!","note");
  set("A",2,"There it is: Item, Buyer,City, State, Phone, Sold, Paid, Cost, Quantity, and Total.","note");
  set("A",3,"It is so easy. There are a different number of rows every time.","note");
  set("A",4,"Just an amazing tool. The little lightning bolt here.","note");
  set("A",5,"Select Table, Books. You get Author, Pages, Released.","note");
  set("A",6,"Whether or not it's been read, and cost. Ask for Table, People.","note italic");
  set("A",7,"You get First Name, Last Name, Address, City, State, E-Mail, Marital Status, and Balance.","note italic");
  set("A",8,"Here let's create another fake data set.","note");
  set("A",9,"Using the sales table.","note");

  [
    ["D",1,"first_name"],["E",1,"last_name"],["F",1,"company_nan"],["G",1,"address"],
    ["H",1,"city"],["I",1,"county"],["J",1,"state"],["K",1,"zip"],
    ["L",1,"phone1"],["M",1,"phone2"],["N",1,"email"],["O",1,"web"]
  ].forEach(([c,r,t]) => set(c,r,t,"bold peach"));

  const peopleRows = [
    [2,"Josephine","Darakjy","Chanay, Jeffre...","4 B Blue Ridge B","Brighton","Livingston","MI","48116","810-292-9388","810-374-9840","jbutt@gmail.co","http://www.chanay..."],
    [3,"Art","Venere","Chemel, James...","8 W Cerritos Ave","Bridgeport","Gloucester","NJ","8014","856-636-7349","856-264-4130","art@venere.org","http://www.chemel..."],
    [4,"Emma","Paprocki","Feltz Printing...","639 Main St","Anchorage","Anchorage","AK","99501","907-385-4412","907-921-2010","lpaprocki@...","http://www.feltz..."],
    [5,"Donnette","Foller","Printing Dimen...","34 Center St","Hamilton","Butler","OH","45011","513-570-1893","513-549-4561","donette.foller@","http://www.printing..."],
    [6,"Simona","Morasca","Chapman, Ross","3 Maculey Dr","Ashland","Ashland","OH","44805","419-503-1655","419-800-6759","simona@mora...","http://www.chapman..."],
    [7,"Mitsue","Tollner","Morlong Assoc","7 Eads St","Chicago","Cook","IL","60632","773-573-6914","773-924-8565","mitsue_tollner@","http://www.morlong..."],
    [8,"Leota","Dilliard","Commercial Pr","7 W Jackson Pl","San Jose","Santa Clara","CA","95111","408-752-3500","408-813-1105","leota@hotmail.","http://www.commercial..."],
    [9,"Sage","Wieser","Truhlar And Tr","5 Boston Ave #8","Sioux Falls","Minnehaha","SD","57105","605-414-2147","605-794-4110","sage_wieser@","http://www.truhlar..."],
    [10,"Kris","Marrier","King, Christop","228 Runamuck P","Baltimore","Baltimore City","MD","21224","410-655-8723","410-804-4694","kris@gmail.co","http://www.king..."]
  ];

  peopleRows.forEach(([r, ...vals]) => {
    ["D","E","F","G","H","I","J","K","L","M","N","O"].forEach((col, i) => {
      set(col, r, String(vals[i]));
    });
  });

  set("B",12,"REAPER");
  set("B",13,"ALO.92");
  set("B",14,"52.65","right");
  set("B",15,"5120","right");
  set("B",16,"511.5","right");
  set("B",17,"9552","right");
  set("B",18,"100","right");
  set("B",19,'"=SUM(B13:B17)"');

  const salesRows = [
    [21,"1/6/2024","East","Jones","Pencil","95","1.99","189.05"],
    [22,"1/23/2024","Central","Kivell","Binder","50","19.99","999.5"],
    [23,"2/9/2024","Central","Jardine","Pencil","36","4.99","179.64"],
    [24,"2/26/2024","Central","Gill","Pen","27","19.99","539.73"],
    [25,"3/15/2024","West","Sorvino","Pencil","56","2.99","167.44"],
    [26,"4/1/2024","East","Jones","Binder","60","4.99","299.4"],
    [27,"4/18/2024","Central","Andrews","Pencil","75","1.99","149.25"],
    [28,"5/5/2024","Central","Jardine","Pencil","90","4.99","449.1"],
    [29,"5/22/2024","West","Thompson","Pen","32","1.99","63.68"],
    [30,"6/8/2024","East","Jones","Binder","60","8.99","539.4"],
    [31,"6/25/2024","Central","Morgan","Pencil","90","4.99","449.1"],
    [32,"7/12/2024","East","Howard","Binder","29","1.99","57.71"]
  ];

  salesRows.forEach(([r,a,b,c,d,e,f,g]) => {
    set("A",r,a,"right");
    set("B",r,b,"pink center");
    set("C",r,c,"center");
    set("D",r,d,"center");
    const greenClass =
      Number(e) >= 80 ? "greenScale4" :
      Number(e) >= 60 ? "greenScale3" :
      Number(e) >= 40 ? "greenScale2" : "greenScale1";
    set("E",r,e,`right ${greenClass}`);
    set("F",r,f,"right");
    set("G",r,g,"right");
  });

  return data;
}

function engineConfigFromLevel(level) {
  const n = Number(level);
  return {
    skill: Math.max(0, Math.min(20, Math.round((n - 1) * (20 / 9)))),
    depth: Math.max(2, Math.min(18, 2 + n)),
    movetime: 120 + n * 90,
  };
}

export default function StealthSheetsChess() {
  console.log("APP VERSION CHECK 123");
  const [screen, setScreen] = useState("splash");
  const [playerColor, setPlayerColor] = useState("white");
  const [difficulty, setDifficulty] = useState(5);
  const [fen, setFen] = useState(new Chess().fen());
  const [selectedCell, setSelectedCell] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);
  const [formulaText, setFormulaText] = useState("");
  const [activeName, setActiveName] = useState("Q22");
  const [statusText, setStatusText] = useState("Turn: PLA");
  const [engineReady, setEngineReady] = useState(false);
  const [engineBusy, setEngineBusy] = useState(false);

  const engineRef = useRef(null);
  const fenRef = useRef(fen);

  useEffect(() => {
  fenRef.current = fen;
  }, [fen]);

  const orientation = playerColor;
  const game = useMemo(() => createGame(fen), [fen]);
  const staticData = useMemo(() => buildSheetData(), []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.fen) {
        setPlayerColor(parsed.playerColor || "white");
        setDifficulty(parsed.difficulty || 5);
      }
    } catch {}
  }, []);

useEffect(() => {
  let cancelled = false;

  try {
    const engine = new Worker(`${import.meta.env.BASE_URL}stockfish-18-lite-single.js`);
    engineRef.current = engine;

    engine.onmessage = (event) => {
      const line = typeof event.data === "string" ? event.data : "";
      if (!line || cancelled) return;

      console.log("ENGINE:", line);

      if (line === "uciok") {
        engine.postMessage("isready");
        return;
      }

      if (line === "readyok") {
        setEngineReady(true);
        return;
      }

      if (line.startsWith("bestmove")) {
        const parts = line.split(" ");
        const best = parts[1];
        setEngineBusy(false);

        if (!best || best === "(none)") return;

        const nextGame = createGame(fenRef.current);
        const from = best.slice(0, 2);
        const to = best.slice(2, 4);
        const promotion = best.length > 4 ? best[4] : "q";

        const moved = nextGame.move({ from, to, promotion });
        if (!moved) return;

        const nextFen = nextGame.fen();
        setFen(nextFen);
        persist(nextFen);
        setSelectedCell(null);
        setLegalTargets([]);
        setActiveName("Q22");

        const result = getGameResult(nextGame);
        if (result) {
          setStatusText(result);
          setFormulaText(result);
        } else {
          setStatusText(`Turn: ${nextGame.turn() === "w" ? "PLA" : "OPP"}`);
          setFormulaText("");
        }
      }
    };

    engine.postMessage("uci");
  } catch (err) {
    console.error("Engine init failed:", err);
  }

  return () => {
    cancelled = true;
    if (engineRef.current) {
      engineRef.current.terminate();
    }
  };
}, []);

  function persist(nextFen, nextPlayerColor = playerColor, nextDifficulty = difficulty) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fen: nextFen,
        playerColor: nextPlayerColor,
        difficulty: nextDifficulty,
        savedAt: Date.now(),
      })
    );
  }

function requestEngineMove(positionFen, level) {
  const engine = engineRef.current;
  if (!engine || !engineReady) return;

  const cfg = engineConfigFromLevel(level);
  setEngineBusy(true);

  engine.postMessage(`setoption name Skill Level value ${cfg.skill}`);
  engine.postMessage("ucinewgame");
  engine.postMessage(`position fen ${positionFen}`);
  engine.postMessage(`go depth ${cfg.depth} movetime ${cfg.movetime}`);
}

  useEffect(() => {
    if (!engineReady || !screen || screen !== "app") return;
    if (engineBusy) return;

    const current = createGame(fen);
    const result = getGameResult(current);
    if (result) return;

    const userColorCode = playerColor === "white" ? "w" : "b";
    if (current.turn() !== userColorCode) {
      requestEngineMove(fen, difficulty);
    }
  }, [fen, difficulty, playerColor, screen, engineReady, engineBusy]);


  function startNewGame() {
    const next = new Chess();
    const nextFen = next.fen();
    setFen(nextFen);
    setSelectedCell(null);
    setLegalTargets([]);
    setFormulaText("");
    setActiveName("Q22");
    setScreen("app");
    persist(nextFen, playerColor, difficulty);
    setStatusText("Turn: PLA");
  }

  function resumeGame() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed?.fen) return;
      setPlayerColor(parsed.playerColor || "white");
      setDifficulty(parsed.difficulty || 5);
      setFen(parsed.fen);
      setSelectedCell(null);
      setLegalTargets([]);
      setFormulaText("");
      setActiveName("Q22");
      setScreen("app");

      const temp = createGame(parsed.fen);
      const result = getGameResult(temp);
      if (result) {
        setStatusText(result);
        setFormulaText(result);
      } else {
        setStatusText(`Turn: ${temp.turn() === "w" ? "PLA" : "OPP"}`);
      }
    } catch {}
  }

  function resetLocalState() {
    localStorage.removeItem(STORAGE_KEY);
    setSelectedCell(null);
    setLegalTargets([]);
    setFormulaText("");
    setActiveName("Q22");
  }

  function selectSquare(cellId, square) {
    const moves = game.moves({ square, verbose: true });
    setSelectedCell(cellId);
    setLegalTargets(moves);
    setActiveName(cellId);
    const piece = game.get(square);
    setFormulaText(piece ? displayLabel(game, piece, square) : "");
  }

  function afterPlayerMove(nextGame) {
    const nextFen = nextGame.fen();
    setFen(nextFen);
    setSelectedCell(null);
    setLegalTargets([]);
    persist(nextFen);
    setActiveName("Q22");

    const result = getGameResult(nextGame);
    if (result) {
      setStatusText(result);
      setFormulaText(result);
    } else {
      setStatusText(`Turn: ${nextGame.turn() === "w" ? "PLA" : "OPP"}`);
      setFormulaText("");
    }
  }

  function onBoardCellClick(col, row) {
    if (engineBusy) return;

    const cellId = getCellId(col, row);
    const square = spreadsheetToChess(col, row, orientation);
    const piece = game.get(square);
    const userColorCode = playerColor === "white" ? "w" : "b";

    if (game.turn() !== userColorCode) return;

    if (selectedCell) {
      const selCol = selectedCell.match(/[A-Z]+/)[0];
      const selRow = Number(selectedCell.match(/\d+/)[0]);
      const fromSquare = spreadsheetToChess(selCol, selRow, orientation);
      const legal = legalTargets.find((m) => m.to === square);

      if (legal) {
        const nextGame = createGame(fen);
        nextGame.move({ from: fromSquare, to: square, promotion: "q" });
        afterPlayerMove(nextGame);
        return;
      }

      if (piece && piece.color === userColorCode) {
        selectSquare(cellId, square);
        return;
      }

      setSelectedCell(null);
      setLegalTargets([]);
      setFormulaText("");
      setActiveName(`${col}${row}`);
      return;
    }

    if (!piece || piece.color !== userColorCode) return;
    selectSquare(cellId, square);
  }

  const hasSave = typeof window !== "undefined" && !!localStorage.getItem(STORAGE_KEY);

  return (
    <div className="app-root">
      <style>{`
        :root {
          --app-bg:#f8f9fa; --chrome-bg:#f1f3f4; --toolbar-bg:#f8f9fa; --grid-border:#dadce0; --header-bg:#f8f9fa;
          --sheet-bg:#fff; --text:#202124; --muted:#5f6368; --blue:#1a73e8; --blue-soft:#d2e3fc;
          --board-light:#fbfbfb; --board-dark:#f1f3f4; --opp-text:#5f2120; --pla-text:#202124;
          --row-h:27px; --col-w:92px; --row-head-w:46px;
          --shadow:0 1px 2px rgba(60,64,67,.15),0 1px 3px 1px rgba(60,64,67,.1);
        }
        * { box-sizing:border-box; }
        html, body, #root { margin:0; min-height:100%; width:100%; }
        .app-root { font-family:Arial,Helvetica,sans-serif; background:var(--app-bg); color:var(--text); min-height:100vh; width:100vw; overflow-x:hidden; }
        .splash { min-height:100vh; display:grid; place-items:center; padding:24px; background:linear-gradient(180deg,#f8f9fa 0%,#eef2f7 100%); }
        .splash-card { width:min(760px,100%); background:#fff; border:1px solid #e0e3e7; border-radius:16px; box-shadow:var(--shadow); padding:28px; }
        .splash h1 { margin:0 0 8px; font-size:28px; }
        .splash p { margin:0 0 14px; line-height:1.5; color:var(--muted); }
        .panel-row { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; margin:20px 0; }
        .panel { border:1px solid #e0e3e7; border-radius:12px; padding:16px; background:#fbfcfe; }
        .panel h2 { margin:0 0 12px; font-size:15px; }
        .field { margin-bottom:14px; }
        .field label { display:block; font-size:12px; color:var(--muted); margin-bottom:6px; }
        .field select, .field button { width:100%; min-height:40px; border-radius:10px; border:1px solid #d0d7de; background:#fff; padding:10px 12px; font-size:14px; }
        .button-row { display:flex; gap:12px; margin-top:18px; flex-wrap:wrap; }
        .primary-btn, .ghost-btn, .danger-btn { width:auto !important; padding:10px 16px !important; cursor:pointer; font-weight:600; }
        .primary-btn { background:var(--blue)!important; color:#fff; border-color:var(--blue)!important; }
        .danger-btn { background:#fff5f5!important; color:#9b1c1c; border-color:#f3c5c5!important; }
        .help-list { margin:0; padding-left:18px; color:var(--muted); line-height:1.6; font-size:14px; }

        .app { min-height:100vh; display:grid; grid-template-rows:72px 30px 34px 1fr 36px; background:var(--app-bg); width:100vw; }
        .topbar { background:var(--chrome-bg); border-bottom:1px solid #e0e3e7; display:grid; grid-template-rows:1fr 1fr; padding:8px 16px 0; gap:6px; }
        .topbar-line1, .topbar-line2, .menu-row, .formula-row, .tabs { display:flex; align-items:center; gap:10px; white-space:nowrap; }
        .topbar-line1, .topbar-line2 { gap:14px; }
        .sheet-logo { width:26px; height:26px; border-radius:4px; background:#0f9d58; position:relative; flex:0 0 auto; }
        .sheet-logo:before { content:""; position:absolute; inset:5px 7px; background:linear-gradient(to bottom,white 0 18%,transparent 18% 24%,white 24% 42%,transparent 42% 48%,white 48% 66%,transparent 66% 72%,white 72% 90%); }
        .doc-name { font-size:14px; }
        .saved-text, .tool-item { color:var(--muted); font-size:13px; }
        .menu-item { font-size:13px; }
        .spacer { flex:1; }
        .share-btn { background:#d3ebfd; color:#0b5394; border:none; border-radius:18px; padding:8px 14px; font-weight:600; font-size:14px; }
        .avatar { width:34px; height:34px; border-radius:50%; background:radial-gradient(circle at 30% 30%,#fff 0 18%,#333 19% 37%,#c98 38% 62%,#111 63% 100%); border:2px solid #ea4335; }

        .menu-row, .formula-row, .tabs { background:var(--toolbar-bg); border-bottom:1px solid #e0e3e7; padding:0 10px; }
        .formula-row { gap:8px; }
        .tabs { border-top:1px solid #e0e3e7; border-bottom:none; }
        .name-box, .formula-box { height:24px; border:1px solid #dadce0; background:#fff; display:flex; align-items:center; padding:0 8px; font-size:12px; }
        .name-box { width:84px; }
        .formula-box { flex:1; }
        .formula-fx { color:#80868b; font-style:italic; }

        .grid-wrap { overflow:auto; background:#fff; width:100vw; }
        .sheet-grid { display:grid; grid-template-columns:var(--row-head-w) repeat(26,var(--col-w)); grid-auto-rows:var(--row-h); min-width:max-content; width:max-content; position:relative; background:#fff; }
        .corner, .col-header, .row-header, .cell { border-right:1px solid var(--grid-border); border-bottom:1px solid var(--grid-border); font-size:12px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
        .corner, .col-header, .row-header { background:var(--header-bg); display:flex; align-items:center; justify-content:center; color:#3c4043; user-select:none; }
        .active-header { background:var(--blue-soft)!important; color:#174ea6; }

        .cell { position:relative; background:#fff; padding:4px 6px; color:var(--text); display:flex; align-items:center; justify-content:flex-start; }
        .cell.right { justify-content:flex-end; }
        .cell.center { justify-content:center; }
        .cell.bold { font-weight:700; }
        .cell.italic { font-style:italic; }
        .cell.peach { background:#efc79d; }
        .cell.pink { background:#e6c9d7; }
        .cell.greenScale1 { background:#dfeee7; }
        .cell.greenScale2 { background:#c4e5d3; }
        .cell.greenScale3 { background:#a5d8bc; }
        .cell.greenScale4 { background:#77c59e; }
        .cell.board-light { background:var(--board-light); }
        .cell.board-dark { background:var(--board-dark); }
        .cell.piece-pla { color:var(--pla-text); }
        .cell.piece-opp { color:var(--opp-text); }
        .cell.note { font-size:13px; }

        .cell.selected:after { content:""; position:absolute; inset:-1px; border:2px solid var(--blue); pointer-events:none; z-index:3; }
        .cell.selected:before { content:""; position:absolute; width:8px; height:8px; background:var(--blue); border-radius:50%; right:-4px; bottom:-4px; z-index:4; box-shadow:0 0 0 2px #fff; }
        .cell.legal { box-shadow:inset 0 0 0 9999px rgba(52,168,83,.08); }
        .cell.capture { box-shadow:inset 0 0 0 9999px rgba(217,48,37,.08); }

        .chart-box { position:absolute; left:calc(var(--row-head-w) + 11 * var(--col-w)); top:calc(11 * var(--row-h)); width:calc(4.3 * var(--col-w)); height:calc(10.5 * var(--row-h)); background:#fff; padding:10px 8px; pointer-events:none; }
        .chart-svg { width:100%; height:100%; }

        .tab { min-width:92px; height:28px; border-radius:14px 14px 0 0; display:flex; align-items:center; justify-content:center; padding:0 12px; font-size:13px; color:var(--muted); background:#f8f9fa; }
        .tab.active { background:#e8f0fe; color:#174ea6; font-weight:600; }
        .status-chip { display:inline-flex; align-items:center; gap:8px; height:24px; padding:0 10px; border-radius:999px; background:#eef3fd; color:#174ea6; font-size:12px; margin-left:8px; }
      `}</style>

      {screen === "splash" ? (
        <section className="splash">
          <div className="splash-card">
            <h1>Workbook Access</h1>
            <p>Open a disguised worksheet interface containing a locally stored strategy session. This version supports click-to-move, automatic queen promotion, board flip for black, browser resume, and engine-backed play.</p>

            <div className="panel-row">
              <div className="panel">
                <h2>Session Options</h2>
                <div className="field">
                  <label>Theme Bias</label>
                  <select value={playerColor} onChange={(e) => setPlayerColor(e.target.value)}>
                    <option value="white">PLA / Light Side</option>
                    <option value="black">OPP / Dark Side</option>
                  </select>
                </div>
                <div className="field">
                  <label>Calc Depth</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="button-row">
                  <button className="primary-btn" onClick={startNewGame}>Open Workbook</button>
                  {hasSave && <button className="ghost-btn" onClick={resumeGame}>Resume Workbook</button>}
                  {hasSave && <button className="danger-btn" onClick={resetLocalState}>Reset Local State</button>}
                </div>
              </div>

              <div className="panel">
                <h2>Reference</h2>
                <ul className="help-list">
                  <li>Click one coded unit, then click a legal destination.</li>
                  <li>Promotion automatically converts to queen.</li>
                  <li>Current state is stored in this browser only.</li>
                  <li>Calc Depth runs from 1 to 10.</li>
                  <li>Everything outside the hidden board is decorative.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="app">
          <div className="topbar">
            <div className="topbar-line1">
              <div className="sheet-logo" />
              <div className="doc-name">Meeting_Essentials_Ch2</div>
              <div className="saved-text">{engineReady ? "Saved to Drive" : "Engine initializing..."}</div>
              <div className="spacer" />
              <button className="share-btn">Share</button>
              <div className="avatar" />
            </div>
            <div className="topbar-line2">
              {["File","Edit","View","Insert","Format","Data","Tools","Extensions","Help"].map((m) => (
                <div key={m} className="menu-item">{m}</div>
              ))}
              <div className="spacer" />
            </div>
          </div>

          <div className="menu-row">
            <div className="tool-item">Menus</div>
            <div className="tool-item">100%</div>
            <div className="tool-item">Default</div>
            <div className="tool-item">10</div>
            <div className="tool-item">B</div>
            <div className="tool-item">I</div>
            <div className="tool-item">A</div>
            <div className="tool-item">∑</div>
            <div className="spacer" />
            <button className="ghost-btn" style={{ height: 28, padding: "0 12px" }} onClick={() => setScreen("splash")}>
              Close Workbook
            </button>
            <button className="ghost-btn" style={{ height: 28, padding: "0 12px" }} onClick={startNewGame}>
              Initialize Sheet
            </button>
            <span className="status-chip">
              {engineBusy ? "Calc: Running" : statusText}
            </span>
          </div>

          <div className="formula-row">
            <div className="name-box">{activeName}</div>
            <div className="formula-fx">fx</div>
            <div className="formula-box">{formulaText}</div>
          </div>

          <div className="grid-wrap">
            <div className="sheet-grid">
              <div className="corner" />
              {COLS.map((col) => {
                const active = selectedCell && selectedCell.startsWith(col);
                return (
                  <div key={col} className={`col-header ${active ? "active-header" : ""}`}>
                    {col}
                  </div>
                );
              })}

              {ROWS.map((row) => (
                <React.Fragment key={row}>
                  <div
                    className={`row-header ${
                      selectedCell && Number(selectedCell.match(/\\d+/)?.[0]) === row ? "active-header" : ""
                    }`}
                  >
                    {row}
                  </div>

                  {COLS.map((col) => {
                    const cellId = getCellId(col, row);
                    const staticCell = staticData.get(cellId);
                    const boardCell = isBoardCell(col, row);
                    const square = boardCell ? spreadsheetToChess(col, row, orientation) : null;
                    const piece = boardCell ? game.get(square) : null;
                    const target = legalTargets.find((m) => boardCell && m.to === square);
                    const x = boardCell ? colToIndex(col) - colToIndex(BOARD_RANGE.startCol) : 0;
                    const y = boardCell ? row - BOARD_RANGE.startRow : 0;

                    const classes = ["cell"];
                    if (staticCell?.className) classes.push(...staticCell.className.split(" "));
                    if (boardCell) classes.push((x + y) % 2 === 0 ? "board-dark" : "board-light");
                    if (piece) classes.push(piece.color === "w" ? "piece-pla" : "piece-opp");
                    if (selectedCell === cellId) classes.push("selected");
                    if (target) classes.push(target.captured ? "capture" : "legal");

                    const text = piece ? displayLabel(game, piece, square) : staticCell?.text || "";

                    return (
                      <div
                        key={cellId}
                        className={classes.join(" ")}
                        onClick={boardCell ? () => onBoardCellClick(col, row) : undefined}
                      >
                        {text}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}

              <div className="chart-box">
                <svg className="chart-svg" viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg">
                  <text x="210" y="18" textAnchor="middle" fontSize="14" fontWeight="700" fill="#202124">
                    % Partially Proficient in 3rd Grade Reading
                  </text>
                  <g fontSize="11" fill="#202124">
                    <text x="30" y="62">81 to 100</text>
                    <text x="30" y="102">61 to 80</text>
                    <text x="30" y="142">41 to 60</text>
                    <text x="30" y="182">21 to 40</text>
                    <text x="30" y="222">11 to 20</text>
                    <text x="30" y="242">0 to 10</text>
                  </g>
                  <g stroke="#dadce0" strokeWidth="1">
                    <line x1="90" y1="40" x2="390" y2="40"/>
                    <line x1="90" y1="80" x2="390" y2="80"/>
                    <line x1="90" y1="120" x2="390" y2="120"/>
                    <line x1="90" y1="160" x2="390" y2="160"/>
                    <line x1="90" y1="200" x2="390" y2="200"/>
                    <line x1="90" y1="230" x2="390" y2="230"/>
                    <line x1="90" y1="30" x2="90" y2="230"/>
                    <line x1="150" y1="30" x2="150" y2="230"/>
                    <line x1="210" y1="30" x2="210" y2="230"/>
                    <line x1="270" y1="30" x2="270" y2="230"/>
                    <line x1="330" y1="30" x2="330" y2="230"/>
                    <line x1="390" y1="30" x2="390" y2="230"/>
                  </g>
                  <g>
                    <rect x="90" y="43" width="280" height="11" fill="#c65c56"/>
                    <rect x="90" y="56" width="252" height="11" fill="#5b8cc7"/>
                    <rect x="90" y="83" width="252" height="11" fill="#c65c56"/>
                    <rect x="90" y="96" width="232" height="11" fill="#5b8cc7"/>
                    <rect x="90" y="123" width="200" height="11" fill="#c65c56"/>
                    <rect x="90" y="136" width="170" height="11" fill="#5b8cc7"/>
                    <rect x="90" y="163" width="170" height="11" fill="#c65c56"/>
                    <rect x="90" y="176" width="138" height="11" fill="#5b8cc7"/>
                    <rect x="90" y="203" width="130" height="11" fill="#c65c56"/>
                    <rect x="90" y="216" width="110" height="11" fill="#5b8cc7"/>
                  </g>
                  <g fontSize="11" fill="#202124">
                    <text x="270" y="236">% Partially Proficient</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div className="tabs">
            <div className="tool-item">+</div>
            <div className="tool-item">☰</div>
            <div className="tab active">Sheet1</div>
          </div>
        </section>
      )}
    </div>
  );
}