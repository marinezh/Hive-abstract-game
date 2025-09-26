import { Piece } from "./Piece";
import { Board, HexCoord } from "./Board"; 

export class QueenBee extends Piece {
  legalMoves(board: Board): HexCoord[] {
    return board.neighbors(this.position)
                .filter(c => board.canSlide(this.position, c));
  }
}