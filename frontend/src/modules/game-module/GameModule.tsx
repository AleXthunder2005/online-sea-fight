import React, { useState, useCallback } from 'react';
import styles from './styles/GameModule.module.css';
import type {BattlefieldMatrix} from "@/types/ship.types.ts";
import {GameBattlefield} from "@/components/game-battlefield";

interface GameModuleProps {
    playerField: BattlefieldMatrix;
    onPlayerShot: (row: number, col: number) => boolean;
    onOpponentShot?: (row: number, col: number) => boolean;
    opponentField?: BattlefieldMatrix;
    isPlayerTurn: boolean;
    gameStatus: 'waiting' | 'playing' | 'won' | 'lost';
    chatMessages: string[];
    onSendMessage: (message: string) => void;
}

const GameModule: React.FC<GameModuleProps> = ({
                                                   playerField,
                                                   onPlayerShot,
                                                   opponentField,
                                                   isPlayerTurn,
                                                   gameStatus,
                                                   chatMessages,
                                                   onSendMessage
                                               }) => {
    const [message, setMessage] = useState('');

    const handleSendMessage = useCallback(() => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    }, [message, onSendMessage]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

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

            <div className={styles['chat-container']}>
                <h3>Чат</h3>
                <div className={styles['chat-messages']}>
                    {chatMessages.map((msg, index) => (
                        <div key={index} className={styles['chat-message']}>
                            {msg}
                        </div>
                    ))}
                </div>
                <div className={styles['chat-input']}>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Введите сообщение..."
                        rows={3}
                    />
                    <button
                        onClick={handleSendMessage}
                        className={styles['send-button']}
                    >
                        Отправить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameModule;