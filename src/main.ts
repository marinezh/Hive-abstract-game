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
  <div id="game-container" style="display:flex; gap: 20px;">
    <div id="white-bank" class="piece-bank"></div>
    <div id="board" class="board"></div>
    <div id="black-bank" class="piece-bank"></div>
  </div>
`;

const game = new Game();

// Example: add a white QueenBee at center (0,0)
const center: HexCoord = { q: 0, r: 0 };
const queen = new QueenBee('White', center);
game.board.addPiece(queen);

function renderBoard() {
  const boardDiv = document.getElementById('board')!;
  boardDiv.innerHTML = ''; // clear previous render

game.board.pieces.forEach((piece: Piece) => {
  const el = document.createElement('div');
  el.className = `hex-cell ${piece.owner.toLowerCase()}`;
  el.textContent = piece.constructor.name;
  boardDiv.appendChild(el);
});
}

renderBoard();

const board = document.getElementById('board'); // DOM element

board?.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  console.log('Clicked cell:', target.id);
  // TODO: move piece logic here
});

