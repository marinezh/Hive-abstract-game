// -------- Styles & Basics --------
import './style.css';
import "./popup";

// -------- Styles & Basics --------
import { Game } from './game/Game';
import { layoutBankPositions } from './game/PieceBank';
import type { BankPiece } from './game/PieceBank';
import { hasAvailableMoves } from './game/rules';
import { createPiece } from './models/createPiece';
import {showWinnerPopup} from './popup'
import type { Piece, Player } from './models/Piece';
import { Board } from "./models/Board";
import type { CanvasRenderer } from "./game/CanvasRenderer";

// -------- UI / Rendering --------
import { setupCanvas } from "./ui/canvasView";
import { renderCanvasBoard } from "./ui/render";
import { initUIEvents } from "./ui/events";
import { showError } from './ui/uiUtils';

// -------------- AI ---------------
import { AIController } from "./agent/aiController";

// ===============================
//  CANVAS SETUP
// ===============================
const width = 1000;
const height = 800;
const HEX_SIZE = 25;
const pieceSize = 45;  // Adjust this value to change bank piece size

const { canvas, renderer } = setupCanvas(
  "hive-canvas",
  width,
  height,
  HEX_SIZE
);

// ===============================
// 📌 PRELOAD IMAGES
// ===============================
function preloadImages(): Promise<void> {
  const types = ["bee", "spider", "beetle", "hopper", "ant"];
  const colors = ["black", "white"];
  const promises: Promise<void>[] = [];

  types.forEach(type => {
    colors.forEach(color => {
      const img = new Image();
      const base = import.meta.env.BASE_URL || '/';
      img.src = `${base}assets/${type}_${color}.png`;
      
      const promise = new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => {
          console.warn(`Failed to load: ${img.src}`);
          resolve(); // Resolve anyway to not block
        };
      });
      
      promises.push(promise);
    });
  });

  return Promise.all(promises).then(() => {});
}

// ===============================
// 📌 GAME INITIALIZATION
// ===============================

const game = new Game();
layoutBankPositions(game.bank, width, pieceSize);
let selected:
	| { from: "bank"; bankId: string; type: BankPiece["type"]; color: Player }
	| { from: "board"; ref: Piece }
	| null = null;
let mousePos = { x: 0, y: 0 };
const ai = new AIController(game);
ai.onMoveComplete = () => nextTurnOrSkip();
// ✅ Restore AI mode after reload
if (localStorage.getItem("playAgainstAI") === "true") {
  ai.enable();
  game.aiEnabled = true;
  game.aiPlays = "Black";
  document.querySelector(".toggle")?.classList.add('active');
  // showError("🤖 Playing against AI");
  showError("🤖 AI on");
} else {
  showError("🤖 AI off");
}
let hoveredHex: { q: number, r: number } | null = null;

// -------------------------------
// HANDLER — BANK SELECTION
// -------------------------------

function handleBankClick(b: BankPiece) {

  // DROP BACK if already holding a bank piece
  if (selected?.from === "bank") {
    selected = null;
    game.validMoves = [];
    showError("❌ Placement cancelled");

    renderCanvasBoard(
      renderer,
      game.board,
      game.bank,
      hoveredHex,
      selected,
      game.validMoves,
      mousePos,
      HEX_SIZE
    );
    return;
  }

// ================= AI PROTECTION =================
if (game.aiEnabled) {
  if (game.currentPlayer === game.aiPlays) {
    showError("🤖 AI is thinking...");
    return;
  }
  if (b.color === game.aiPlays) {
    showError(`🤖 You cannot play ${game.aiPlays}, AI controls it!`);
    return;
  }
}
  // =================================================
  if (!game.currentPlayer) {
    game.currentPlayer = b.color;
    console.log(`First player: ${game.currentPlayer}`);
    document.getElementById('game-status')!.textContent =
      `${game.currentPlayer} moves first`;
  }

  selected = { from: "bank", bankId: b.id, type: b.type, color: b.color };
  console.log(`Selected from bank: ${selected.color}, ${selected.type}`);
}

// -------------------------------
// HANDLER — HEX CLICK (MOVE OR PLACE)
// -------------------------------
function handleHexClick(hex: { q: number; r: number }) {

  // If AI is playing and it's AI’s turn
  if (game.aiEnabled && game.currentPlayer === game.aiPlays) {
  showError("🤖 AI is thinking...");
  return;
  }

  if (!selected) {
    // Selecting board piece
    const piece = game.board.topPieceAt(game.board, hex);

    // Prevent selecting AI-owned pieces
    if (game.aiEnabled && piece && piece.owner === game.aiPlays) {
      showError("🤖 You cannot move Black — AI plays Black!");
      return;
    }

    if (
      piece &&
      piece.owner === game.currentPlayer
    ) {
      selected = { from: "board", ref: piece };
      console.log(`Selected from board: ${piece.owner}, ${piece.type}`);
      game.validMoves = piece.legalMoves(game.board);
      return;
    }

    return;
  }

  // ---- BANK → PLACE ----
  if (selected.from === "bank") {
    placeFromBank(hex);
  }

  // ---- BOARD → MOVE ----
  else if (selected.from === "board") {
    moveFromBoard(hex);
  }

  selected = null;
  game.validMoves = [];

  renderCanvasBoard(
    renderer,
    game.board,
    game.bank,
    hoveredHex,
    selected,
    game.validMoves,
    mousePos,
    HEX_SIZE
  );
}

// -------------------------------
// PLACE FROM BANK
// -------------------------------
function placeFromBank(hex: { q: number; r: number }) {
  const sel = selected!;
  if (sel.from === "bank") {
    const pieceObj = createPiece(sel.type, sel.color, hex);
    if (!pieceObj) return;

    if (game.placePiece(pieceObj, hex)) {
      const idx = game.bank.findIndex((p) => p.id === sel.bankId);
      if (idx !== -1) {
        game.bank.splice(idx, 1);
        layoutBankPositions(game.bank, width, pieceSize);
      }
      updateCameraIfNeeded(game.board, renderer);
      nextTurnOrSkip();
    }
  }
}

// -------------------------------
// MOVE FROM BOARD
// -------------------------------
function moveFromBoard(hex: { q: number; r: number }) {
    if (!selected || selected.from !== "board") return;

    const piece = selected.ref;

    if (game.movePiece(piece, hex)) {
      updateCameraIfNeeded(game.board, renderer);
      nextTurnOrSkip();
    }

    selected = null;
    game.validMoves = [];
    renderCanvasBoard(renderer, game.board, game.bank, hoveredHex, selected, game.validMoves, mousePos, HEX_SIZE);
}

// -------------------------------
// TURN LOGIC (skip if no moves)
// -------------------------------
function nextTurnOrSkip() {
  if (game.isGameOver) return;
  const next = game.currentPlayer === "White" ? "Black" : "White";
  console.log(`Now turn of: ${next}`);
  if (!hasAvailableMoves(game.board, next, game.bank)) {
    console.log(`${next} has no availible moves`);
    showError(`⚠️ ${next} has no legal moves — turn skipped!`);
  } else {
    console.log(`${next} has availible moves`);
    game.nextTurn();
  }

  // clear selection after turn change
  selected = null;
  game.validMoves = [];

  document.getElementById("game-status")!.textContent =
    `${game.currentPlayer}`;

  // Re-render the board to show changes
  renderCanvasBoard(
    renderer,
    game.board,
    game.bank,
    hoveredHex,
    selected,
    game.validMoves,
    mousePos,
    HEX_SIZE
  );

  // Trigger AI AFTER UI updates
  if (ai.isEnabled && game.currentPlayer === game.aiPlays) {
    setTimeout(() => ai.makeMoveIfNeeded(), 1000);
  }
  const winner = game.checkWin();
  if (winner) {
    game.isGameOver = true;
    showWinnerPopup(winner);
  }
}

// -------------------------------
// HANDLER — HOVER
// -------------------------------
function handleHover(
  hex: { q: number; r: number } | null,
  mouse: { x: number; y: number }
) {
  hoveredHex = hex;
  mousePos = mouse;

  renderCanvasBoard(
    renderer,
    game.board,
    game.bank,
    hoveredHex,
    selected,
    game.validMoves,
    mousePos,
    HEX_SIZE
  );
}

// ===============================
//   AI 
// ===============================

// ===============================
//   AI TOGGLE
// ===============================

document.getElementById("play_against_ai")!
  .addEventListener("click", (e) => {
    e.preventDefault(); // Prevent any default behavior
    e.stopPropagation(); // Stop event bubbling
    
    const toggle = document.querySelector(".toggle");

    // If AI already ON → turn it OFF and reload
    if (ai.isEnabled) {
      localStorage.removeItem("playAgainstAI");
      toggle?.classList.remove('active');
      
      setTimeout(() => {
        location.reload();
      }, 350);
      return;
    }

    // AI is being enabled → save and reload
    localStorage.setItem("playAgainstAI", "true");
    toggle?.classList.add('active');
    
    setTimeout(() => {
      location.reload();
    }, 350);
});

// ===============================
// CAMERA MOVE
// ===============================
const SAFE_RADIUS = 7;

function updateCameraIfNeeded(board: Board, renderer: CanvasRenderer) {
  let worstPiece: { q: number; r: number } | null = null;
  let worstDist = 0;

  for (const p of board.pieces) {
    const dq = p.position.q - renderer.cameraQ;
    const dr = p.position.r - renderer.cameraR;

    const dist = Math.max(Math.abs(dq), Math.abs(dr));

    if (dist > worstDist) {
      worstDist = dist;
      worstPiece = p.position;
    }
  }

  // Move camera only if hive approaches edge
  if (worstPiece && worstDist >= SAFE_RADIUS) {
    renderer.cameraQ += Math.sign(worstPiece.q - renderer.cameraQ);
    renderer.cameraR += Math.sign(worstPiece.r - renderer.cameraR);
  }
}

// ===============================
// 📌 INITIALIZE APP AFTER IMAGES LOAD
// ===============================
async function initializeApp() {
  // Wait for all images to load
  await preloadImages();
  
  // Now render the board with loaded images
  renderCanvasBoard(
    renderer,
    game.board,
    game.bank,
    hoveredHex,
    selected,
    game.validMoves,
    mousePos,
    HEX_SIZE
  );

  document.getElementById("game-container")?.classList.remove("hidden");
  document.body.classList.add("ready");

  // Attach UI events
  initUIEvents(canvas, game.bank, renderer, {
    onHexClick: handleHexClick,
    onBankClick: handleBankClick,
    onHoverHex: handleHover
  });
}

// Start the app
initializeApp();

// ===============================
// 📌 OLD CODE - MOVED INTO initializeApp()
// ===============================
// renderCanvasBoard(
//   renderer,
//   game.board,
//   game.bank,
//   hoveredHex,
//   selected,
//   game.validMoves,
//   mousePos,
//   HEX_SIZE
// );

// document.getElementById("game-container")?.classList.remove("hidden");
// document.body.classList.add("ready");

