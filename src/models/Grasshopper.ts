import { Piece } from "./Piece";
import type { HexCoord } from "./Piece";
import type { Board } from "./Board";

/**
 * Grasshopper:
 * - Jumps in a straight line over one or more contiguous occupied hexes.
 * - Must land on the first empty hex beyond that contiguous line.
 * - Jumps may be along any of the 6 hex directions.
 * - Cannot move if no occupied neighbor exists in the chosen direction.
 */
export class Grasshopper extends Piece {
  readonly type = "hopper";
  // legalMoves(board: Board): HexCoord[] {
  //   const moves: HexCoord[] = [];

  //   for (const dir of board.directions()) {
  //     let next = board.addDir(this.position, dir);
  //     let jumped = false;

  //     while (!board.isEmpty(next)) {
  //       jumped = true;
  //       next = board.addDir(next, dir); // move one step further in the same direction
  //     }

  //     if (jumped) moves.push(next);
  //   }

  //   return moves;
  // }
  legalMoves(board: Board): HexCoord[] {
    const moves: HexCoord[] = [];
    const radius = 6; // match your board radius

    for (const dir of board.directions()) {
      let next = board.addDir(this.position, dir);
      let jumped = false;

      // Jump over occupied hexes in this direction
      while (!board.isEmpty(next)) {
        jumped = true;
        next = board.addDir(next, dir);
      }

      // Only consider valid moves if at least one piece was jumped
      if (jumped) {
        // Skip if outside board
        if (Math.abs(next.q) > radius || Math.abs(next.r) > radius || Math.abs(next.q + next.r) > radius) 
          continue;

        // Skip if moving breaks the hive
        if (!board.isHiveIntact(this, next)) continue;

        moves.push(next);
      }
    }

    return moves;
  }
}