import type { Board } from "./Board";

export type HexCoord = { q: number; r: number };
export type Player = "White" | "Black";

export abstract class Piece {
  readonly owner: Player;
  position: HexCoord;

  constructor(owner: Player, position: HexCoord) {
    this.owner = owner;
    this.position = position;
  }

  /** Return all legal target coordinates from current position */
  abstract legalMoves(board: Board): HexCoord[];
}
