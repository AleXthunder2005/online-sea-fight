import React from 'react';
import styles from './styles/Cell.module.css';
import type { CellState } from "@/types/ship.types.ts";

interface CellProps {
    state: CellState;
    onClick?: () => void;
    isHighlighted?: boolean;
    showShip?: boolean;
}

const Cell: React.FC<CellProps> = ({
                                       state,
                                       onClick,
                                       isHighlighted = false,
                                       showShip = true,
                                   }) => {
    const getCellClass = () => {
        if (!showShip && state === 'ship') return '';
        switch (state) {
            case 'ship': return styles['cell--ship'];
            case 'hit': return styles['cell--hit'];
            case 'miss': return styles['cell--miss'];
            case 'forbidden': return styles['cell--forbidden'];
            default: return '';
        }
    };

    return (
        <div
            className={`
                ${styles['cell']} 
                ${getCellClass()} 
                ${isHighlighted ? styles['cell--highlighted'] : ''}
            `}
            onClick={(state === 'empty' || state === 'ship') ? onClick : undefined}
        >
        </div>
    );
};

export default Cell;