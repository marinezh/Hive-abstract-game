import './style.css';
//import { showPopup } from "./popup";
import "./popup";
import { Game } from './game/Game';
import { drawPieceBanks, layoutBankPositions } from './game/PieceBank';
import type { BankPiece } from './game/PieceBank';
import { pixelToHex } from './game/hexUtils';
import { createPiece } from './models/createPiece';
import { CanvasRenderer } from './game/CanvasRenderer';
import {showWinnerPopup} from './popup'
import type { Piece, Player } from './models/Piece';


let bankPieces: BankPiece[] = [];
let selected:
	| { from: "bank"; bankId: string; type: BankPiece["type"]; color: Player }
	| { from: "board"; ref: Piece }
	| null = null;

const canvas = document.getElementById('hive-canvas') as HTMLCanvasElement;

// High-DPI setup
const dpr = window.devicePixelRatio || 1;
canvas.width = 1000 * dpr;
canvas.height = 750 * dpr;
canvas.style.width = "1000px";
canvas.style.height = "750px";

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
	layoutBankPositions(bankPieces, canvas.width, dpr, pieceSize);
}

let hoveredHex: { q: number, r: number } | null = null;

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
		const { q, r } = p.position;
		const { x, y } = renderer.hexToPixel(q, r);
		const dx = clickX - x, dy = clickY - y;
		if (dx*dx + dy*dy <= (HEX_SIZE * 0.8) ** 2) {
			selected = { from: "board", ref: p };
			return;
		}
	}

	// 3) PLACE OR MOVE
	// if (selected) {
	// 	 const sel = selected; 
	// 	const target = pixelToHex(clickX - centerX, clickY - centerY, HEX_SIZE);

	// 	if (sel.from === "bank") {
	// 		const pieceObj = createPiece(sel.type, sel.color, target);
	// 		if (pieceObj) {
	// 			game.board.addPiece(pieceObj, target);

	// 			// remove from bank + reflow
	// 			const idx = bankPieces.findIndex(p => p.id === sel.bankId);
	// 			if (idx !== -1) {
	// 				bankPieces.splice(idx, 1);
	// 				layoutBankPositions(bankPieces, canvas.width, dpr, pieceSize);
	// 			}
	// 		}
	// 	} else if (sel.from === "board") {
	// 	sel.ref.position = target;
	// }
	// 	selected = null;
	// 	renderCanvasBoard();
	// }
		if (selected) {
	  const sel = selected;
	  const target = pixelToHex(clickX - centerX, clickY - centerY, HEX_SIZE);

	  if (sel.from === "bank") {
	    const pieceObj = createPiece(sel.type, sel.color, target);
	    if (pieceObj && game.placePiece(pieceObj, target)) {
	      // remove from bank + reflow
	      const idx = bankPieces.findIndex(p => p.id === sel.bankId);
	      if (idx !== -1) {
	        bankPieces.splice(idx, 1);
	        layoutBankPositions(bankPieces, canvas.width, dpr, pieceSize);
	      }
				 game.nextTurn(); 
	    }
	  } else if (sel.from === "board") {
	    game.movePiece(sel.ref, target);
	  }
	  selected = null;
	  renderCanvasBoard();
		document.getElementById('game-status')!.textContent = `Next move: ${game.currentPlayer}`;
		// DEBUG (check the winner)

		const winner = game.checkWin();
		if (winner) {
		  console.log(`Winner: ${winner}`);
		  showWinnerPopup(winner);
		}
	}
});

canvas.addEventListener('mousemove', (e) => {
	const rect = canvas.getBoundingClientRect();
	const mouseX = e.clientX - rect.left;
	const mouseY = e.clientY - rect.top;
	const centerX = canvas.width / dpr / 2;
	const centerY = canvas.height / dpr / 2;
	const newHoveredHex = pixelToHex(mouseX - centerX, mouseY - centerY, HEX_SIZE);
	// Only redraw if hovered hex actually changes
	if (!hoveredHex || hoveredHex.q !== newHoveredHex.q || hoveredHex.r !== newHoveredHex.r) {
		hoveredHex = newHoveredHex;
		renderCanvasBoard();
	}
});

canvas.addEventListener('mouseleave', () => {
	hoveredHex = null;
	renderCanvasBoard();
});

// ---- RENDER LOOP ----
function renderCanvasBoard() {
	renderer.clear();
	drawPieceBanks(bankPieces, renderer.ctx);
	renderer.drawBoard(game.board, hoveredHex);
}

// ---- BOOTSTRAP ----
initPieceBanks();
renderCanvasBoard();

