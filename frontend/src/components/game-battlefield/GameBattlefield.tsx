import React from 'react';
import styles from './styles/GameBattleField.module.css'
import type {BattlefieldMatrix} from "@/types/ship.types.ts";
import {Cell} from "@/components/cell";

interface BattlefieldProps {
    matrix: BattlefieldMatrix;
    onCellClick?: (row: number, col: number) => void;
    interactive?: boolean;
    showShips?: boolean;
}

const Battlefield: React.FC<BattlefieldProps> = ({
                                                     matrix,
                                                     onCellClick,
                                                     interactive = false,
                                                     showShips = false
                                                 }) => {
    const handleClick = (row: number, col: number) => {
        if (interactive && onCellClick) {
            onCellClick(row, col);
        }
    };

    return (
        <div className={styles.battlefield}>
            {matrix.map((row, rowIndex) => (
                <div key={rowIndex} className={styles.row}>
                    {row.map((cellState, colIndex) => (
                        <Cell
                            key={`${rowIndex}-${colIndex}`}
                            state={cellState}
                            onClick={() => handleClick(rowIndex, colIndex)}
                            showShip={showShips}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Battlefield;