import type { Player } from '../models/Piece';

import { loadPieceImage } from './CanvasRenderer';

export type BankPiece = {
  id: string;
  x: number;
  y: number;
  type: "bee" | "spider" | "beetle" | "hopper" | "ant";
  color: Player;
  width: number;
  height: number;
};

export function drawPieceBanks(bankPieces: BankPiece[], ctx: CanvasRenderingContext2D) {
  bankPieces.forEach(piece => {
    // Map bank piece types to the actual constructor names used in CanvasRenderer
    let typeKey: string = piece.type;
    if (piece.type === "bee") typeKey = "QueenBee";
    if (piece.type === "ant") typeKey = "SoldierAnt";
    if (piece.type === "hopper") typeKey = "Grasshopper";
    if (piece.type === "spider") typeKey = "Spider";
    if (piece.type === "beetle") typeKey = "Beetle";
    
    console.log(`🔍 PieceBank calling loadPieceImage with: type="${typeKey}", color="${piece.color}"`);
    const img = loadPieceImage(typeKey, piece.color);
    
    // Check if image is loaded before drawing
    if (img.complete && img.naturalWidth !== 0) {
      ctx.drawImage(img, piece.x, piece.y, piece.width, piece.height);
    } else {
      // Wait for image to load, then redraw
      img.onload = () => {
        ctx.drawImage(img, piece.x, piece.y, piece.width, piece.height);
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${img.src} for piece type: ${piece.type}, color: ${piece.color}`);
      };
    }
  });
}

export function layoutBankPositions(bankPieces: BankPiece[], canvasWidth: number, dpr: number, pieceSize: number) {
  const leftX = 20;
  const rightX = canvasWidth / dpr - pieceSize - 20;
  const startY = 60;
  const gapY = pieceSize + 10;

  let yBlack = startY;
  let yWhite = startY;

  const order = ["bee","spider","beetle","hopper","ant"];

  const blackPieces = bankPieces.filter(p => p.color === "Black")
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  const whitePieces = bankPieces.filter(p => p.color === "White")
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

  blackPieces.forEach(p => { p.x = leftX;  p.y = yBlack;  yBlack += gapY; });
  whitePieces.forEach(p => { p.x = rightX; p.y = yWhite;  yWhite += gapY; });
}
