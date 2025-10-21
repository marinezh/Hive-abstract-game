import type { Player } from '../models/Piece';

export type BankPiece = {
  id: string;
  x: number;
  y: number;
  type: "bee" | "spider" | "beetle" | "hopper" | "ant";
  color: Player;
  width: number;
  height: number;
};

const pieceImages: Record<string, HTMLImageElement> = {};

function getAssetPath(filename: string): string {
  // For local development, assets are served from public/
  // For production, they'll be served from the base URL
  const base = import.meta.env.BASE_URL || '/';
  return `${base}assets/${filename}`;
}

export function loadPieceImage(type: BankPiece["type"], color: Player): HTMLImageElement {
  const key = `${type}_${color}`;
  if (!pieceImages[key]) {
    const img = new Image();
    img.src = getAssetPath(`${type}_${color.toLowerCase()}.png`);
    pieceImages[key] = img;
  }
  return pieceImages[key];
}

export function drawPieceBanks(bankPieces: BankPiece[], ctx: CanvasRenderingContext2D) {
  bankPieces.forEach(piece => {
    const img = loadPieceImage(piece.type, piece.color);
    const { x, y, width, height } = piece;

    // Only draw if image is loaded successfully, otherwise draw placeholder
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, x, y, width, height);
    } 
    // else {
    //   // Draw placeholder rectangle
    //   ctx.fillStyle = piece.color === 'White' ? '#fff' : '#000';
    //   ctx.fillRect(x, y, width, height);
    //   ctx.strokeStyle = piece.color === 'White' ? '#000' : '#fff';
    //   ctx.strokeRect(x, y, width, height);
      
    //   // Draw piece type text
    //   ctx.fillStyle = piece.color === 'White' ? '#000' : '#fff';
    //   ctx.font = '12px Arial';
    //   ctx.textAlign = 'center';
    //   ctx.fillText(piece.type.toUpperCase(), x + width/2, y + height/2 + 4);
    // }
  });
}

// export function layoutBankPositions(bankPieces: BankPiece[], canvasWidth: number, dpr: number, pieceSize: number) {
//   const leftX = 20;
//   const rightX = canvasWidth / dpr - pieceSize - 20;
//   const startY = 60;
//   const gapY = pieceSize + 10;

//   let yBlack = startY;
//   let yWhite = startY;

//   const order = ["bee","spider","beetle","hopper","ant"];

//   const blackPieces = bankPieces.filter(p => p.color === "Black")
//     .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
//   const whitePieces = bankPieces.filter(p => p.color === "White")
//     .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

//   blackPieces.forEach(p => { p.x = leftX;  p.y = yBlack;  yBlack += gapY; });
//   whitePieces.forEach(p => { p.x = rightX; p.y = yWhite;  yWhite += gapY; });
// }

export function layoutBankPositions(
  bankPieces: BankPiece[],
  canvasWidth: number,
  dpr: number,
  pieceSize: number
) {
  // --- Work entirely in canvas pixel units ---
  const leftX = 20 * dpr;
  const rightX = canvasWidth - pieceSize * dpr - 20 * dpr;
  const startY = 60 * dpr;
  const gapY = (pieceSize + 10) * dpr;

  let yBlack = startY;
  let yWhite = startY;

  const order = ["bee", "spider", "beetle", "hopper", "ant"];

  const blackPieces = bankPieces
    .filter(p => p.color === "Black")
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

  const whitePieces = bankPieces
    .filter(p => p.color === "White")
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

  blackPieces.forEach(p => {
    p.x = leftX;
    p.y = yBlack;
    p.width = pieceSize * dpr;
    p.height = pieceSize * dpr;
    yBlack += gapY;
  });

  whitePieces.forEach(p => {
    p.x = rightX;
    p.y = yWhite;
    p.width = pieceSize * dpr;
    p.height = pieceSize * dpr;
    yWhite += gapY;
  });
}
