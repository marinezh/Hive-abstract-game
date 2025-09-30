import { Board } from "../models/Board";
import { Piece } from "../models/Piece";
import type { Player } from "../models/Piece";
import { showWinnerPopup } from "../popup";

// When you detect a win:
showWinnerPopup("White"); // or showWinnerPopup("Black");

/**
 * Game: manages game state and main rules.
 *
 * - board: holds pieces and helper methods
 * - currentPlayer: "White" | "Black"
 * - movesMade: number of moves each player already performed
 * - placePiece(piece, coord): place a piece from the player's hand on the board
 * - movePiece(piece, coord): move an existing piece on the board
 * - enforces "Queen must be placed by 4th turn" rule
 * - validates moves via piece.legalMoves(board)
 * - determines game over (queen surrounded)
 */

export class Game {
  board: Board;
  currentPlayer: Player;
  turnCount: number;

  constructor() {
    this.board = new Board();
    this.currentPlayer = "White";
    this.turnCount = 1;
  }

  /** Switch to the other player and increment turn */
  nextTurn(): void {
    this.currentPlayer = this.currentPlayer === "White" ? "Black" : "White";
    this.turnCount++;
  }

  /**
   * Place a piece on the board if the move is valid.
   * Checks:
   *  - Destination is empty
   *  - If not the very first move, new piece must touch at least one piece
   *  - QueenBee must be placed by each player's 4th turn
   */
  placePiece(piece: Piece, coord: { q: number; r: number }): boolean {
    // destination must be empty
    console.log("placePiece", coord.q, coord.r, "piece type:", piece.type, "player:", piece.owner);

    if (piece.owner !== this.currentPlayer) {
      console.log("❌ Wrong player");
      return false;
    }
    if (!this.board.isEmpty(coord)) {
      console.log("❌ Position not empty");
      return false;
    }

    if (this.board.pieces.length === 0) {
      console.log("✅ First piece placement");
      this.board.addPiece(piece, coord);
      return true;
    }
  
    const neighbors = this.board.neighbors(coord);
    let touchesOwn = false;

    for (const n of neighbors) {
      const piece = this.board.pieces.find(p => p.position.q === n.q && p.position.r === n.r);
      if (!piece) continue;
      if (piece.owner === this.currentPlayer) touchesOwn = true;
      else {
        console.log("❌ Touches enemy piece");
        return false;
      }
    }

    if (this.board.pieces.length > 1 && !touchesOwn) {
      console.log("❌ Doesn't touch own pieces");
      return false;
    }

    // queen-bee rule: each player must place queen by their 4th turn
    const samePlayerPieces = this.board.pieces.filter(
      p => p.owner === piece.owner
    );
    const hasQueen = samePlayerPieces.some(p => p.type === "bee");
    console.log(`🐝 Player ${piece.owner} has ${samePlayerPieces.length} pieces, hasQueen: ${hasQueen}, placing: ${piece.type}`);
    
    if (!hasQueen && samePlayerPieces.length >= 3 && piece.type !== "bee") {
      console.log("❌ Must place Queen Bee by 4th turn!");
      return false;
    }

    // all checks passed: add to board
    console.log("✅ Piece placed successfully");
    this.board.addPiece(piece, coord);
    this.board.updateStackLevelsAt(coord);
    return true;
  }

  /**
   * Moving pieces that are already on the board.
   * Checks:
   *  - The piece belongs to the current player
   *  - The destination is one of piece.legalMoves(board)
   *  - The hive remains intact after the move
   * Result:
   *  - Remove the piece from its old hex
   *  - Set its position to the new hex
   */
  movePiece(piece: Piece, to: { q: number; r: number }): boolean {
    // must be this player's piece
    if (piece.owner !== this.currentPlayer) return false;

    // check if move legal
    const legal = piece.legalMoves(this.board);
    const allowed = legal.some(c => c.q === to.q && c.r === to.r);
    if (!allowed) {
      console.log("Move failed: Not a legal move");
      console.log("Legal moves:", legal);
      console.log("Attempted move to:", to);
    return false;
    }

    // try the move and ensure hive stays intact
   // const old = { ...piece.position };
    if (this.board.pieces.length > 2) {
      piece.position = to;
      // if (!this.board.isHiveIntact(piece, piece.owner)) {
      //   // revert if the hive would break
      //   piece.position = old;
      //   console.log("Move failed: Hive not intact");
      //   return false;
      // }
    }

    piece.position = to;
    // this.board.updateStackLevelsAt(old);
    piece.stackLevel = this.board.updateStackLevelsAt(to);
    return true;
  }

  checkWin(): Player | null {
    const queens = this.board.pieces.filter(p => p.type === "bee");
    for (const q of queens) {
      const neighbors = this.board.neighbors(q.position);
      const surrounded = neighbors.every(n => !this.board.isEmpty(n));
      if (surrounded) return q.owner === "White" ? "Black" : "White";
    }
    return null;
  }
}