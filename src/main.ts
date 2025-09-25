// main.ts
import './style.css';

// Get the app container
const app = document.getElementById('app');

if (app) {
  app.innerHTML = `
    <h1>Hive Game</h1>
    <div id="board" class="board"></div>
  `;
}

// Optional: simple function to create a hex cell (for later)
function createHexCell(id: string) {
  const cell = document.createElement('div');
  cell.className = 'hex-cell';
  cell.id = id;
  return cell;
}

// Example: create a 3x3 placeholder grid
const board = document.getElementById('board');
if (board) {
  for (let i = 0; i < 3; i++) {
    const row = document.createElement('div');
    row.className = 'hex-row';
    for (let j = 0; j < 3; j++) {
      row.appendChild(createHexCell(`cell-${i}-${j}`));
    }
    board.appendChild(row);
  }
}
