import { Piece } from "./Piece";
import type { HexCoord } from "./Piece";
import type { Board } from "./Board";

export class QueenBee extends Piece {
  legalMoves(board: Board): HexCoord[] {
    return board.neighbors(this.position)
                .filter(c => board.canSlide(this.position, c));
  }
}