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
const LINES_PER_DINO = 17;
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

// Detailed T-Rex pixel art: 0=empty, 1=body, 2=dark(belly), 3=eye, 4=teeth, 5=claw
const DINO_SPRITE: number[][] = [
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 4],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 4],
  [1, 0, 0, 1, 1, 1, 1, 1, 1, 4, 0],
  [1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 2, 2, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 5, 0, 0, 5, 0, 0, 0, 0],
];
const DINO_W = DINO_SPRITE[0]!.length;
const DINO_H = DINO_SPRITE.length;
const DINO_DESTROY_ROWS = 6;

const DINO_CELL_STYLES: Record<number, { bg: string; border: string; shadow: string }> = {
  1: { bg: "linear-gradient(135deg, #22c55e, #15803d)", border: "#4ade80", shadow: "0 0 10px rgba(74,222,128,0.5)" },
  2: { bg: "linear-gradient(135deg, #166534, #14532d)", border: "#22c55e", shadow: "0 0 6px rgba(34,197,94,0.3)" },
  3: { bg: "radial-gradient(circle, #fbbf24 40%, #b45309 100%)", border: "#fbbf24", shadow: "0 0 12px rgba(251,191,36,0.8)" },
  4: { bg: "linear-gradient(180deg, #f8fafc, #cbd5e1)", border: "#f1f5f9", shadow: "0 0 8px rgba(241,245,249,0.6)" },
  5: { bg: "linear-gradient(135deg, #a3a3a3, #525252)", border: "#737373", shadow: "0 0 4px rgba(115,115,115,0.4)" },
};

const ACHIEVEMENTS: Record<string, { label: string; desc: string; icon: string }> = {
  "first-line": { label: "First Blood", desc: "Erste Line cleared", icon: "\u{1F4A5}" },
  triple: { label: "Triple Threat", desc: "3 Lines auf einmal", icon: "\u{1F525}" },
  tetris: { label: "TETRIS!", desc: "4 Lines auf einmal", icon: "\u{26A1}" },
  "speed-2": { label: "Warming Up", desc: "Level 2 erreicht", icon: "\u{1F680}" },
  "speed-4": { label: "Speed Demon", desc: "Level 4 erreicht", icon: "\u{1F4A8}" },
  "dino-unleashed": { label: "DINO RAMPAGE", desc: "Den Dino entfesselt", icon: "\u{1F996}" },
  "high-roller": { label: "High Roller", desc: "5.000 Punkte", icon: "\u{1F4B0}" },
  legend: { label: "Legende", desc: "20.000 Punkte", icon: "\u{1F451}" },
};

interface ActivePiece { shape: number[][]; type: string; row: number; col: number }
interface ScorePopup { id: number; points: number; y: number; label: string }
interface AchievementToast { id: string; label: string; desc: string; icon: string }
interface DebrisParticle { id: number; x: number; y: number; color: string; variant: number }

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

function merge(board: (string | null)[][], piece: ActivePiece): (string | null)[][] {
  const next = cloneBoard(board);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r]!.length; c++) {
      if (piece.shape[r]![c]) next[piece.row + r]![piece.col + c] = piece.type;
    }
  }
  return next;
}

function clearLines(board: (string | null)[][]): { board: (string | null)[][]; cleared: number } {
  const remain = board.filter((row) => row.some((cell) => !cell));
  const cleared = ROWS - remain.length;
  while (remain.length < ROWS) remain.unshift(Array<string | null>(COLS).fill(null));
  return { board: remain, cleared };
}

function getTickMs(level: number): number {
  // Level 1: 700ms, Level 2: 550ms, Level 3: 420ms, Level 4: 310ms, ...
  // Gets really fast — noticeably harder each level
  return Math.max(60, Math.round(700 * Math.pow(0.78, level - 1)));
}

const DEBRIS_COLORS = ["#4ade80", "#22c55e", "#fb923c", "#ef4444", "#fbbf24", "#a78bfa"];

export default function Tetris() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const [board, setBoard] = useState<(string | null)[][]>(() => createBoard());
  const [bag, setBag] = useState<string[]>(() => randomBag());
  const [nextBag, setNextBag] = useState<string[]>(() => randomBag());
  const [piece, setPiece] = useState<ActivePiece>(() => {
    const type = bag[0]!;
    return { shape: SHAPES[type]!, type, row: 0, col: 3 };
  });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const [dinosUsed, setDinosUsed] = useState(0);
  const [dinoActive, setDinoActive] = useState(false);
  const [dinoCol, setDinoCol] = useState(-DINO_W);
  const dinoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [achievementToasts, setAchievementToasts] = useState<AchievementToast[]>([]);
  const [debris, setDebris] = useState<DebrisParticle[]>([]);
  const [playerName, setPlayerName] = useState("anonymous");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [levelUpAnim, setLevelUpAnim] = useState(0);

  const loopRef = useRef<number | null>(null);
  const lastTime = useRef<number>(0);
  const justLocked = useRef(false);
  const popupIdRef = useRef(0);
  const debrisIdRef = useRef(0);
  const achievedRef = useRef(new Set<string>());
  const playerNameRef = useRef("anonymous");
  const prevLevelRef = useRef(1);

  const level = Math.floor(lines / LINES_PER_LEVEL) + 1;
  const tickMs = getTickMs(level);
  const nextLevelIn = LINES_PER_LEVEL - (lines % LINES_PER_LEVEL);
  const dinoCharges = Math.max(0, Math.floor(lines / LINES_PER_DINO) - dinosUsed);
  const dinoProgress = lines % LINES_PER_DINO;

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

  // Detect level-up
  useEffect(() => {
    if (level > prevLevelRef.current) {
      prevLevelRef.current = level;
      setLevelUpAnim(level);
      setTimeout(() => setLevelUpAnim(0), 1200);
    }
  }, [level]);

  // ── Helpers ──

  const addScorePopup = useCallback((points: number, row: number, cleared: number) => {
    const id = popupIdRef.current++;
    const label = cleared >= 4 ? "TETRIS!" : cleared >= 3 ? "TRIPLE!" : cleared >= 2 ? "DOUBLE!" : "";
    const y = 16 + row * 27;
    setScorePopups((prev) => [...prev, { id, points, y, label }]);
    setTimeout(() => setScorePopups((prev) => prev.filter((p) => p.id !== id)), 1800);
  }, []);

  const spawnDebris = useCallback((col: number, row: number, count: number) => {
    const particles: DebrisParticle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        id: debrisIdRef.current++,
        x: 16 + col * 27 + Math.random() * 20,
        y: 16 + row * 27 + Math.random() * 20,
        color: DEBRIS_COLORS[Math.floor(Math.random() * DEBRIS_COLORS.length)]!,
        variant: Math.floor(Math.random() * 4) + 1,
      });
    }
    setDebris((prev) => [...prev, ...particles]);
    setTimeout(() => {
      const ids = new Set(particles.map((p) => p.id));
      setDebris((prev) => prev.filter((p) => !ids.has(p.id)));
    }, 800);
  }, []);

  const triggerAchievement = useCallback((id: string) => {
    if (achievedRef.current.has(id)) return;
    const ach = ACHIEVEMENTS[id];
    if (!ach) return;
    achievedRef.current.add(id);
    setAchievementToasts((prev) => [...prev, { id, ...ach }]);
    setTimeout(() => setAchievementToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
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
      if (b.length === 0) { b = nb; nb = randomBag(); setNextBag(nb); }
      const type = b[0]! || nb[0]!;
      const candidate: ActivePiece = { shape: SHAPES[type]!, type, row: 0, col: 3 };
      if (!canPlace(currentBoard, candidate)) { setGameOver(true); setRunning(false); return false; }
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
        addScorePopup(points, p.row + Math.floor(p.shape.length / 2), cleared);
        if (cleared >= 4) triggerAchievement("tetris");
        else if (cleared >= 3) triggerAchievement("triple");
        if (lines === 0) triggerAchievement("first-line");
      }
      setBoard(clearedBoard);
      const spawned = spawnNext(clearedBoard);
      if (spawned) queueMicrotask(() => { justLocked.current = false; });
    },
    [board, spawnNext, lines, addScorePopup, triggerAchievement],
  );

  const hardDrop = useCallback(() => {
    const p: ActivePiece = { ...piece };
    let dropDist = 0;
    while (canPlace(board, { ...p, row: p.row + 1 })) { p.row++; dropDist++; }
    setScore((s) => s + dropDist * 2);
    lock(p);
  }, [piece, board, lock]);

  const step = useCallback(() => {
    if (!running || gameOver || dinoActive) return;
    const next = { ...piece, row: piece.row + 1 };
    if (canPlace(board, next)) setPiece(next);
    else lock(piece);
  }, [piece, board, lock, running, gameOver, dinoActive]);

  // ── Dino ──

  const activateDino = useCallback(() => {
    if (dinoCharges <= 0 || dinoActive || gameOver || !running) return;
    setDinosUsed((d) => d + 1);
    setDinoActive(true);
    setDinoCol(-DINO_W);
    triggerAchievement("dino-unleashed");

    const capturedLevel = level;
    let col = -DINO_W;
    dinoIntervalRef.current = setInterval(() => {
      col++;
      setDinoCol(col);

      // Spawn debris as dino destroys cells
      if (col >= 0 && col < COLS) {
        for (let r = ROWS - DINO_DESTROY_ROWS; r < ROWS; r++) {
          spawnDebris(col, r, 2);
        }
      }

      if (col > COLS + 3) {
        if (dinoIntervalRef.current) clearInterval(dinoIntervalRef.current);
        dinoIntervalRef.current = null;
        setBoard((prev) => {
          const nb = cloneBoard(prev);
          nb.splice(ROWS - DINO_DESTROY_ROWS, DINO_DESTROY_ROWS);
          for (let i = 0; i < DINO_DESTROY_ROWS; i++) {
            nb.unshift(Array<string | null>(COLS).fill(null));
          }
          return nb;
        });
        setDinoActive(false);
        const bonus = DINO_DESTROY_ROWS * 250 * capturedLevel;
        setScore((s) => s + bonus);
        addScorePopup(bonus, ROWS - DINO_DESTROY_ROWS, 0);
      }
    }, 55);
  }, [dinoCharges, dinoActive, gameOver, running, level, addScorePopup, triggerAchievement, spawnDebris]);

  // ── Effects ──

  useEffect(() => {
    function frame(time: number) {
      if (!lastTime.current) lastTime.current = time;
      if (time - lastTime.current > tickMs) { step(); lastTime.current = time; }
      loopRef.current = requestAnimationFrame(frame);
    }
    loopRef.current = requestAnimationFrame(frame);
    return () => { if (loopRef.current) cancelAnimationFrame(loopRef.current); };
  }, [step, tickMs]);

  useEffect(() => {
    if (containerRef.current && !(document.activeElement instanceof HTMLElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA" || document.activeElement.isContentEditable))) {
      containerRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const match = /chat-author=([^;]+)/.exec(document.cookie);
    if (match?.[1]) { const n = decodeURIComponent(match[1]); setPlayerName(n); playerNameRef.current = n; }
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
    submitScoreRef.current({ player: playerNameRef.current || "anonymous", score, lines, level })
      .then(() => topScores.refetch())
      .catch(() => undefined);
  }, [gameOver, score, lines, level, scoreSubmitted, topScores]);

  useEffect(() => {
    return () => { if (dinoIntervalRef.current) clearInterval(dinoIntervalRef.current); };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) return;
      if (e.key === "p" || e.key === "P") { e.preventDefault(); if (!gameOver && !dinoActive) setRunning((r) => !r); return; }
      if (!running || gameOver || justLocked.current || dinoActive) return;
      const keys = ["ArrowLeft","ArrowRight","ArrowDown","ArrowUp","a","A","d","D","s","S","w","W","x"," ","q","Q"];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { const n = { ...piece, col: piece.col - 1 }; if (canPlace(board, n)) setPiece(n); }
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { const n = { ...piece, col: piece.col + 1 }; if (canPlace(board, n)) setPiece(n); }
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { const n = { ...piece, row: piece.row + 1 }; if (canPlace(board, n)) { setPiece(n); setScore((s) => s + 1); } else lock(piece); }
      else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === "x") { const r = rotate(piece.shape); const n = { ...piece, shape: r }; if (canPlace(board, n)) setPiece(n); }
      else if (e.key === " ") hardDrop();
      else if (e.key === "q" || e.key === "Q") activateDino();
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
      // Clear cells the dino already passed
      for (let c = 0; c <= Math.min(dinoCol + DINO_W, COLS - 1); c++) {
        if (c < 0) continue;
        for (let r = ROWS - DINO_DESTROY_ROWS; r < ROWS; r++) {
          if (c <= dinoCol) temp[r]![c] = "exploded";
          else temp[r]![c] = "dino-trail";
        }
      }
      // Dino sprite — encode cell type as "dino:N"
      const startRow = ROWS - DINO_H;
      for (let r = 0; r < DINO_H; r++) {
        for (let c = 0; c < DINO_W; c++) {
          const v = DINO_SPRITE[r]![c]!;
          if (v) {
            const br = startRow + r; const bc = dinoCol + c;
            if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) temp[br]![bc] = `dino:${v}`;
          }
        }
      }
    }
    if (!dinoActive) {
      for (let r = 0; r < ghost.shape.length; r++) {
        for (let c = 0; c < ghost.shape[r]!.length; c++) {
          if (ghost.shape[r]![c]) { const gr = ghost.row + r; const gc = ghost.col + c; if (gr >= 0 && gr < ROWS && gc >= 0 && gc < COLS && !temp[gr]![gc]) temp[gr]![gc] = "ghost:" + piece.type; }
        }
      }
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r]!.length; c++) {
          if (piece.shape[r]![c]) { const pr = piece.row + r; const pc = piece.col + c; if (pr >= 0 && pr < ROWS && pc >= 0 && pc < COLS) temp[pr]![pc] = piece.type; }
        }
      }
    }
    return temp.slice(0, VISIBLE_ROWS).map((row) => row.slice());
  }, [board, piece, ghost, dinoActive, dinoCol]);

  // ── Reset ──

  const reset = useCallback(() => {
    if (dinoIntervalRef.current) { clearInterval(dinoIntervalRef.current); dinoIntervalRef.current = null; }
    const newBag = randomBag();
    setBoard(createBoard()); setBag(newBag); setNextBag(randomBag());
    setScore(0); setLines(0);
    setPiece({ shape: SHAPES[newBag[0]!]!, type: newBag[0]!, row: 0, col: 3 });
    setRunning(true); setGameOver(false); setDinosUsed(0);
    setDinoActive(false); setDinoCol(-DINO_W);
    setScorePopups([]); setAchievementToasts([]); setDebris([]);
    setScoreSubmitted(false); setLevelUpAnim(0);
    achievedRef.current = new Set(); justLocked.current = false; prevLevelRef.current = 1;
  }, []);

  const attempt = (next: ActivePiece) => { if (!justLocked.current && !dinoActive && canPlace(board, next)) setPiece(next); };
  const moveDir = (dx: number) => attempt({ ...piece, col: piece.col + dx });
  const softDrop = () => { if (justLocked.current || dinoActive) return; const n = { ...piece, row: piece.row + 1 }; if (canPlace(board, n)) { setPiece(n); setScore((s) => s + 1); } else lock(piece); };
  const rotateCW = () => { if (justLocked.current || dinoActive) return; attempt({ ...piece, shape: rotate(piece.shape) }); };

  // ── Touch support (drag-and-hold for horizontal, swipe down for drop) ──
  const touchRef = useRef<{ startX: number; startY: number; time: number; lastCol: number; moved: boolean } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    const t = e.touches[0];
    if (!t) return;
    touchRef.current = { startX: t.clientX, startY: t.clientY, time: Date.now(), lastCol: 0, moved: false };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    const ref = touchRef.current;
    const t = e.touches[0];
    if (!ref || !t || !running || gameOver || dinoActive) return;

    const cellW = boardRef.current ? boardRef.current.offsetWidth / COLS : 30;
    const dx = t.clientX - ref.startX;
    const colDelta = Math.round(dx / cellW);
    if (colDelta !== ref.lastCol) {
      const dir = colDelta > ref.lastCol ? 1 : -1;
      const steps = Math.abs(colDelta - ref.lastCol);
      for (let i = 0; i < steps; i++) moveDir(dir);
      ref.lastCol = colDelta;
      ref.moved = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    const ref = touchRef.current;
    const t = e.changedTouches[0];
    if (!ref || !t) return;
    touchRef.current = null;
    if (!running || gameOver || dinoActive || justLocked.current) return;

    const dy = t.clientY - ref.startY;
    const elapsed = Date.now() - ref.time;

    if (!ref.moved && elapsed < 250 && Math.abs(dy) < 25) {
      rotateCW();
      return;
    }

    if (dy > 60) {
      if (dy > 120 || elapsed < 200) hardDrop();
      else softDrop();
    }
  };

  const tBtn = "flex items-center justify-center rounded-lg border border-white/20 bg-white/5 text-base font-bold text-white/80 active:bg-white/15 active:scale-95 transition-all select-none touch-manipulation disabled:opacity-30";

  const startGame = () => {
    if (!playerName.trim() || playerName === "anonymous") return;
    setGameStarted(true);
    setRunning(true);
    setTimeout(() => containerRef.current?.focus(), 50);
  };

  if (!gameStarted) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-24">
        <div className="glass mx-auto w-full max-w-sm rounded-2xl p-6 text-center sm:p-8">
          <div className="mb-4 text-5xl">{"\u{1F3AE}"}</div>
          <h2 className="mb-1 text-2xl font-black text-white sm:text-3xl">Tetris</h2>
          <p className="mb-6 text-sm text-white/50">Gib deinen Namen ein um zu spielen</p>
          <input
            type="text"
            value={playerName === "anonymous" ? "" : playerName}
            onChange={(e) => setPlayerName(e.target.value || "anonymous")}
            onKeyDown={(e) => { if (e.key === "Enter") startGame(); }}
            maxLength={40}
            autoFocus
            className="mb-4 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-center text-lg text-white outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
            placeholder="Dein Name..."
          />
          <button
            onClick={startGame}
            disabled={!playerName.trim() || playerName === "anonymous"}
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:from-purple-400 hover:to-purple-500 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Spiel starten
          </button>
          <p className="mt-4 text-[10px] leading-relaxed text-white/30">
            WASD / Pfeiltasten bewegen &middot; Space Hard Drop &middot; Q Dino &middot; P Pause
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col gap-1 outline-none lg:flex-row lg:gap-6"
      tabIndex={0}
      role="application"
      aria-label="Tetris game. Arrow keys or WASD to move, Space for hard drop, Q for dino, P to pause."
      style={{ "--cell": "min((100dvh - 14rem) / 22, (100vw - 2rem) / 10.5, 2rem)", touchAction: "none", overscrollBehavior: "none" } as React.CSSProperties}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        containerRef.current?.focus();
      }}
    >
      {/* ── Mobile top bar: score + level + next ── */}
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <div className="flex items-center gap-3 text-sm">
          <span key={score} className="font-mono font-bold text-white" style={score > 0 ? { animation: "scoreBounce 0.4s ease-out" } : undefined}>
            {score.toLocaleString()}
          </span>
          <span className="text-white/40">L{lines}</span>
          <span className={clsx("font-bold", level >= 4 ? "text-red-400" : level >= 2 ? "text-yellow-300" : "text-white")}>Lv{level}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-white/30">Next</span>
            {queue.slice(0, 3).map((t, i) => (
              <div key={i} className="flex flex-col gap-[1px]">
                {SHAPES[t]!.map((row, r) => (
                  <div key={r} className="flex gap-[1px]">
                    {row.map((cell, c) => (
                      <div key={c} className={clsx("h-1.5 w-1.5 rounded-[1px] bg-black/30", cell && `bg-gradient-to-br ${COLORS[t]}`)} />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {dinoCharges > 0 && (
            <button onClick={activateDino} disabled={dinoActive || !running}
              className="rounded-lg border border-green-400/50 bg-green-500/20 px-2 py-1 text-xs font-bold text-green-300 active:bg-green-500/30">
              {"\u{1F996}"}{dinoCharges}
            </button>
          )}
          <button onClick={() => !gameOver && !dinoActive && setRunning((r) => !r)} className="rounded-lg border border-white/20 bg-white/5 px-2 py-1 text-xs text-white/70">
            {running ? "⏸" : "▶"}
          </button>
        </div>
      </div>

      {/* ── Board ── */}
      <div
        ref={boardRef}
        className={clsx("glass relative mx-auto rounded-xl p-2 sm:p-3 lg:mx-0 lg:flex lg:flex-col lg:justify-center lg:self-stretch", dinoActive && "border-green-500/40")}
        style={{
          touchAction: "none",
          ...(dinoActive ? { animation: "dinoShake 0.3s ease-in-out infinite" } : levelUpAnim ? { animation: "levelUpFlash 1.2s ease-out" } : undefined),
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mx-auto grid grid-cols-10 gap-[1px]" style={{ width: "calc(var(--cell) * 10 + 9px)" }}>
          {displayBoard.map((row, rIdx) => (
            <React.Fragment key={rIdx}>
              {row.map((cell, cIdx) => {
                const sz = { width: "var(--cell)", height: "var(--cell)" } as React.CSSProperties;
                if (!cell) return <div key={cIdx} className="rounded-sm border border-white/5 bg-black/40" style={sz} />;

                if (cell.startsWith("dino:")) {
                  const partType = parseInt(cell.split(":")[1]!, 10);
                  const st = DINO_CELL_STYLES[partType] ?? DINO_CELL_STYLES[1]!;
                  return (
                    <div key={cIdx} className="rounded-sm" style={{
                      ...sz, background: st.bg, borderWidth: "2px", borderStyle: "solid", borderColor: st.border,
                      boxShadow: `${st.shadow}, inset 0 0 4px rgba(255,255,255,0.15)`,
                      animation: "dinoCell 0.12s ease-in-out infinite alternate",
                    }} />
                  );
                }
                if (cell === "exploded") return <div key={cIdx} className="rounded-sm" style={{ ...sz, animation: "cellExplode 0.5s ease-out forwards" }} />;
                if (cell === "dino-trail") return <div key={cIdx} className="rounded-sm" style={{ ...sz, animation: "trailFire 0.4s ease-out forwards" }} />;

                const isGhost = cell.startsWith("ghost:");
                const type = isGhost ? cell.split(":")[1]! : cell;
                return (
                  <div key={cIdx} className={clsx(
                    "rounded-sm border border-white/5 bg-black/40",
                    !isGhost && "shadow-inner",
                    !isGhost && `bg-gradient-to-br ${COLORS[type]} drop-shadow`,
                    isGhost && `bg-gradient-to-br ${COLORS[type]} opacity-20`,
                  )} style={sz} />
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Debris particles */}
        {debris.map((p) => (
          <div key={p.id} className="pointer-events-none absolute z-30 h-2 w-2 rounded-full"
            style={{ left: `${p.x}px`, top: `${p.y}px`, backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}`, animation: `debrisfly${p.variant} 0.7s ease-out forwards` }} />
        ))}

        {/* Score popups */}
        {scorePopups.map((popup) => (
          <div key={popup.id} className="pointer-events-none absolute left-1/2 z-20"
            style={{ top: `${popup.y}px`, animation: "scoreFloat 1.6s ease-out forwards" }}>
            <div className={clsx("font-black tracking-tight whitespace-nowrap",
              popup.points >= 2700 ? "text-3xl text-yellow-300 drop-shadow-[0_0_16px_rgba(250,204,21,0.7)] sm:text-4xl" :
              popup.points >= 900 ? "text-2xl text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] sm:text-3xl" :
              popup.points >= 300 ? "text-xl text-cyan-300 sm:text-2xl" : "text-lg text-white sm:text-xl")}>
              +{popup.points.toLocaleString()}
            </div>
            {popup.label && <div className="text-center text-xs font-black text-white sm:text-sm">{popup.label}</div>}
          </div>
        ))}

        {/* Achievement toasts */}
        <div className="absolute right-1 top-1 z-20 flex flex-col gap-1 sm:right-2 sm:top-2 sm:gap-2">
          {achievementToasts.map((toast) => (
            <div key={toast.id} className="rounded-lg border border-yellow-400/40 bg-black/90 px-2 py-1.5 shadow-lg shadow-yellow-500/20 backdrop-blur sm:px-3 sm:py-2"
              style={{ animation: "achievementSlide 3.5s ease-in-out forwards" }}>
              <div className="text-xs font-black text-yellow-300 sm:text-sm">{toast.icon} {toast.label}</div>
              <div className="text-[9px] text-white/60 sm:text-[10px]">{toast.desc}</div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10" />

        {levelUpAnim > 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-1/3 z-20 text-center" style={{ animation: "scoreFloat 1.5s ease-out forwards" }}>
            <div className="text-3xl font-black text-purple-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] sm:text-4xl">LEVEL {levelUpAnim}!</div>
            <div className="text-xs font-bold text-white/70 sm:text-sm">Speed Up!</div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-black/80 p-4 text-center backdrop-blur-sm sm:gap-4 sm:p-6">
            <h2 className="text-2xl font-black text-white sm:text-3xl">Game Over</h2>
            <div className="space-y-1">
              <p className="text-xl font-bold text-yellow-300 sm:text-2xl">{score.toLocaleString()} Punkte</p>
              <p className="text-xs text-white/60 sm:text-sm">Level {level} &middot; {lines} Lines</p>
            </div>
            {submitScoreMut.isPending && <p className="text-xs text-white/40">Score wird gespeichert...</p>}
            {submitScoreMut.isSuccess && <p className="text-xs text-green-400">{"✓"} Score gespeichert &amp; im Chat gepostet!</p>}
            {submitScoreMut.isError && <p className="text-xs text-red-400">Score konnte nicht gespeichert werden</p>}
            <button onClick={reset} className="glass-hover rounded-lg border border-white/30 bg-white/10 px-5 py-2 text-sm font-semibold text-white">Nochmal</button>
          </div>
        )}
      </div>

      {/* ── Mobile touch controls: ← ↻ → ↓ ⤓ 🦖 ↺ ── */}
      <div className="flex items-center justify-center gap-2 px-1 lg:hidden">
        <button onClick={() => moveDir(-1)} disabled={gameOver || dinoActive || !running} className={clsx(tBtn, "h-11 w-11")}>{"←"}</button>
        <button onClick={rotateCW} disabled={gameOver || dinoActive || !running} className={clsx(tBtn, "h-11 w-11")}>{"↻"}</button>
        <button onClick={() => moveDir(1)} disabled={gameOver || dinoActive || !running} className={clsx(tBtn, "h-11 w-11")}>{"→"}</button>
        <button onClick={softDrop} disabled={gameOver || dinoActive || !running} className={clsx(tBtn, "h-11 w-11")}>{"↓"}</button>
        <button onClick={hardDrop} disabled={gameOver || !running || dinoActive}
          className={clsx(tBtn, "h-11 w-14 border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs")}>
          {"⤓"}
        </button>
        <button onClick={activateDino} disabled={dinoCharges <= 0 || dinoActive || gameOver || !running}
          className={clsx(tBtn, "h-11 w-11 text-sm", dinoCharges > 0 ? "border-green-400/50 bg-green-500/15 text-green-300" : "")}>
          {"\u{1F996}"}
        </button>
        <button onClick={reset} className={clsx(tBtn, "h-11 w-11 text-xs")}>{"↺"}</button>
      </div>

      {/* ── Side panel (desktop) ── */}
      <div className="hidden flex-1 flex-col gap-3 min-w-[240px] lg:flex">
        {/* Player name */}
        <div className="glass rounded-xl p-3">
          <label className="mb-1 block text-xs font-medium text-white/50">Spielername</label>
          <input type="text" value={playerName}
            onChange={(e) => setPlayerName(e.target.value || "anonymous")}
            maxLength={40}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-white/30" placeholder="anonymous" />
        </div>

        {/* Stats */}
        <div className="glass rounded-xl p-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-white/70">
            <div>Score</div>
            <div className="text-right">
              <span key={score} className="inline-block font-mono font-bold text-white"
                style={score > 0 ? { animation: "scoreBounce 0.4s ease-out" } : undefined}>
                {score.toLocaleString()}
              </span>
            </div>
            <div>Lines</div>
            <div className="text-right font-mono text-white">{lines}</div>
            <div>Level</div>
            <div className="text-right">
              <span className={clsx("font-bold", level >= 5 && "text-red-400", level >= 3 && level < 5 && "text-orange-400", level >= 2 && level < 3 && "text-yellow-300", level < 2 && "text-white")}>
                {level}
              </span>
            </div>
            <div>Speed</div>
            <div className="text-right font-mono text-white text-xs">
              {tickMs}ms <span className="text-white/40">({(1000 / tickMs).toFixed(1)}/s)</span>
            </div>
          </div>

          {/* Speed progress */}
          <div className="mt-2.5 rounded-lg border border-purple-500/20 bg-purple-500/5 p-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-purple-300">{"\u{1F680}"} Level {level + 1}</span>
              <span className={clsx("font-bold", nextLevelIn <= 5 ? "text-red-400" : nextLevelIn <= 10 ? "text-orange-400" : "text-white/60")}>
                {nextLevelIn} Lines
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className={clsx("h-full rounded-full transition-all duration-300", nextLevelIn <= 5 ? "bg-gradient-to-r from-red-500 to-orange-400" : "bg-gradient-to-r from-purple-500 to-purple-300")}
                style={{ width: `${((LINES_PER_LEVEL - nextLevelIn) / LINES_PER_LEVEL) * 100}%` }} />
            </div>
            <div className="mt-0.5 text-[10px] text-white/30">
              {getTickMs(level + 1)}ms ({Math.round((1 - getTickMs(level + 1) / tickMs) * 100)}% schneller)
            </div>
          </div>

          {/* Dino charge */}
          <div className={clsx("mt-2 rounded-lg border p-2 transition-colors", dinoCharges > 0 ? "border-green-400/40 bg-green-500/10" : "border-green-500/20 bg-green-500/5")}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-green-300">{"\u{1F996}"} Dino</span>
              {dinoCharges > 0 ? (
                <span className="font-black text-green-400 animate-pulse">{dinoCharges} BEREIT! (Q)</span>
              ) : (
                <span className="text-white/40">noch {LINES_PER_DINO - dinoProgress} Lines</span>
              )}
            </div>
            {dinoCharges === 0 && (
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-300 transition-all duration-300"
                  style={{ width: `${(dinoProgress / LINES_PER_DINO) * 100}%` }} />
              </div>
            )}
          </div>

          <div className="mt-1 text-right text-xs text-white/50">
            {dinoActive ? <span className="font-black text-green-400 animate-pulse">{"\u{1F996}"} RAMPAGE!</span> : running ? "Running" : "Paused"}
          </div>
        </div>

        {/* Desktop controls */}
        <div className="glass rounded-xl p-3">
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => !gameOver && !dinoActive && setRunning((r) => !r)} disabled={gameOver || dinoActive}
              className="glass-hover rounded-md border border-white/20 bg-white/5 px-2.5 py-1 text-xs disabled:opacity-40">
              {running ? "⏸" : "▶"}
            </button>
            <button onClick={reset} className="glass-hover rounded-md border border-white/20 bg-white/5 px-2.5 py-1 text-xs">{"↺"}</button>
            <button onClick={hardDrop} disabled={gameOver || !running || dinoActive}
              className="glass-hover rounded-md border border-white/20 bg-white/5 px-2.5 py-1 text-xs disabled:opacity-40">Drop</button>
            <button onClick={activateDino} disabled={dinoCharges <= 0 || dinoActive || gameOver || !running}
              className={clsx("glass-hover rounded-md border px-2.5 py-1 text-xs font-bold disabled:opacity-40",
                dinoCharges > 0 ? "border-green-400/60 bg-green-500/20 text-green-300" : "border-white/20 bg-white/5")}>
              {"\u{1F996}"}{dinoCharges > 0 && ` ${dinoCharges}`}
            </button>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-white/40">
            WASD / Pfeiltasten &middot; Space drop &middot; Q dino &middot; P pause
          </p>
        </div>

        {/* Next pieces */}
        <div className="glass rounded-xl p-3">
          <h2 className="mb-1.5 text-xs font-semibold text-white/60">Next</h2>
          <div className="flex gap-2.5">
            {queue.map((t, i) => (
              <div key={i} className="flex flex-col gap-[2px]">
                {SHAPES[t]!.map((row, r) => (
                  <div key={r} className="flex gap-[2px]">
                    {row.map((cell, c) => (
                      <div key={c} className={clsx("h-2.5 w-2.5 rounded-[2px] bg-black/40", cell && `bg-gradient-to-br ${COLORS[t]}`)} />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* High Scores */}
        <div className="glass rounded-xl p-3">
          <h2 className="mb-1.5 text-xs font-semibold text-white/60">{"\u{1F3C6}"} High Scores</h2>
          {topScores.isLoading && <p className="text-xs text-white/40">Laden...</p>}
          {topScores.data?.length === 0 && <p className="text-xs text-white/40">Noch keine Scores</p>}
          <div className="space-y-0.5">
            {topScores.data?.map((s, i) => (
              <div key={s.id} className={clsx("flex items-center justify-between text-[11px]",
                i === 0 && "font-bold text-yellow-300", i === 1 && "text-gray-300", i === 2 && "text-orange-400", i > 2 && "text-white/50")}>
                <span>{i + 1}. {s.player}</span>
                <span className="font-mono">{s.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile bottom info ── */}
      <div className="flex items-center justify-between gap-2 px-1 text-[10px] text-white/40 lg:hidden">
        <span>{playerName}</span>
        <span>Lv{level + 1} in {nextLevelIn}L &middot; {"\u{1F996}"} {dinoCharges > 0 ? `${dinoCharges}x bereit` : `in ${LINES_PER_DINO - dinoProgress}L`}</span>
      </div>
    </div>
  );
}
