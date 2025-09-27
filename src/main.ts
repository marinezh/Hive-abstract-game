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
canvas.height = 800 * dpr;
canvas.style.width = "1400px";
canvas.style.height = "800px";

// When calculating positions:
// const boardWidth = canvas.width / dpr;
// const boardHeight = canvas.height / dpr;

// Create renderer and scale context
const renderer = new CanvasRenderer(canvas);
renderer.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

const game = new Game();

// Example: add a white QueenBee at center (0,0)
const center: HexCoord = { q: 0, r: 0 };
const queen = new QueenBee('White', center);
game.board.addPiece(queen,{ q: 0, r: 0 });


const pieceBankConfig = [
  { type: "bee", count: 1 },
  { type: "spider", count: 2 },
  { type: "beetle", count: 2 },
  { type: "hopper", count: 3 }, // grasshopper
  { type: "ant", count: 3 },    // soldier ant
];
const pieceSize = 50;

function drawPieceBankOnCanvas(player: "White" | "Black") {
  let y = 60;
  pieceBankConfig.forEach(({ type, count }) => {
    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.src = `./src/assets/${type}_${player.toLowerCase()}.png`;
      const drawY = y; // capture current y value
      img.onload = () => {
        const x = player === "Black" ? 20 : canvas.width / dpr - pieceSize - 20;
        renderer.ctx.drawImage(img, x, drawY, pieceSize, pieceSize);
      };
      y += pieceSize + 10;
    }
  });
}


function renderCanvasBoard() {
  renderer.clear();
  renderer.drawBoard(game.board);
  drawPieceBankOnCanvas("Black");
  drawPieceBankOnCanvas("White");
}

renderCanvasBoard();