// main.ts
import './style.css';
import { Game } from './game/Game';
import { QueenBee } from './models/QueenBee';
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

  const pieceTypes = ["queenbee", "beetle", "spider", "grasshopper", "soldier"];

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

// ----- Render board -----
function renderBoard() {
  const boardDiv = document.getElementById('board')!;
  boardDiv.innerHTML = '';

  const size = 5; // placeholder 5x5 grid
  for (let r = -2; r <= 2; r++) {
    const row = document.createElement('div');
    row.className = 'hex-row';

    for (let q = -2; q <= 2; q++) {
      const cell = document.createElement('div');
      cell.className = 'hex-cell';
      cell.id = `cell-${q}-${r}`;

      // Place piece image if a piece exists here
      const piece = game.board.pieces.find(p => p.position.q === q && p.position.r === r);
      if (piece) {
        const img = document.createElement('img');
        img.src = `./src/assets/${piece.constructor.name.toLowerCase()}_${piece.owner.toLowerCase()}.png`;
        img.alt = piece.constructor.name;
        cell.appendChild(img);
      }

      row.appendChild(cell);
    }

    boardDiv.appendChild(row);
  }
}

renderBoard();

// ----- Click handler for board cells -----
const boardEl = document.getElementById('board')!;
boardEl.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const cell = target.closest('.hex-cell') as HTMLElement;
  if (!cell) return;
  console.log('Clicked cell:', cell.id);
  // TODO: move piece logic
});
