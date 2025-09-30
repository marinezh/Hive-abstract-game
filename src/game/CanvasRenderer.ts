import { Board } from '../models/Board';
import { Piece } from '../models/Piece';

const piecePaths: Record<string, string> = {
  "QueenBee_white": "/assets/QueenBee_white.png",
  "QueenBee_black": "/assets/QueenBee_black.png",
  "SoldierAnt_white": "/assets/SoldierAnt_white.png",
  "SoldierAnt_black": "/assets/SoldierAnt_black.png",
  "Beetle_white": "/assets/Beetle_white.png",
  "Beetle_black": "/assets/Beetle_black.png",
  "Grasshopper_white": "/assets/Grasshopper_white.png",
  "Grasshopper_black": "/assets/Grasshopper_black.png",
  "Spider_white": "/assets/Spider_white.png",
  "Spider_black": "/assets/Spider_black.png",
};
console.log("piecePaths", piecePaths);

const pieceImages: Record<string, HTMLImageElement> = {};

export function loadPieceImage(type: string, color: string): HTMLImageElement {
  const key = `${type}_${color.toLowerCase()}`;

  if (!piecePaths[key]) {
    console.error(
      "❌ Missing asset for key:", key,
      "\nType:", type,
      "\nColor:", color,
      "\nAvailable keys:", Object.keys(piecePaths)
    );
    return new Image();
  }

  if (!pieceImages[key]) {
    const img = new Image();
    img.src = piecePaths[key];

    img.onload = () => {
      console.log("✅ Loaded image:", key, "→", img.src);
    };

    img.onerror = () => {
      console.error("🚨 Failed to load image:", key, "→", img.src);
    };

    pieceImages[key] = img;
  }

  return pieceImages[key];
}



export class CanvasRenderer {
  public ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private size: number; // hex size

  constructor(canvas: HTMLCanvasElement, size = 30) {
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.size = size;
  }

  clear() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  // Convert axial (q,r) → pixel (x,y)
  public hexToPixel(q: number, r: number) {
    const dpr = window.devicePixelRatio || 1;
    const centerX = this.width / dpr / 2;
    const centerY = this.height / dpr / 2;
    const x = Math.sqrt(3) * this.size * (q + r / 2) + centerX;
    const y = (3 / 2) * this.size * r + centerY;
    return { x, y };
  }

  // drawBoard(board: Board, hoveredHex?: { q: number; r: number } | null) {
  //   const radius = 6;
  //   for (let q = -radius; q <= radius; q++) {
  //     for (let r = -radius; r <= radius; r++) {
  //       if (Math.abs(q + r) <= radius) {
  //         const { x, y } = this.hexToPixel(q, r);
  //         if (hoveredHex && hoveredHex.q === q && hoveredHex.r === r) {
  //           this.drawHexCustom(x, y, this.size, '#ffe066');
  //         } else {
  //           this.drawHexCustom(x, y, this.size);
  //         }
  //       }
  //     }
  //   }
  //   // Draw all pieces
  //   board.pieces.forEach(piece => this.drawPiece(piece));
  // }

  drawBoard(board: Board, hoveredHex?: { q: number; r: number } | null) {
    const radius = 6;

    // --- 1. Draw the hex grid ---
    for (let q = -radius; q <= radius; q++) {
      for (let r = -radius; r <= radius; r++) {
        if (Math.abs(q + r) <= radius) {
          const { x, y } = this.hexToPixel(q, r);
          const isHovered = hoveredHex && hoveredHex.q === q && hoveredHex.r === r;
          this.drawHexCustom(x, y, this.size, isHovered ? '#ffe066' : undefined);
        }
      }
    }

    // --- 2. Group pieces by stack position ---
    const stacksByCoord = new Map<string, Piece[]>();

    for (const piece of board.pieces) {
      const key = `${piece.position.q},${piece.position.r}`;
      if (!stacksByCoord.has(key)) {
        stacksByCoord.set(key, []);
      }
      stacksByCoord.get(key)!.push(piece);
    }

    // --- 3. Draw pieces from bottom to top of each stack ---
    for (const stack of stacksByCoord.values()) {
      // Optional: sort by a `stackLevel` property if you track it
      stack.sort((a, b) => a.stackLevel - b.stackLevel);
      for (const piece of stack) {
        this.drawPiece(piece);
      }
    }
  }

  drawHexCustom(x: number, y: number, size: number, fill: string = '#ddd') {
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i + Math.PI / 6;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.strokeStyle = '#333';
    this.ctx.stroke();
    this.ctx.fillStyle = fill;
    this.ctx.fill();
  }

    drawPiece(piece: Piece) {
      const { q, r } = piece.position;
      const { x, y } = this.hexToPixel(q, r);
      const size = this.size;

      // Теперь без костылей
      const typeKey = piece.constructor.name;   // "QueenBee", "Beetle" и т.д.
      const img = loadPieceImage(typeKey, piece.owner); // "QueenBee_White"

      if (img.complete && img.naturalWidth !== 0) {
        this.ctx.drawImage(img, x - size * 0.9, y - size * 0.9, size * 1.8, size * 1.8);
      } else {
        img.onload = () => {
          this.ctx.drawImage(img, x - size * 0.9, y - size * 0.9, size * 1.8, size * 1.8);
        };
      }
    }
}
