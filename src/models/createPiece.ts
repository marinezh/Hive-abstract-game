import { QueenBee } from './QueenBee';
import { Beetle } from './Beetle';
import { Spider } from './Spider';
import { Grasshopper } from './Grasshopper';
import { SoldierAnt } from './SoldierAnt';
import type { HexCoord, Player } from './Piece';
import type { BankPiece } from '../game/PieceBank';

export function createPiece(type: BankPiece["type"], color: Player, coord: HexCoord) {
  switch (type) {
    case "bee":    return new QueenBee(color, coord);
    case "beetle": return new Beetle(color, coord);
    case "spider": return new Spider(color, coord);
    case "hopper": return new Grasshopper(color, coord);
    case "ant":    return new SoldierAnt(color, coord);
    default:       return null;
  }
}
