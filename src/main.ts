import './style.css';
import { Game } from './game/Game';
import { QueenBee } from './models/QueenBee';
import { CanvasRenderer } from './game/CanvasRenderer';
// import { Board } from './models/Board';
import type { Piece, HexCoord } from './models/Piece';
// import type { Player } from "./models/Piece";


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
canvas.width = 1400 * dpr;
canvas.height = 700 * dpr;
canvas.style.width = "1400px";
canvas.style.height = "700px";

// When calculating positions:
const boardWidth = canvas.width / dpr;
const boardHeight = canvas.height / dpr;

// Create renderer and scale context
const renderer = new CanvasRenderer(canvas);
renderer.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

const game = new Game();

// Example: add a white QueenBee at center (0,0)
const center: HexCoord = { q: 0, r: 0 };
const queen = new QueenBee('White', center);
game.board.addPiece(queen);

const pieceTypes = ["bee", "beetle", "spider", "hopper", "ant"];
const pieceSize = 50; // Size of each piece image

function drawPieceBanksOnCanvas() {
  // Draw black pieces on the left
  pieceTypes.forEach((type, i) => {
    const img = new Image();
    img.src = `./src/assets/${type}_black.png`;
    img.onload = () => {
      const x = 20;
      const y = 60 + i * (pieceSize + 10);
      renderer.ctx.drawImage(img, x, y, pieceSize, pieceSize);
    };
  });

  // Draw white pieces on the right
  pieceTypes.forEach((type, i) => {
    const img = new Image();
    img.src = `./src/assets/${type}_white.png`;
    img.onload = () => {
      const x = canvas.width / dpr - pieceSize - 20;
      const y = 60 + i * (pieceSize + 10);
      renderer.ctx.drawImage(img, x, y, pieceSize, pieceSize);
    };
  });
}

function renderCanvasBoard() {
  renderer.clear();
  renderer.drawBoard(game.board);
  drawPieceBanksOnCanvas();
}

renderCanvasBoard();