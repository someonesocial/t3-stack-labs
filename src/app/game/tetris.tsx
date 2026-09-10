"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import { api } from "~/trpc/react";

const COLS = 10;
const ROWS = 20;
const VISIBLE_ROWS = 20;
const LINES_PER_LEVEL = 30;
const LINES_PER_DINO = 20;
const LINE_SCORES = [0, 100, 300, 900, 2700];

const SHAPES: Record<string, number[][]> = {
  I: [[1, 1, 1, 1], [0, 0, 0, 0]],
  O: [[1, 1], [1, 1]],
  T: [[1, 1, 1], [0, 1, 0]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};

const COLORS: Record<string, string> = {
  I: "from-cyan-400 to-cyan-600",
  O: "from-amber-300 to-amber-500",
  T: "from-fuchsia-400 to-fuchsia-600",
  S: "from-emerald-400 to-emerald-600",
  Z: "from-rose-400 to-rose-600",
  J: "from-indigo-400 to-indigo-600",
  L: "from-orange-400 to-orange-600",
};

const DINO_SPRITE = [
  [0, 1, 1, 1, 1, 0],
  [0, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1],
  [0, 1, 0, 0, 1, 0],
];

const ACHIEVEMENTS: Record<string, { label: string; desc: string; icon: string }> = {
  "first-line": { label: "First Blood", desc: "Erste Line cleared", icon: "\u{1F4A5}" },
  triple: { label: "Triple Threat", desc: "3 Lines auf einmal", icon: "\u{1F525}" },
  tetris: { label: "TETRIS!", desc: "4 Lines auf einmal", icon: "\u{26A1}" },
  "speed-2": { label: "Warming Up", desc: "Level 2 erreicht", icon: "\u{1F680}" },
  "speed-4": { label: "Speed Demon", desc: "Level 4 erreicht", icon: "\u{1F4A8}" },
  "dino-unleashed": { label: "Dino Power", desc: "Den Dino entfesselt", icon: "\u{1F996}" },
  "high-roller": { label: "High Roller", desc: "5.000 Punkte", icon: "\u{1F4B0}" },
  legend: { label: "Legende", desc: "20.000 Punkte", icon: "\u{1F451}" },
};

interface ActivePiece {
  shape: number[][];
  type: string;
  row: number;
  col: number;
}
interface ScorePopup {
  id: number;
  points: number;
  y: number;
  label: string;
}
interface AchievementToast {
  id: string;
  label: string;
  desc: string;
  icon: string;
}

function rotate(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0]!.length;
  const rotated: number[][] = [];
  for (let c = 0; c < cols; c++) {
    const newRow: number[] = [];
    for (let r = rows - 1; r >= 0; r--) newRow.push(shape[r]![c]!);
    rotated.push(newRow);
  }
  return rotated;
}

function randomBag(): string[] {
  const types = Object.keys(SHAPES);
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j]!, types[i]!];
  }
  return types;
}

function createBoard(): (string | null)[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => null as string | null),
  );
}

function cloneBoard(b: (string | null)[][]): (string | null)[][] {
  return b.map((r): (string | null)[] => r.slice());
}

function canPlace(board: (string | null)[][], piece: ActivePiece): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r]!.length; c++) {
      if (!piece.shape[r]![c]) continue;
      const br = piece.row + r;
      const bc = piece.col + c;
      if (br < 0 || br >= ROWS || bc < 0 || bc >= COLS) return false;
      if (board[br]![bc]) return false;
    }
  }
  return true;
}

function merge(
  board: (string | null)[][],
  piece: ActivePiece,
): (string | null)[][] {
  const next = cloneBoard(board);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r]!.length; c++) {
      if (piece.shape[r]![c]) {
        next[piece.row + r]![piece.col + c] = piece.type;
      }
    }
  }
  return next;
}

function clearLines(
  board: (string | null)[][],
): { board: (string | null)[][]; cleared: number } {
  const remain = board.filter((row) => row.some((cell) => !cell));
  const cleared = ROWS - remain.length;
  while (remain.length < ROWS)
    remain.unshift(Array<string | null>(COLS).fill(null));
  return { board: remain, cleared };
}

export default function Tetris() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [board, setBoard] = useState<(string | null)[][]>(() => createBoard());
  const [bag, setBag] = useState<string[]>(() => randomBag());
  const [nextBag, setNextBag] = useState<string[]>(() => randomBag());
  const [piece, setPiece] = useState<ActivePiece>(() => {
    const type = bag[0]!;
    return { shape: SHAPES[type]!, type, row: 0, col: 3 };
  });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [running, setRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const [dinosUsed, setDinosUsed] = useState(0);
  const [dinoActive, setDinoActive] = useState(false);
  const [dinoCol, setDinoCol] = useState(-6);
  const dinoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [achievementToasts, setAchievementToasts] = useState<AchievementToast[]>([]);
  const [playerName, setPlayerName] = useState("anonymous");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const loopRef = useRef<number | null>(null);
  const lastTime = useRef<number>(0);
  const justLocked = useRef(false);
  const popupIdRef = useRef(0);
  const achievedRef = useRef(new Set<string>());
  const playerNameRef = useRef("anonymous");

  const level = Math.floor(lines / LINES_PER_LEVEL) + 1;
  const tickMs = Math.max(80, 750 - (level - 1) * 75);
  const dinoCharges = Math.max(
    0,
    Math.floor(lines / LINES_PER_DINO) - dinosUsed,
  );

  const sendChat = api.chat.send.useMutation();
  const submitScoreMut = api.score.submit.useMutation();
  const topScores = api.score.top.useQuery({ limit: 10 });

  const sendChatRef = useRef(sendChat.mutate);
  sendChatRef.current = sendChat.mutate;
  const submitScoreRef = useRef(submitScoreMut.mutateAsync);
  submitScoreRef.current = submitScoreMut.mutateAsync;

  const queue = useMemo<string[]>(
    () => bag.slice(1).concat(nextBag).slice(0, 5),
    [bag, nextBag],
  );

  // ── Helpers ──

  const addScorePopup = useCallback(
    (points: number, row: number, cleared: number) => {
      const id = popupIdRef.current++;
      const label =
        cleared >= 4
          ? "TETRIS!"
          : cleared >= 3
            ? "TRIPLE!"
            : cleared >= 2
              ? "DOUBLE!"
              : "";
      const y = 16 + row * 27;
      setScorePopups((prev) => [...prev, { id, points, y, label }]);
      setTimeout(
        () => setScorePopups((prev) => prev.filter((p) => p.id !== id)),
        1500,
      );
    },
    [],
  );

  const triggerAchievement = useCallback((id: string) => {
    if (achievedRef.current.has(id)) return;
    const ach = ACHIEVEMENTS[id];
    if (!ach) return;
    achievedRef.current.add(id);
    setAchievementToasts((prev) => [...prev, { id, ...ach }]);
    setTimeout(
      () => setAchievementToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
    if (["tetris", "dino-unleashed", "legend"].includes(id)) {
      sendChatRef.current({
        content: `${ach.icon} ${playerNameRef.current} — ${ach.label}: ${ach.desc}!`,
        author: "\u{1F3AE} Tetris",
      });
    }
  }, []);

  // ── Core game logic ──

  const spawnNext = useCallback(
    (currentBoard: (string | null)[][]) => {
      let b = bag.slice(1);
      let nb = nextBag;
      if (b.length === 0) {
        b = nb;
        nb = randomBag();
        setNextBag(nb);
      }
      const type = b[0]! || nb[0]!;
      const candidate: ActivePiece = {
        shape: SHAPES[type]!,
        type,
        row: 0,
        col: 3,
      };
      if (!canPlace(currentBoard, candidate)) {
        setGameOver(true);
        setRunning(false);
        return false;
      }
      setBag(b);
      setPiece(candidate);
      return true;
    },
    [bag, nextBag],
  );

  const lock = useCallback(
    (p: ActivePiece) => {
      if (justLocked.current) return;
      justLocked.current = true;
      const merged = merge(board, p);
      const { board: clearedBoard, cleared } = clearLines(merged);
      if (cleared) {
        const lvl = Math.floor(lines / LINES_PER_LEVEL) + 1;
        const points = (LINE_SCORES[cleared] ?? cleared * 100) * lvl;
        setScore((s) => s + points);
        setLines((l) => l + cleared);
        addScorePopup(
          points,
          p.row + Math.floor(p.shape.length / 2),
          cleared,
        );
        if (cleared >= 4) triggerAchievement("tetris");
        else if (cleared >= 3) triggerAchievement("triple");
        if (lines === 0) triggerAchievement("first-line");
      }
      setBoard(clearedBoard);
      const spawned = spawnNext(clearedBoard);
      if (spawned) {
        queueMicrotask(() => {
          justLocked.current = false;
        });
      }
    },
    [board, spawnNext, lines, addScorePopup, triggerAchievement],
  );

  const hardDrop = useCallback(() => {
    const p: ActivePiece = { ...piece };
    let dropDist = 0;
    while (canPlace(board, { ...p, row: p.row + 1 })) {
      p.row++;
      dropDist++;
    }
    setScore((s) => s + dropDist * 2);
    lock(p);
  }, [piece, board, lock]);

  const step = useCallback(() => {
    if (!running || gameOver || dinoActive) return;
    const next = { ...piece, row: piece.row + 1 };
    if (canPlace(board, next)) {
      setPiece(next);
    } else {
      lock(piece);
    }
  }, [piece, board, lock, running, gameOver, dinoActive]);

  // ── Dino ──

  const activateDino = useCallback(() => {
    if (dinoCharges <= 0 || dinoActive || gameOver || !running) return;
    setDinosUsed((d) => d + 1);
    setDinoActive(true);
    setDinoCol(-DINO_SPRITE[0]!.length);
    triggerAchievement("dino-unleashed");

    const capturedLevel = level;
    let col = -DINO_SPRITE[0]!.length;
    dinoIntervalRef.current = setInterval(() => {
      col++;
      setDinoCol(col);
      if (col > COLS + 2) {
        if (dinoIntervalRef.current) clearInterval(dinoIntervalRef.current);
        dinoIntervalRef.current = null;
        setBoard((prev) => {
          const nb = cloneBoard(prev);
          nb.splice(ROWS - DINO_SPRITE.length, DINO_SPRITE.length);
          for (let i = 0; i < DINO_SPRITE.length; i++) {
            nb.unshift(Array<string | null>(COLS).fill(null));
          }
          return nb;
        });
        setDinoActive(false);
        const bonus = DINO_SPRITE.length * 200 * capturedLevel;
        setScore((s) => s + bonus);
        addScorePopup(bonus, ROWS - DINO_SPRITE.length, 0);
      }
    }, 70);
  }, [dinoCharges, dinoActive, gameOver, running, level, addScorePopup, triggerAchievement]);

  // ── Effects ──

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
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [step, tickMs]);

  useEffect(() => {
    if (
      containerRef.current &&
      !(
        document.activeElement instanceof HTMLElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA" ||
          document.activeElement.isContentEditable)
      )
    ) {
      containerRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const match = document.cookie.match(/chat-author=([^;]+)/);
    if (match?.[1]) {
      const name = decodeURIComponent(match[1]);
      setPlayerName(name);
      playerNameRef.current = name;
    }
  }, []);

  useEffect(() => {
    playerNameRef.current = playerName;
    document.cookie = `chat-author=${encodeURIComponent(playerName)};max-age=31536000;path=/`;
  }, [playerName]);

  useEffect(() => {
    if (level >= 2) triggerAchievement("speed-2");
    if (level >= 4) triggerAchievement("speed-4");
    if (score >= 5000) triggerAchievement("high-roller");
    if (score >= 20000) triggerAchievement("legend");
  }, [level, score, triggerAchievement]);

  useEffect(() => {
    if (!gameOver || score === 0 || scoreSubmitted) return;
    setScoreSubmitted(true);
    submitScoreRef
      .current({
        player: playerNameRef.current || "anonymous",
        score,
        lines,
        level,
      })
      .then(() => topScores.refetch())
      .catch(() => {});
  }, [gameOver, score, lines, level, scoreSubmitted, topScores]);

  useEffect(() => {
    return () => {
      if (dinoIntervalRef.current) clearInterval(dinoIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable)
      )
        return;

      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (!gameOver && !dinoActive) setRunning((r) => !r);
        return;
      }

      if (!running || gameOver || justLocked.current || dinoActive) return;

      const controlKeys = [
        "ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp",
        "a", "A", "d", "D", "s", "S", "w", "W",
        "x", " ", "q", "Q",
      ];
      if (!controlKeys.includes(e.key)) return;
      e.preventDefault();

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        const next = { ...piece, col: piece.col - 1 };
        if (canPlace(board, next)) setPiece(next);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        const next = { ...piece, col: piece.col + 1 };
        if (canPlace(board, next)) setPiece(next);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        const next = { ...piece, row: piece.row + 1 };
        if (canPlace(board, next)) {
          setPiece(next);
          setScore((s) => s + 1);
        } else {
          lock(piece);
        }
      } else if (
        e.key === "ArrowUp" ||
        e.key === "w" ||
        e.key === "W" ||
        e.key === "x"
      ) {
        const rotated = rotate(piece.shape);
        const next = { ...piece, shape: rotated };
        if (canPlace(board, next)) setPiece(next);
      } else if (e.key === " ") {
        hardDrop();
      } else if (e.key === "q" || e.key === "Q") {
        activateDino();
      }
    }
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [piece, board, lock, hardDrop, running, gameOver, dinoActive, activateDino]);

  // ── Display ──

  const ghost = useMemo(() => {
    const g: ActivePiece = { ...piece };
    while (canPlace(board, { ...g, row: g.row + 1 })) g.row++;
    return g;
  }, [piece, board]);

  const displayBoard = useMemo(() => {
    const temp = cloneBoard(board);

    if (dinoActive) {
      for (let c = 0; c <= Math.min(dinoCol, COLS - 1); c++) {
        if (c < 0) continue;
        for (let r = ROWS - DINO_SPRITE.length; r < ROWS; r++) {
          temp[r]![c] = null;
        }
      }
      const dinoStartRow = ROWS - DINO_SPRITE.length;
      for (let r = 0; r < DINO_SPRITE.length; r++) {
        for (let c = 0; c < DINO_SPRITE[r]!.length; c++) {
          if (DINO_SPRITE[r]![c]) {
            const br = dinoStartRow + r;
            const bc = dinoCol + c;
            if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) {
              temp[br]![bc] = "dino";
            }
          }
        }
      }
    }

    if (!dinoActive) {
      for (let r = 0; r < ghost.shape.length; r++) {
        for (let c = 0; c < ghost.shape[r]!.length; c++) {
          if (ghost.shape[r]![c]) {
            const gr = ghost.row + r;
            const gc = ghost.col + c;
            if (gr >= 0 && gr < ROWS && gc >= 0 && gc < COLS && !temp[gr]![gc])
              temp[gr]![gc] = "ghost:" + piece.type;
          }
        }
      }
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r]!.length; c++) {
          if (piece.shape[r]![c]) {
            const pr = piece.row + r;
            const pc = piece.col + c;
            if (pr >= 0 && pr < ROWS && pc >= 0 && pc < COLS)
              temp[pr]![pc] = piece.type;
          }
        }
      }
    }

    return temp.slice(0, VISIBLE_ROWS).map((row) => row.slice());
  }, [board, piece, ghost, dinoActive, dinoCol]);

  // ── Reset ──

  const reset = useCallback(() => {
    if (dinoIntervalRef.current) {
      clearInterval(dinoIntervalRef.current);
      dinoIntervalRef.current = null;
    }
    const newBag = randomBag();
    setBoard(createBoard());
    setBag(newBag);
    setNextBag(randomBag());
    setScore(0);
    setLines(0);
    const type = newBag[0]!;
    setPiece({ shape: SHAPES[type]!, type, row: 0, col: 3 });
    setRunning(true);
    setGameOver(false);
    setDinosUsed(0);
    setDinoActive(false);
    setDinoCol(-6);
    setScorePopups([]);
    setAchievementToasts([]);
    setScoreSubmitted(false);
    achievedRef.current = new Set();
    justLocked.current = false;
  }, []);

  const attempt = (next: ActivePiece) => {
    if (!justLocked.current && !dinoActive && canPlace(board, next))
      setPiece(next);
  };
  const moveDir = (dx: number) => attempt({ ...piece, col: piece.col + dx });
  const softDrop = () => {
    if (justLocked.current || dinoActive) return;
    const next = { ...piece, row: piece.row + 1 };
    if (canPlace(board, next)) {
      setPiece(next);
      setScore((s) => s + 1);
    } else {
      lock(piece);
    }
  };
  const rotateCW = () => {
    if (justLocked.current || dinoActive) return;
    attempt({ ...piece, shape: rotate(piece.shape) });
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-6 lg:flex-row outline-none"
      tabIndex={0}
      role="application"
      aria-label="Tetris game. Arrow keys or WASD to move, Space for hard drop, Q for dino, P to pause."
      onClick={() => containerRef.current?.focus()}
    >
      {/* ── Board ── */}
      <div className="glass relative rounded-xl p-4">
        <div className="grid grid-cols-10 gap-[3px]">
          {displayBoard.map((row, rIdx) => (
            <React.Fragment key={rIdx}>
              {row.map((cell, cIdx) => {
                if (!cell) {
                  return (
                    <div
                      key={cIdx}
                      className="aspect-square w-6 rounded-sm border border-white/5 bg-black/40"
                    />
                  );
                }
                if (cell === "dino") {
                  return (
                    <div
                      key={cIdx}
                      className="aspect-square w-6 rounded-sm border border-green-400/40 bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30"
                      style={{
                        animation: "dinoCell 0.15s ease-in-out infinite alternate",
                      }}
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
                      !isGhost && "shadow-inner",
                      !isGhost &&
                        `bg-gradient-to-br ${COLORS[type]} drop-shadow`,
                      isGhost &&
                        `bg-gradient-to-br ${COLORS[type]} opacity-20`,
                    )}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Score popups */}
        {scorePopups.map((popup) => (
          <div
            key={popup.id}
            className="pointer-events-none absolute left-1/2 z-20"
            style={{
              top: `${popup.y}px`,
              animation: "scoreFloat 1.4s ease-out forwards",
            }}
          >
            <div
              className={clsx(
                "font-black tracking-tight whitespace-nowrap",
                popup.points >= 2700
                  ? "text-3xl text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]"
                  : popup.points >= 900
                    ? "text-2xl text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                    : popup.points >= 300
                      ? "text-xl text-cyan-300"
                      : "text-lg text-white",
              )}
            >
              +{popup.points.toLocaleString()}
            </div>
            {popup.label && (
              <div className="text-center text-xs font-bold text-white/90">
                {popup.label}
              </div>
            )}
          </div>
        ))}

        {/* Achievement toasts */}
        <div className="absolute right-2 top-2 z-20 flex flex-col gap-2">
          {achievementToasts.map((toast) => (
            <div
              key={toast.id}
              className="rounded-lg border border-yellow-400/30 bg-black/80 px-3 py-2 backdrop-blur"
              style={{
                animation: "achievementSlide 3.5s ease-in-out forwards",
              }}
            >
              <div className="text-xs font-bold text-yellow-300">
                {toast.icon} {toast.label}
              </div>
              <div className="text-[10px] text-white/60">{toast.desc}</div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10" />

        {/* Level-up flash */}
        {level > 1 && (
          <div
            key={level}
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{ animation: "levelUpFlash 0.8s ease-out" }}
          />
        )}

        {/* Game over overlay */}
        {gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-xl bg-black/80 p-6 text-center backdrop-blur-sm">
            <h2 className="text-3xl font-black text-white">Game Over</h2>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-yellow-300">
                {score.toLocaleString()} Punkte
              </p>
              <p className="text-sm text-white/60">
                Level {level} &middot; {lines} Lines
              </p>
            </div>
            {submitScoreMut.isPending && (
              <p className="text-xs text-white/40">Score wird gespeichert...</p>
            )}
            {submitScoreMut.isSuccess && (
              <p className="text-xs text-green-400">
                &#10003; Score gespeichert &amp; im Chat gepostet!
              </p>
            )}
            {submitScoreMut.isError && (
              <p className="text-xs text-red-400">
                Score konnte nicht gespeichert werden
              </p>
            )}
            <button
              onClick={reset}
              className="glass-hover rounded-lg border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white"
            >
              Nochmal spielen
            </button>
          </div>
        )}
      </div>

      {/* ── Side panel ── */}
      <div className="flex flex-1 flex-col gap-4 min-w-[260px]">
        {/* Player name */}
        <div className="glass rounded-xl p-4">
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            Spielername
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value || "anonymous")}
            maxLength={40}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-white/30"
            placeholder="anonymous"
          />
        </div>

        {/* Stats */}
        <div className="glass rounded-xl p-4">
          <h2 className="mb-3 text-lg font-semibold">Stats</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/70">
            <div>Score</div>
            <div className="text-right">
              <span
                key={score}
                className="inline-block font-mono font-bold text-white"
                style={
                  score > 0
                    ? { animation: "scoreBounce 0.35s ease-out" }
                    : undefined
                }
              >
                {score.toLocaleString()}
              </span>
            </div>
            <div>Lines</div>
            <div className="text-right font-mono text-white">{lines}</div>
            <div>Level</div>
            <div className="text-right">
              <span
                className={clsx(
                  "font-bold",
                  level >= 4 && "text-red-400",
                  level >= 2 && level < 4 && "text-yellow-300",
                  level < 2 && "text-white",
                )}
              >
                {level}
              </span>
            </div>
            <div>Speed</div>
            <div className="text-right font-mono text-white">
              {(1000 / tickMs).toFixed(1)}x
            </div>
            <div>State</div>
            <div className="text-right text-white">
              {dinoActive
                ? "\u{1F996} DINO!"
                : running
                  ? "Running"
                  : "Paused"}
            </div>
          </div>

          {/* Dino charge */}
          <div className="mt-3 rounded-lg border border-green-500/20 bg-green-500/5 p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-green-300">
                {"\u{1F996}"} Dino
              </span>
              {dinoCharges > 0 ? (
                <span className="font-bold text-green-400">
                  {dinoCharges} bereit (Q)
                </span>
              ) : (
                <span className="text-white/40">
                  noch {LINES_PER_DINO - (lines % LINES_PER_DINO)} Lines
                </span>
              )}
            </div>
            {dinoCharges === 0 && (
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-300 transition-all duration-300"
                  style={{
                    width: `${((lines % LINES_PER_DINO) / LINES_PER_DINO) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Next level progress */}
          <div className="mt-2 text-[10px] text-white/40">
            N&auml;chstes Level in{" "}
            {LINES_PER_LEVEL - (lines % LINES_PER_LEVEL)} Lines
          </div>
        </div>

        {/* Controls */}
        <div className="glass rounded-xl p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => !gameOver && !dinoActive && setRunning((r) => !r)}
              disabled={gameOver || dinoActive}
              className="glass-hover rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs disabled:opacity-40"
            >
              {running ? "⏸ Pause" : "▶ Weiter"}
            </button>
            <button
              onClick={reset}
              className="glass-hover rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs"
            >
              ↺ Reset
            </button>
            <button
              onClick={hardDrop}
              disabled={gameOver || !running || dinoActive}
              className="glass-hover rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs disabled:opacity-40"
            >
              ⤇ Hard Drop
            </button>
            <button
              onClick={activateDino}
              disabled={
                dinoCharges <= 0 || dinoActive || gameOver || !running
              }
              className={clsx(
                "glass-hover rounded-md border px-3 py-1.5 text-xs disabled:opacity-40",
                dinoCharges > 0
                  ? "border-green-400/40 bg-green-500/10 text-green-300"
                  : "border-white/20 bg-white/5",
              )}
            >
              {"\u{1F996}"} Dino{dinoCharges > 0 && ` (${dinoCharges})`}
            </button>
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              onClick={rotateCW}
              disabled={gameOver || dinoActive}
              className="glass-hover rounded-md border border-white/20 bg-white/5 px-4 py-2 text-xs disabled:opacity-40"
            >
              ↻ / W
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => moveDir(-1)}
                disabled={gameOver || dinoActive}
                className="glass-hover rounded-md border border-white/20 bg-white/5 px-4 py-2 text-xs disabled:opacity-40"
              >
                ← A
              </button>
              <button
                onClick={softDrop}
                disabled={gameOver || dinoActive}
                className="glass-hover rounded-md border border-white/20 bg-white/5 px-4 py-2 text-xs disabled:opacity-40"
              >
                ↓ S
              </button>
              <button
                onClick={() => moveDir(1)}
                disabled={gameOver || dinoActive}
                className="glass-hover rounded-md border border-white/20 bg-white/5 px-4 py-2 text-xs disabled:opacity-40"
              >
                D →
              </button>
            </div>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-white/40">
            ← → / A D bewegen &middot; ↑ / W drehen &middot;{" "}
            ↓ / S soft drop &middot; Space hard drop &middot; Q dino
            &middot; P pause
          </p>
        </div>

        {/* Next pieces */}
        <div className="glass rounded-xl p-4">
          <h2 className="mb-2 text-sm font-semibold">Next</h2>
          <div className="flex gap-3">
            {queue.map((t, i) => {
              const shape = SHAPES[t]!;
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div className="flex flex-col gap-[2px] p-0.5">
                    {shape.map((row, r) => (
                      <div key={r} className="flex gap-[2px]">
                        {row.map((cell, c) => (
                          <div
                            key={c}
                            className={clsx(
                              "h-3 w-3 rounded-[2px] bg-black/40",
                              cell && `bg-gradient-to-br ${COLORS[t]}`,
                            )}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Scores */}
        <div className="glass rounded-xl p-4">
          <h2 className="mb-2 text-sm font-semibold">
            {"\u{1F3C6}"} High Scores
          </h2>
          {topScores.isLoading && (
            <p className="text-xs text-white/40">Laden...</p>
          )}
          {topScores.data?.length === 0 && (
            <p className="text-xs text-white/40">Noch keine Scores</p>
          )}
          <div className="space-y-1">
            {topScores.data?.map((s, i) => (
              <div
                key={s.id}
                className={clsx(
                  "flex items-center justify-between text-xs",
                  i === 0 && "font-bold text-yellow-300",
                  i === 1 && "text-gray-300",
                  i === 2 && "text-orange-400",
                  i > 2 && "text-white/60",
                )}
              >
                <span>
                  {i + 1}. {s.player}
                </span>
                <span className="font-mono">{s.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
