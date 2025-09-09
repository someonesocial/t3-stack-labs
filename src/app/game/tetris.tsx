"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

// Board dimensions
const COLS = 10;
const ROWS = 20;
const VISIBLE_ROWS = 20;

// Tetromino shapes (matrix of 1s)
const SHAPES: Record<string, number[][]> = {
  I: [ [1,1,1,1],[0,0,0,0] ],
  O: [ [1,1],[1,1] ],
  T: [ [1,1,1],[0,1,0] ],
  S: [ [0,1,1],[1,1,0] ],
  Z: [ [1,1,0],[0,1,1] ],
  J: [ [1,0,0],[1,1,1] ],
  L: [ [0,0,1],[1,1,1] ],
};

const COLORS: Record<string,string> = {
  I: "from-cyan-400 to-cyan-600",
  O: "from-amber-300 to-amber-500",
  T: "from-fuchsia-400 to-fuchsia-600",
  S: "from-emerald-400 to-emerald-600",
  Z: "from-rose-400 to-rose-600",
  J: "from-indigo-400 to-indigo-600",
  L: "from-orange-400 to-orange-600",
};

interface ActivePiece {
  shape: number[][];
  type: string;
  row: number;
  col: number;
}

function rotate(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0]!.length;
  const rotated: number[][] = [];
  for (let c=0;c<cols;c++) {
    const newRow: number[] = [];
    for (let r=rows-1;r>=0;r--) newRow.push(shape[r]![c]!);
    rotated.push(newRow);
  }
  return rotated;
}

function randomBag(): string[] {
  const types = Object.keys(SHAPES);
  for (let i = types.length -1; i>0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [types[i], types[j]] = [types[j]!, types[i]!];
  }
  return types;
}

function createBoard(): (string | null)[][] {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null as string | null));
}

function cloneBoard(b: (string|null)[][]): (string|null)[][] {
  return b.map((r): (string|null)[] => r.slice());
}

function canPlace(board:(string|null)[][], piece:ActivePiece): boolean {
  for (let r=0;r<piece.shape.length;r++) {
    for (let c=0;c<piece.shape[r]!.length;c++) {
      if (!piece.shape[r]![c]) continue;
      const br = piece.row + r;
      const bc = piece.col + c;
      if (br < 0 || br >= ROWS || bc < 0 || bc >= COLS) return false;
      if (board[br]![bc]) return false;
    }
  }
  return true;
}

function merge(board:(string|null)[][], piece:ActivePiece): (string|null)[][] {
  const next = cloneBoard(board);
  for (let r=0;r<piece.shape.length;r++) {
    for (let c=0;c<piece.shape[r]!.length;c++) {
      if (piece.shape[r]![c]) {
        next[piece.row + r]![piece.col + c] = piece.type;
      }
    }
  }
  return next;
}

function clearLines(board:(string|null)[][]): { board:(string|null)[][]; cleared:number } {
  const remain = board.filter(row => row.some(cell => !cell));
  const cleared = ROWS - remain.length;
  while (remain.length < ROWS) remain.unshift(Array<string|null>(COLS).fill(null));
  return { board: remain, cleared };
}

export default function Tetris() {
  const [board, setBoard] = useState<(string|null)[][]>(() => createBoard());
  const [bag, setBag] = useState<string[]>(() => randomBag());
  const [nextBag, setNextBag] = useState<string[]>(() => randomBag());
  const [piece, setPiece] = useState<ActivePiece>(() => {
    const type = bag[0]!;
    return { shape: SHAPES[type]!, type, row: 0, col: 3 };
  });
  const [tickMs, setTickMs] = useState(750);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [running, setRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const loopRef = useRef<number | null>(null);
  const lastTime = useRef<number>(0);

  // Upcoming pieces (exclude current). Always take next 5 across remaining bag then nextBag.
  const queue = useMemo<string[]>(() => {
    const upcoming = bag.slice(1).concat(nextBag);
    return upcoming.slice(0, 5);
  }, [bag, nextBag]);

  const spawnNext = useCallback((currentBoard: (string|null)[][]) => {
    let b = bag.slice(1);
    let nb = nextBag;
    if (b.length === 0) {
      b = nb;
      nb = randomBag();
      setNextBag(nb);
    }
    const type = b[0]! || nb[0]!;
    const candidate: ActivePiece = { shape: SHAPES[type]!, type, row: 0, col: 3 };
    // If cannot place new piece -> game over
    if (!canPlace(currentBoard, candidate)) {
      setGameOver(true);
      setRunning(false);
      return false;
    }
    setBag(b);
    setPiece(candidate);
    return true;
  }, [bag, nextBag]);

  const lock = useCallback((p:ActivePiece) => {
    const merged = merge(board, p);
    const { board: clearedBoard, cleared } = clearLines(merged);
    if (cleared) {
      setScore(s => s + cleared * 100);
      setLines(l => l + cleared);
    }
    setBoard(clearedBoard);
    spawnNext(clearedBoard);
  }, [board, spawnNext]);

  const hardDrop = useCallback(() => {
    const p: ActivePiece = { ...piece };
    while (canPlace(board, { ...p, row: p.row + 1 })) p.row++;
    lock(p);
  }, [piece, board, lock]);

  const step = useCallback(() => {
    if (!running || gameOver) return;
    const next = { ...piece, row: piece.row + 1 };
    if (canPlace(board, next)) {
      setPiece(next);
    } else {
      lock(piece);
    }
  }, [piece, board, lock, running, gameOver]);

  // Game loop
  useEffect(() => {
    function frame(time: number) {
      if (!lastTime.current) lastTime.current = time;
      if (time - lastTime.current > tickMs) {
        step();
        lastTime.current = time;
      }
      loopRef.current = requestAnimationFrame(frame);
    }
    loopRef.current = requestAnimationFrame(frame);
    return () => { if (loopRef.current) cancelAnimationFrame(loopRef.current); };
  }, [step, tickMs]);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!running || gameOver) return;
      if (e.key === "ArrowLeft") {
        const next = { ...piece, col: piece.col - 1 };
        if (canPlace(board, next)) setPiece(next);
      } else if (e.key === "ArrowRight") {
        const next = { ...piece, col: piece.col + 1 };
        if (canPlace(board, next)) setPiece(next);
      } else if (e.key === "ArrowDown") {
        const next = { ...piece, row: piece.row + 1 };
        if (canPlace(board, next)) setPiece(next); else lock(piece);
      } else if (e.key === "ArrowUp" || e.key === "x") {
        const rotated = rotate(piece.shape);
        const next = { ...piece, shape: rotated };
        if (canPlace(board, next)) setPiece(next);
      } else if (e.key === " ") {
        hardDrop();
      } else if (e.key === "p") {
        setRunning(r => !r);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [piece, board, lock, hardDrop, running, gameOver]);

  // Ghost piece
  const ghost = useMemo(() => {
    const g: ActivePiece = { ...piece };
    while (canPlace(board, { ...g, row: g.row + 1 })) g.row++;
    return g;
  }, [piece, board]);

  const displayBoard = useMemo(() => {
    const temp = cloneBoard(board);
    // place ghost (light)
    for (let r=0;r<ghost.shape.length;r++) {
      for (let c=0;c<ghost.shape[r]!.length;c++) {
        if (ghost.shape[r]![c]) {
          const gr = ghost.row + r; const gc = ghost.col + c;
          if (gr >=0 && gr < ROWS && gc>=0 && gc<COLS && !temp[gr]![gc]) temp[gr]![gc] = "ghost:"+piece.type;
        }
      }
    }
    // place active piece
    for (let r=0;r<piece.shape.length;r++) {
      for (let c=0;c<piece.shape[r]!.length;c++) {
        if (piece.shape[r]![c]) temp[piece.row + r]![piece.col + c] = piece.type;
      }
    }
  return temp.slice(0, VISIBLE_ROWS).map((row) => row.slice());
  }, [board, piece, ghost]);

  const reset = () => {
    setBoard(createBoard());
    setBag(randomBag());
    setNextBag(randomBag());
    setScore(0);
    setLines(0);
    setPiece({ shape: SHAPES[Object.keys(SHAPES)[0]!]!, type: Object.keys(SHAPES)[0]!, row: 0, col: 3 });
    setRunning(true);
    setGameOver(false);
  };

  // Helpers for on-screen controls
  const attempt = (next: ActivePiece) => { if (canPlace(board, next)) setPiece(next); };
  const move = (dx: number) => attempt({ ...piece, col: piece.col + dx });
  const softDrop = () => {
    const next = { ...piece, row: piece.row + 1 };
    if (canPlace(board, next)) setPiece(next); else lock(piece);
  };
  const rotateCW = () => {
    const rotated = rotate(piece.shape);
    attempt({ ...piece, shape: rotated });
  };

  return (
    <div className="flex flex-col gap-10 md:flex-row">
      <div className="glass relative rounded-xl p-4">
        <div className="grid grid-cols-10 gap-[3px]">
          {displayBoard.map((row, rIdx) => (
            <React.Fragment key={rIdx}>
              {row.map((cell, cIdx) => {
                if (!cell) {
                  return (
                    <div
                      key={cIdx}
                      className={clsx(
                        "aspect-square w-6 rounded-sm border border-white/5 bg-black/40"
                      )}
                    />
                  );
                }
                const isGhost = cell.startsWith("ghost:");
                const type = isGhost ? cell.split(":")[1]! : cell;
                return (
                  <div
                    key={cIdx}
                    className={clsx(
                      "aspect-square w-6 rounded-sm border border-white/5 bg-black/40",
                      cell && !isGhost && "shadow-inner",
                      cell && type && !isGhost && `bg-gradient-to-br ${COLORS[type]} drop-shadow` ,
                      isGhost && type && `bg-gradient-to-br ${COLORS[type]} opacity-20`
                    )}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10" />
        {gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-xl bg-black/70 p-6 text-center">
            <h2 className="text-2xl font-bold text-white">Game Over</h2>
            <p className="text-sm text-white/60">Score: <span className="text-white font-semibold">{score}</span> · Lines: <span className="text-white font-semibold">{lines}</span></p>
            <div className="flex gap-3">
              <button onClick={reset} className="glass-hover rounded-md border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium text-white">Play Again</button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-6">
        <div className="glass rounded-xl p-4">
          <h2 className="mb-2 text-lg font-semibold">Stats</h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
            <div>Score</div><div className="text-right text-white">{score}</div>
            <div>Lines</div><div className="text-right text-white">{lines}</div>
            <div>Speed</div><div className="text-right text-white">{(1000/tickMs).toFixed(2)} /s</div>
            <div>State</div><div className="text-right text-white">{running?"Running":"Paused"}</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={()=>setTickMs(m=>Math.max(150, m-100))} className="glass-hover rounded-md border border-white/20 bg-white/5 px-3 py-1 text-xs">Faster</button>
            <button onClick={()=>setTickMs(m=>Math.min(1200, m+100))} className="glass-hover rounded-md border border-white/20 bg-white/5 px-3 py-1 text-xs">Slower</button>
            <button onClick={()=>!gameOver && setRunning(r=>!r)} disabled={gameOver} className="glass-hover rounded-md border border-white/20 bg-white/5 px-3 py-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed">{running?"Pause":"Resume"}</button>
            <button onClick={reset} className="glass-hover rounded-md border border-white/20 bg-white/5 px-3 py-1 text-xs">Reset</button>
            <button onClick={hardDrop} className="glass-hover rounded-md border border-white/20 bg-white/5 px-3 py-1 text-xs">Hard Drop</button>
          </div>
          <p className="mt-4 text-xs text-white/50">Controls: ← → move, ↑ rotate, ↓ soft drop, Space hard drop, P pause.</p>
          <div className="mt-5 flex flex-col items-center gap-3">
            <div className="flex gap-2">
              <button onClick={rotateCW} disabled={gameOver} className="glass-hover rounded-md border border-white/20 bg-white/5 px-4 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed">Rotate</button>
              <button onClick={softDrop} disabled={gameOver} className="glass-hover rounded-md border border-white/20 bg-white/5 px-4 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed">Soft ↓</button>
              <button onClick={hardDrop} disabled={gameOver} className="glass-hover rounded-md border border-white/20 bg-white/5 px-4 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed">Hard ↓</button>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={()=>move(-1)} disabled={gameOver} className="glass-hover rounded-md border border-white/20 bg-white/5 px-4 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed">←</button>
              <button onClick={()=>move(1)} disabled={gameOver} className="glass-hover rounded-md border border-white/20 bg-white/5 px-4 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed">→</button>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <h2 className="mb-2 text-lg font-semibold">Next Pieces</h2>
          <div className="flex gap-4">
            {queue.map((t,i)=> {
              const shape = SHAPES[t]!;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="flex flex-col gap-[2px] p-1">
                    {shape.map((row,r) => (
                      <div key={r} className="flex gap-[2px]">
                        {row.map((cell,c)=>(
                          <div
                            key={c}
                            className={clsx(
                              "h-[14px] w-[14px] rounded-[2px] bg-black/40",
                              cell && `bg-gradient-to-br ${COLORS[t]}`
                            )}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-white/60">{t}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
