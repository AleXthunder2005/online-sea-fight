import { useState, useCallback } from 'react';
import styles from './styles/SetupModule.module.css';
import type {BattlefieldMatrix, ShipDirection, ShipSize} from "@/types/ship.types.ts";
import {Battlefield} from "@/components/battlefield";
import {Button} from "@/ui/button";

interface SetupModuleProps {
    onStartGame: (userField: BattlefieldMatrix) => void;
}

const SetupModule = ({onStartGame} : SetupModuleProps) => {
    const [matrixState, setMatrixState] = useState<BattlefieldMatrix>(
        Array(10).fill(null).map(() => Array(10).fill('empty'))
    );
    const [selectedShip, setSelectedShip] = useState<{
        size: ShipSize;
        direction: ShipDirection;
    } | null>(null);
    const [availableShips, setAvailableShips] = useState<Record<ShipSize, number>>({
        1: 4,
        2: 3,
        3: 2,
        4: 1
    });

    const handleCellClick = useCallback((row: number, col: number) => {
        if (!selectedShip || availableShips[selectedShip.size] <= 0) return;

        const { size, direction } = selectedShip;

        if (canPlaceShip(row, col, size, direction, matrixState)) {
            const newMatrix = [...matrixState];

            // Ставим корабль
            for (let i = 0; i < size; i++) {
                if (direction === 'horizontal') {
                    newMatrix[row][col + i] = 'ship';
                } else {
                    newMatrix[row + i][col] = 'ship';
                }
            }

            const newAvailableShips = {
                ...availableShips,
                [size]: availableShips[size] - 1
            };

            setMatrixState(newMatrix);
            setAvailableShips(newAvailableShips);

            // Если кораблей этого типа больше нет - сбрасываем выбор
            if (newAvailableShips[size] <= 0) {
                setSelectedShip(null);
            }
        }
    }, [selectedShip, matrixState, availableShips]);
    const canPlaceShip = (row: number, col: number, size: ShipSize, direction: ShipDirection, matrix: BattlefieldMatrix): boolean => {
        // Проверяем границы поля
        if (direction === 'horizontal') {
            if (col + size > 10) return false;
        } else {
            if (row + size > 10) return false;
        }

        // Проверяем что все клетки свободны
        for (let i = 0; i < size; i++) {
            const cellRow = direction === 'horizontal' ? row : row + i;
            const cellCol = direction === 'horizontal' ? col + i : col;

            if (matrix[cellRow][cellCol] !== 'empty') return false;

            // Проверяем соседние клетки
            for (let r = Math.max(0, cellRow - 1); r <= Math.min(9, cellRow + 1); r++) {
                for (let c = Math.max(0, cellCol - 1); c <= Math.min(9, cellCol + 1); c++) {
                    if (matrix[r][c] === 'ship') return false;
                }
            }
        }

        return true;
    };
    const autoPlaceAllShips = useCallback(() => {
        const newMatrix: BattlefieldMatrix = Array(10).fill(null).map(() => Array(10).fill('empty'));
        const shipsToPlace: ShipSize[] = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

        // Пытаемся расставить каждый корабль
        for (const shipSize of shipsToPlace) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 100) {
                attempts++;
                const direction: ShipDirection = Math.random() > 0.5 ? 'horizontal' : 'vertical';
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);

                if (canPlaceShip(row, col, shipSize, direction, newMatrix)) {
                    // Ставим корабль
                    for (let i = 0; i < shipSize; i++) {
                        if (direction === 'horizontal') {
                            newMatrix[row][col + i] = 'ship';
                        } else {
                            newMatrix[row + i][col] = 'ship';
                        }
                    }
                    placed = true;
                }
            }
        }

        setMatrixState(newMatrix);
        setAvailableShips({ 1: 0, 2: 0, 3: 0, 4: 0 });
    }, []);
    const resetField = useCallback(() => {
        setMatrixState(Array(10).fill(null).map(() => Array(10).fill('empty')));
        setAvailableShips({ 1: 4, 2: 3, 3: 2, 4: 1 });
        setSelectedShip(null);
    }, []);
    const handleShipSelect = useCallback((size: ShipSize) => {
        if (availableShips[size] <= 0) return;

        setSelectedShip({
            size,
            direction: 'horizontal' // Всегда горизонтальный в меню
        });
    }, [availableShips]);
    const toggleShipDirection = useCallback(() => {
        if (selectedShip) {
            setSelectedShip({
                ...selectedShip,
                direction: selectedShip.direction === 'horizontal' ? 'vertical' : 'horizontal'
            });
        }
    }, [selectedShip]);

    return (
        <div className={styles['setup-page']}>
            <h1 className={styles['title']}>Расстановка кораблей</h1>

            <div className={styles['container']}>
                <div className={styles['ships-panel']}>
                    <h3>Доступные корабли:</h3>
                    <div className={styles['ships']}>
                        {[4, 3, 2, 1].map((size) => (
                            <div
                                key={size}
                                className={`${styles['ship-item']} ${
                                    selectedShip?.size === size ? styles['ship-item--selected'] : ''
                                }`}
                                onClick={() => handleShipSelect(size as ShipSize)}
                            >
                                <div
                                    className={styles['ship-preview']}
                                    data-size={size}
                                />
                                <span className={styles['ship-count']}>×{availableShips[size as ShipSize]}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        className={styles['rotate-button']}
                        onClick={toggleShipDirection}
                        disabled={!selectedShip}
                    >
                        Повернуть корабль
                    </button>

                    <div className={styles.buttons}>
                        <button
                            className={styles.button}
                            onClick={autoPlaceAllShips}
                        >
                            Авторасстановка
                        </button>
                        <button
                            className={styles.button}
                            onClick={resetField}
                        >
                            Сбросить
                        </button>
                    </div>
                </div>

                <div className={styles['battlefield-wrapper']}>
                    <Battlefield
                        matrix={matrixState}
                        onCellClick={handleCellClick}
                        selectedShip={selectedShip}
                    />

                    <Button
                        color='#2ecc71'
                        hoverColor='#27ae60'
                        disabled={Object.values(availableShips).some(count => count > 0)}
                        className={styles['submit-button']}
                        onClick={() => {onStartGame(matrixState)}}
                    >
                        Начать игру
                    </Button>

                </div>
            </div>


        </div>
    );
};

export default SetupModule;