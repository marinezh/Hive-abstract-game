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

const game = new Game();

// Get canvas and initialize renderer
const canvas = document.getElementById('hive-canvas') as HTMLCanvasElement;
console.log('Canvas element:', canvas);
if (!canvas) {
  throw new Error('Canvas element with id "hive-canvas" not found!');
}
const renderer = new CanvasRenderer(canvas);

// Example: add a white QueenBee at center (0,0)
// Example: place a white QueenBee in center (0,0)
const center: HexCoord = { q: 0, r: 0 };
const queen = new QueenBee('White', center);
game.board.addPiece(queen);

// ----- Render piece banks -----
function renderPieceBank(player: "White" | "Black") {
  const bank = document.getElementById(player.toLowerCase() + "-bank")!;
  // clear previous pieces except the label
  Array.from(bank.children)
       .filter(el => !el.classList.contains("piece-bank-label"))
       .forEach(el => el.remove());

  const pieceTypes = ["bee", "beetle", "spider", "hopper", "ant"];

  for (let i = 0; i < 11; i++) {
    const type = pieceTypes[i % pieceTypes.length];
    const img = document.createElement("img");
    img.src = `./src/assets/${type}_${player.toLowerCase()}.png`;
    img.alt = type;
    img.draggable = true; // for future drag-drop
    bank.appendChild(img);
  }
}

renderPieceBank("White");
renderPieceBank("Black");




// Render board on canvas
function renderCanvasBoard() {
  renderer.clear();
  renderer.drawBoard(game.board);
}

renderCanvasBoard();

// ----- Click handler for board cells -----
const boardEl = document.getElementById('board')!;
boardEl.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const cell = target.closest('.hex-cell') as HTMLElement;
  if (!cell) return;
  console.log('Clicked cell:', cell.id);
  // TODO: move piece logic
});
