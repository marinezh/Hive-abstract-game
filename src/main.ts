import './style.css';
import { Game } from './game/Game';
import { QueenBee } from './models/QueenBee';
import { Beetle } from './models/Beetle';
import { Spider } from './models/Spider';
import { Grasshopper } from './models/Grasshopper';
import { SoldierAnt } from './models/SoldierAnt';
import { CanvasRenderer } from './game/CanvasRenderer';
import type { HexCoord, Piece, Player } from './models/Piece';

// 🆕 type for bank entries + selected state
type BankPiece = {
  id: string;
  x: number;
  y: number;
  type: "bee" | "spider" | "beetle" | "hopper" | "ant";
  color: Player;              // 🔹 FIX: use Player type
  width: number;
  height: number;
};

let bankPieces: BankPiece[] = [];
let selected:
  | { from: "bank"; bankId: string; type: BankPiece["type"]; color: Player }
  | { from: "board"; ref: Piece }
  | null = null;

// Get the app container
const app = document.getElementById('app')!;
app.innerHTML = `
  <h1>Hive Game</h1>
  <div id="game-container">
    <div id="white-bank" class="piece-bank">
      <div class="piece-bank-label">White Pieces</div>
    </div>
    <div id="board" class="board"></div>
    <div id="black-bank" class="piece-bank">
      <div class="piece-bank-label">Black Pieces</div>
    </div>
  </div>
`;

const canvas = document.getElementById('hive-canvas') as HTMLCanvasElement;

// High-DPI setup
const dpr = window.devicePixelRatio || 1;
canvas.width = 1000 * dpr;
canvas.height = 800 * dpr;
canvas.style.width = "1000px";
canvas.style.height = "800px";

// Create renderer and scale context
const renderer = new CanvasRenderer(canvas);
renderer.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

const game = new Game();

// Correct counts per color
const pieceBankConfig: Array<{ type: BankPiece["type"]; count: number }> = [
  { type: "bee", count: 1 },
  { type: "spider", count: 2 },
  { type: "beetle", count: 2 },
  { type: "hopper", count: 3 },
  { type: "ant", count: 3 },
];
const pieceSize = 50;

const HEX_SIZE = 40;

// 🆕 ID helper
let _id = 0;
function uid() { return `p_${_id++}`; }

// Build the full bank once
function initPieceBanks() {
  bankPieces = [];
  (["Black", "White"] as const).forEach((color) => {
    pieceBankConfig.forEach(({ type, count }) => {
      for (let i = 0; i < count; i++) {
        bankPieces.push({
          id: uid(),
          x: 0, y: 0,
          type,
          color,
          width: pieceSize,
          height: pieceSize,
        });
      }
    });
  });
  layoutBankPositions();
}

// Position remaining bank pieces
function layoutBankPositions() {
  const leftX = 20;
  const rightX = canvas.width / dpr - pieceSize - 20;
  const startY = 60;
  const gapY = pieceSize + 10;

  let yBlack = startY;
  let yWhite = startY;

  const order = ["bee","spider","beetle","hopper","ant"];

  const blackPieces = bankPieces.filter(p => p.color === "Black")
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  const whitePieces = bankPieces.filter(p => p.color === "White")
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

  blackPieces.forEach(p => { p.x = leftX;  p.y = yBlack;  yBlack += gapY; });
  whitePieces.forEach(p => { p.x = rightX; p.y = yWhite;  yWhite += gapY; });
}

// Draw whatever is currently in the bank
function drawPieceBanks() {
  bankPieces.forEach(piece => {
    const img = new Image();
    img.src = `./src/assets/${piece.type}_${piece.color.toLowerCase()}.png`;
    img.onload = () => {
      renderer.ctx.drawImage(img, piece.x, piece.y, piece.width, piece.height);
    };
  });
}

// ---- hex math helpers ----
function pixelToHex(x: number, y: number, hexSize: number): { q: number, r: number } {
  const q = ((Math.sqrt(3) / 3 * x) - (1 / 3 * y)) / hexSize;
  const r = (2 / 3 * y) / hexSize;
  return hexRound({ q, r });
}
function hexRound(hex: { q: number, r: number }) {
  let q = Math.round(hex.q);
  let r = Math.round(hex.r);
  let s = Math.round(-hex.q - hex.r);

  const q_diff = Math.abs(q - hex.q);
  const r_diff = Math.abs(r - hex.r);
  const s_diff = Math.abs(s - (-hex.q - hex.r));

  if (q_diff > r_diff && q_diff > s_diff)       q = -r - s;
  else if (r_diff > s_diff)                     r = -q - s;
  return { q, r };
}

// Create piece object from type
function createPiece(type: BankPiece["type"], color: Player, coord: HexCoord) {
  switch (type) {
    case "bee":    return new QueenBee(color, coord);
    case "beetle": return new Beetle(color, coord);
    case "spider": return new Spider(color, coord);
    case "hopper": return new Grasshopper(color, coord);
    case "ant":    return new SoldierAnt(color, coord);
    default:       return null;
  }
}

// ---- CLICK HANDLER ----
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const centerX = canvas.width / dpr / 2;
  const centerY = canvas.height / dpr / 2;

  // 1) BANK HIT-TEST
  for (let i = bankPieces.length - 1; i >= 0; i--) {
    const b = bankPieces[i];
    if (
      clickX >= b.x && clickX <= b.x + b.width &&
      clickY >= b.y && clickY <= b.y + b.height
    ) {
      selected = { from: "bank", bankId: b.id, type: b.type, color: b.color };
      return;
    }
  }

  // 2) BOARD PIECE HIT-TEST
  for (let i = game.board.pieces.length - 1; i >= 0; i--) {
    const p = game.board.pieces[i];
    const { q, r } = p.position;           // 🔹 FIX: use .position
    const { x, y } = renderer.hexToPixel(q, r);
    const dx = clickX - x, dy = clickY - y;
    if (dx*dx + dy*dy <= (HEX_SIZE * 0.8) ** 2) {
      selected = { from: "board", ref: p };
      return;
    }
  }

  // 3) PLACE OR MOVE
  if (selected) {
    const target = pixelToHex(clickX - centerX, clickY - centerY, HEX_SIZE);

    if (selected.from === "bank") {
      const pieceObj = createPiece(selected.type, selected.color, target);
      if (pieceObj) {
        game.board.addPiece(pieceObj, target);

        // remove from bank + reflow
        const idx = bankPieces.findIndex(p => p.id === selected!.bankId);
        if (idx !== -1) {
          bankPieces.splice(idx, 1);
          layoutBankPositions();
        }
      }
    } else {
      // 🔹 FIX: update position instead of coord
      selected.ref.position = target;
    }

    selected = null;
    renderCanvasBoard();
  }
});

// ---- RENDER LOOP ----
function renderCanvasBoard() {
  renderer.clear();
  drawPieceBanks();
  renderer.drawBoard(game.board);
}

// ---- BOOTSTRAP ----
initPieceBanks();
renderCanvasBoard();
