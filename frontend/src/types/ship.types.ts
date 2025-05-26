export type CellState = 'empty' | 'ship' | 'miss' | 'hit' | 'forbidden';

export type ShipSize = 1 | 2 | 3 | 4;
export type ShipDirection = 'horizontal' | 'vertical';

export interface Ship {
    size: ShipSize;
    count: number;
}

export type BattlefieldMatrix = CellState[][];