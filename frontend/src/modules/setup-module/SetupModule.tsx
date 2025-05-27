import { useState, useCallback } from 'react';
import styles from './styles/SetupModule.module.css';
import type {BattlefieldMatrix, ShipDirection, ShipSize} from "@/types/ship.types.ts";
import {Battlefield} from "@/components/battlefield";
import {Button} from "@/ui/button";
import {SeaFightEngine} from "@/engines/seaFightEngine.ts";

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

        if (SeaFightEngine.canPlaceShip(row, col, size, direction, matrixState)) {
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
    const autoPlaceAllShips = useCallback(() => {
        const newMatrix = SeaFightEngine.generateField();
        setMatrixState(newMatrix);
        setAvailableShips({ 1: 0, 2: 0, 3: 0, 4: 0 });
        setSelectedShip(null);
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