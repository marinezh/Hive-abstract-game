import type { HexCoord, Piece } from "./Piece";

export class Board {
  pieces: Piece[] = [];

  // Return all neighbors for a given hex
  neighbors(pos: HexCoord): HexCoord[] {
    // stub example
    return [
      { q: pos.q + 1, r: pos.r },
      { q: pos.q - 1, r: pos.r },
      { q: pos.q, r: pos.r + 1 },
      { q: pos.q, r: pos.r - 1 },
      { q: pos.q + 1, r: pos.r - 1 },
      { q: pos.q - 1, r: pos.r + 1 }
    ];
  }

  // Stub slide check
  canSlide(from: HexCoord, to: HexCoord): boolean {
    return true;
  }

  // Add piece to board
  addPiece(piece: Piece) {
    this.pieces.push(piece);
  }
}