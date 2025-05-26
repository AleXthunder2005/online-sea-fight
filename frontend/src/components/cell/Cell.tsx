import React from 'react';
import styles from './styles/Cell.module.css';
import type {CellState} from "@/types/ship.types.ts";

interface CellProps {
    state: CellState;
    onClick: () => void;
    isHighlighted?: boolean;
    isShip?: boolean;
}

const Cell: React.FC<CellProps> = ({ state, onClick, isHighlighted, isShip }) => {
    return (
        <div
            className={`${styles['cell']} ${
                isShip ? styles['cell--ship'] : ''
            } ${
                isHighlighted ? styles['cell--highlighted'] : ''
            }`}
            onClick={onClick}
        >
        </div>
    );
};

export default Cell;