import React from 'react';
import styles from './styles/Cell.module.css';
import type { CellState } from "@/types/ship.types.ts";

interface CellProps {
    state: CellState;
    onClick?: () => void;
    isHighlighted?: boolean;
}

const Cell: React.FC<CellProps> = ({
                                       state,
                                       onClick,
                                       isHighlighted = false
                                   }) => {
    const getCellClass = () => {
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
            onClick={onClick}
        >
        </div>
    );
};

export default Cell;