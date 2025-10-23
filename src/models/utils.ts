import type { HexCoord, Piece } from "./Piece";
import type { Board } from "./Board";

/** cells adjacent to both `a` and `b` */
function sharedNeighbors(board: Board, a: HexCoord, b: HexCoord): HexCoord[] {
  const an = board.neighbors(a);
  const bn = board.neighbors(b);
  return an.filter(n => bn.some(m => m.q === n.q && m.r === n.r));
}

/**
 * Returns true if a piece can slide from `from` to `to` on the board.
 * - The `to` hex must be empty
 * - Must not break the hive (assume board.isHiveIntact(from) exists)
 * - Must be adjacent to at least one piece (sliding rule)
 */
export function canSlide(board: Board, from: HexCoord, to: HexCoord): boolean {
  if (!board.isEmpty(to)) return false;

  // check that target has at least one neighbor
  const neighbors = board.neighbors(to);
  const hasNeighbor = neighbors.some(n => !board.isEmpty(n));
  if (!hasNeighbor) return false;

  // corridor rule: the two cells adjacent to BOTH from & to
  const shared = sharedNeighbors(board, from, to);
  const blocked = shared.length === 2 &&
                  shared.every(n => !board.isEmpty(n));
  if (blocked) return false;

  return true;
}

export function isTopPiece(piece: Piece, board: Board): boolean {
  const stack = board.getStackAt(piece.position);
  return stack.length > 0 && stack[stack.length - 1] === piece;
}

export function topPieceAt(board: Board, coord: { q: number; r: number }): Piece | null {
  const stack = board.getStackAt(coord); // get all pieces at this hex
  if (!stack || stack.length === 0) return null; // empty hex
  return stack[stack.length - 1]; // topmost piece
}

export function showError(message: string) {
  const errorEl = document.getElementById('game-error');
  if (!errorEl) return;
  errorEl.textContent = message;
  setTimeout(() => { errorEl.textContent = ''; }, 5000); // auto clear after 2.5s
}

export function getMousePos(evt: MouseEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const x = (evt.clientX - rect.left);
  const y = (evt.clientY - rect.top);
  // Convert from CSS pixels to your logical coordinate system
  return { x, y };
}

export function hasAvailableMoves(
  board: Board,
  player: "White" | "Black",
  bankPieces: { color: string; type: string }[]
): boolean {
  // 1️⃣ Check if player still has pieces in the bank
  const playerBankPieces = bankPieces.filter(p => p.color === player);
  if (playerBankPieces.length > 0) {
    const allCoords = board.allCoordsAroundHive();

    for (const coord of allCoords) {
      if (!board.isEmpty(coord)) continue;

      const neighbors = board.neighbors(coord)
        .map(n => topPieceAt(board, n))
        .filter((p): p is Piece => p !== null);

      if (neighbors.length === 0) continue;

      const touchesOwn = neighbors.some(n => n.owner === player);
      const touchesOpponent = neighbors.some(n => n.owner !== player);

      if (touchesOwn && !touchesOpponent) {
        return true; // ✅ legal placement available
      }
    }
  }

  // 2️⃣ Check if any top piece of this player can move
  for (const piece of board.pieces) {
    if (piece.owner !== player) continue;
    if (!isTopPiece(piece, board)) continue;

    if (piece.legalMoves(board).length > 0) {
      return true; // ✅ move exists
    }
  }

  // 🚫 No legal moves found
  return false;
}
