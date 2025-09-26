
// ...existing code...
// CanvasRenderer.ts
// Responsible for drawing the Hive board and pieces on the canvas

import { Board } from '../models/Board';
import { Piece } from '../models/Piece';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement) {
	this.ctx = canvas.getContext('2d')!;
	this.width = canvas.width;
	this.height = canvas.height;
  }

  drawPieceBank(whiteBank: string[], blackBank: string[], selectedIndex: number | null = null, selectedColor: 'White' | 'Black' | null = null) {
	// Draw white pieces bank (top)
	const startX = 60;
	const startY = 60;
	for (let i = 0; i < whiteBank.length; i++) {
	  const x = startX + i * 60;
	  const y = startY;
	  this.ctx.beginPath();
	  this.ctx.arc(x, y, 25, 0, 2 * Math.PI);
	  this.ctx.fillStyle = 'white';
	  this.ctx.fill();
	  this.ctx.strokeStyle = selectedIndex === i && selectedColor === 'White' ? '#00f' : '#333';
	  this.ctx.lineWidth = 3;
	  this.ctx.stroke();
	  this.ctx.lineWidth = 1;
	  this.ctx.fillStyle = '#333';
	  this.ctx.font = '16px sans-serif';
	  this.ctx.textAlign = 'center';
	  this.ctx.textBaseline = 'middle';
	  this.ctx.fillText(whiteBank[i][0].toUpperCase(), x, y);
	}

	// Draw black pieces bank (bottom)
	const bankY = this.height - 60;
	for (let i = 0; i < blackBank.length; i++) {
	  const x = startX + i * 60;
	  const y = bankY;
	  this.ctx.beginPath();
	  this.ctx.arc(x, y, 25, 0, 2 * Math.PI);
	  this.ctx.fillStyle = 'black';
	  this.ctx.fill();
	  this.ctx.strokeStyle = selectedIndex === i && selectedColor === 'Black' ? '#00f' : '#333';
	  this.ctx.lineWidth = 3;
	  this.ctx.stroke();
	  this.ctx.lineWidth = 1;
	  this.ctx.fillStyle = '#fff';
	  this.ctx.font = '16px sans-serif';
	  this.ctx.textAlign = 'center';
	  this.ctx.textBaseline = 'middle';
	  this.ctx.fillText(blackBank[i][0].toUpperCase(), x, y);
	}
  }

  clear() {
	this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawBoard(board: Board) {
  // Custom grid: 4x4, pointy-topped hexes, centered in canvas
  const size = 50;
  const radius = 3;
  const centerX = this.width / 2;
  const centerY = this.height / 2;
	for (let q = -radius; q <= radius; q++) {
	  for (let r = -radius; r <= radius; r++) {
		if (Math.abs(q + r) <= radius) {
		  const x = Math.sqrt(3) * size * (q + r / 2) + centerX;
		  const y = (3 / 2) * size * r + centerY;
		  this.drawHexCustom(x, y, size);
		}
	  }
	}
	// Draw all pieces
	board.pieces.forEach(piece => {
	  this.drawPiece(piece);
	});
  }

  drawHexCustom(x: number, y: number, size: number) {
	this.ctx.beginPath();
	for (let i = 0; i < 6; i++) {
	  const angle = Math.PI / 3 * i + Math.PI / 6;
	  const px = x + size * Math.cos(angle);
	  const py = y + size * Math.sin(angle);
	  if (i === 0) this.ctx.moveTo(px, py);
	  else this.ctx.lineTo(px, py);
	}
	this.ctx.closePath();
	this.ctx.stroke();
	this.ctx.fillStyle = '#ddd';
	this.ctx.fill();
  }

drawPiece(piece: Piece) {
  const { x, y } = this.hexToPixel(piece.position.q, piece.position.r);
  const size = 47; // same as radius for circle
  this.ctx.beginPath();
  for (let i = 0; i < 6; i++) {
	const angle = Math.PI / 3 * i + Math.PI / 6;
	const px = x + size * Math.cos(angle);
	const py = y + size * Math.sin(angle);
	if (i === 0) this.ctx.moveTo(px, py);
	else this.ctx.lineTo(px, py);
  }
  this.ctx.closePath();
  this.ctx.fillStyle = piece.owner === 'White' ? '#e6ec36ff' : '#222';
  this.ctx.fill();
  this.ctx.strokeStyle = '#333';
  this.ctx.lineWidth = 3;
  this.ctx.stroke();
  this.ctx.lineWidth = 1;
}

  // Simple axial hex to pixel conversion
  hexToPixel(q: number, r: number) {
	const size = 40; // hex size
	const x = this.width / 2 + size * Math.sqrt(3) * (q + r/2);
	const y = this.height / 2 + size * 3/2 * r;
	return { x, y };
  }
}

