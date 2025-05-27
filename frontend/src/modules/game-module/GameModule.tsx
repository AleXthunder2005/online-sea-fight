import React from 'react';
import styles from './styles/GameModule.module.css';
import type {BattlefieldMatrix} from "@/types/ship.types.ts";
import {GameBattlefield} from "@/components/game-battlefield";
import {Button} from "@/ui/button";
import {useNavigate} from "react-router-dom";

interface GameModuleProps {
    playerField: BattlefieldMatrix;
    onPlayerShot: (row: number, col: number) => void;
    onOpponentShot?: (row: number, col: number) => boolean;
    opponentField?: BattlefieldMatrix;
    isPlayerTurn: boolean;
    gameStatus: 'waiting' | 'playing' | 'won' | 'lost';
}

const GameModule: React.FC<GameModuleProps> = ({
                                                   playerField,
                                                   onPlayerShot,
                                                   opponentField,
                                                   isPlayerTurn,
                                                   gameStatus,
                                               }) => {
    const navigate = useNavigate();

    return (
        <div className={styles['game-module']}>
            <div className={styles['battlefields-container']}>
                <div className={styles['battlefield-wrapper']}>
                    <h3>Ваше поле</h3>
                    <GameBattlefield
                        matrix={playerField}
                        interactive={false}
                        showShips={true}
                    />
                </div>

                <div className={styles['battlefield-wrapper']}>
                    <h3>Поле противника</h3>
                    <GameBattlefield
                        matrix={opponentField || Array(10).fill(null).map(() => Array(10).fill('empty'))}
                        interactive={isPlayerTurn && gameStatus === 'playing'}
                        onCellClick={onPlayerShot}
                        showShips={false}
                    />
                </div>
            </div>

            <div className={styles['game-status']}>
                {gameStatus === 'waiting' && 'Ожидание соперника...'}
                {gameStatus === 'playing' && (isPlayerTurn ? 'Ваш ход' : 'Ход противника')}
                {gameStatus === 'won' && 'Вы победили!'}
                {gameStatus === 'lost' && 'Вы проиграли'}
            </div>
            <Button
                color="var(--color-green)"
                hoverColor="var(--color-green-dark)"
                onClick={() => {navigate('/')}}
                className={styles['to-menu-button']}
            >
                Выйти в меню
            </Button>

        </div>
    );
};

export default GameModule;