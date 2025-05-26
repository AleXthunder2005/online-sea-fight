import React from 'react';
import styles from './styles/RulesModal.module.css';

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                <button className={styles['modal-close']} onClick={onClose}>
                    &times;
                </button>
                <h2 className={styles['modal-title']}>Правила Морского Боя</h2>
                <div className={styles['modal-body']}>
                    <ol className={styles['rules-list']}>
                        <li>Игра ведётся на двух квадратных полях 10×10.</li>
                        <li>Каждый игрок расставляет корабли:
                            <ul>
                                <li>1 корабль — 4 клетки</li>
                                <li>2 корабля — 3 клетки</li>
                                <li>3 корабля — 2 клетки</li>
                                <li>4 корабля — 1 клетка</li>
                            </ul>
                        </li>
                        <li>Корабли не могут касаться друг друга сторонами и углами.</li>
                        <li>Игроки по очереди делают выстрелы по координатам.</li>
                        <li>Попадание отмечается красным крестиком, промах — белой точкой.</li>
                        <li>Игрок, первым потопивший все корабли противника, побеждает.</li>
                    </ol>
                </div>
                <div className={styles['modal-footer']}>
                    <button
                        className={styles['modal-button']}
                        onClick={onClose}
                    >
                        Понятно
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RulesModal;