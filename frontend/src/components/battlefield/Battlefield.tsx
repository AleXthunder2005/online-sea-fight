import React from 'react';
import styles from './styles/Battlefield.module.css';
import type {BattlefieldMatrix, ShipDirection, ShipSize} from "@/types/ship.types.ts";
import {Cell} from "@/components/cell";

interface BattlefieldProps {
    matrix: BattlefieldMatrix;
    onCellClick: (row: number, col: number) => void;
    selectedShip: {
        size: ShipSize;
        direction: ShipDirection;
    } | null;
}

const Battlefield: React.FC<BattlefieldProps> = ({ matrix, onCellClick, selectedShip }) => {
    return (
        <div className={styles.battlefield}>
            {matrix.map((row, rowIndex) => (
                <div key={rowIndex} className={styles.row}>
                    {row.map((cellState, colIndex) => (
                        <Cell
                            key={`${rowIndex}-${colIndex}`}
                            state={cellState}
                            onClick={() => onCellClick(rowIndex, colIndex)}
                            isHighlighted={selectedShip !== null &&
                                canHighlight(matrix, rowIndex, colIndex, selectedShip.size, selectedShip.direction)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

const canHighlight = (
    matrix: BattlefieldMatrix,
    row: number,
    col: number,
    size: ShipSize,
    direction: ShipDirection
): boolean => {
    if (direction === 'horizontal') {
        if (col + size > 10) return false;

        for (let i = 0; i < size; i++) {
            if (matrix[row][col + i] !== 'empty') return false;

            // Проверяем соседние клетки
            for (let r = Math.max(0, row - 1); r <= Math.min(9, row + 1); r++) {
                for (let c = Math.max(0, col + i - 1); c <= Math.min(9, col + i + 1); c++) {
                    if (matrix[r][c] === 'ship') return false;
                }
            }
        }
    } else {
        if (row + size > 10) return false;

        for (let i = 0; i < size; i++) {
            if (matrix[row + i][col] !== 'empty') return false;

            // Проверяем соседние клетки
            for (let r = Math.max(0, row + i - 1); r <= Math.min(9, row + i + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(9, col + 1); c++) {
                    if (matrix[r][c] === 'ship') return false;
                }
            }
        }
    }

    return true;
};

export default Battlefield;