import type { HexCoord } from "./Piece";
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

  // check that hive stays connected
  if (!board.isHiveIntact(from)) return false;

  // corridor rule: the two cells adjacent to BOTH from & to
  const shared = sharedNeighbors(board, from, to);
  const blocked = shared.length === 2 &&
                  shared.every(n => !board.isEmpty(n));
  if (blocked) return false;

  return true;
}