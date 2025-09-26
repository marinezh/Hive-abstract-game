import { Board } from "./Board";
import { Piece, Player } from "./Piece";

export class Game {
  board: Board;
  turn: Player = "White";

  constructor() {
    this.board = new Board();
  }

  playPiece(piece: Piece) {
    this.board.addPiece(piece);
    this.nextTurn();
  }

  nextTurn() {
    this.turn = this.turn === "White" ? "Black" : "White";
  }

  checkWin(): Player | null {
    // implement queen-surrounded logic later
    return null;
  }
}
