import styles from './styles/OnlineGameModule.module.css'
import {useCallback, useEffect, useRef, useState} from 'react';
import { GameModule } from "@/modules/game-module";
import type { BattlefieldMatrix } from "@/types/ship.types.ts";
import { SeaFightEngine } from "@/engines/seaFightEngine.ts";
import { useSeaBattleHub } from '@/hooks/useSeaBattleHub';
import type {GameStatus} from "@/types/game.types.ts";
import {Chat} from "@/components/chat";
import {AudioPlayer} from "@/components/audio-player";

interface OnlineGameModuleProps {
    filledPlayerField: BattlefieldMatrix;
    userName: string;
}

const OnlineGameModule = ({ filledPlayerField, userName}: OnlineGameModuleProps) => {
    const [playerField, setPlayerField] = useState<BattlefieldMatrix>(filledPlayerField);
    const [opponentField, setOpponentField] = useState<BattlefieldMatrix>(SeaFightEngine.createEmptyField);
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');

    const opponentFieldEngine = useRef<SeaFightEngine>(new SeaFightEngine(opponentField));
    const playerFieldEngine = useRef(new SeaFightEngine(playerField)).current;

    const {
        session,
        connection,
        chatMessages,
        sendBattlefield,
        makeMove,
        sendChatMessage,
        sendPlayerName
    } = useSeaBattleHub(
        useCallback((isPlayerTurn: boolean) => {
            setIsPlayerTurn(isPlayerTurn);
            setGameStatus('playing');
        }, []),
        setOpponentField,
        setGameStatus,
    );

    // Отправляем имя игрока при создании сессии
    useEffect(() => {
        if (session && gameStatus === 'waiting') {


            sendPlayerName(session.sessionId, userName || "Игрок");
            sendBattlefield(session.sessionId, playerField);
        }
    }, [session, gameStatus, playerField, sendBattlefield, sendPlayerName]);

    // Отправляем поле на сервер при создании сессии
    useEffect(() => {
        if (session && gameStatus === 'waiting') {
            sendBattlefield(session.sessionId, playerField);
        }
    }, [session, gameStatus, playerField, sendBattlefield]);

    // Эффект для обновления движка при изменении opponentField
    useEffect(() => {
        opponentFieldEngine.current = new SeaFightEngine(opponentField);
    }, [opponentField]);


    // Настройка звуков
    const [soundEnabled, setSoundEnabled] = useState(true);

    const toggleSound = useCallback(() => {
        setSoundEnabled(prev => !prev);
    }, []);
    const { playSound } = AudioPlayer();
    const [prevGameStatus, setPrevGameStatus] = useState<GameStatus>('waiting');

    useEffect(() => {
        if (!soundEnabled || gameStatus === prevGameStatus) return;

        switch (gameStatus) {
            case 'won': playSound('win'); break;
            case 'lost': playSound('lose'); break;
            case 'opponentLeave': playSound('opponentLeave'); break;
        }

        setPrevGameStatus(gameStatus);
    }, [gameStatus, playSound, soundEnabled, prevGameStatus]);


    // Обработка хода противника
    const handleOpponentTurn = useCallback((row: number, col: number) => {
        if (gameStatus !== 'playing') return;

        // Обрабатываем выстрел противника
        const wasHit = playerFieldEngine.shoot(row, col);
        if (soundEnabled) playSound('boom');
        setPlayerField([...playerFieldEngine.getField()]);

        // Проверяем поражение
        if (playerFieldEngine.areAllShipsDestroyed()) {
            setGameStatus('lost');
            return;
        }

        // Если противник промахнулся, наш ход
        if (!wasHit) {
            setIsPlayerTurn(true);
        }
    }, [gameStatus, playerFieldEngine, soundEnabled]);

    // Настройка обработчиков сообщений от сервера
    useEffect(() => {
        if (!connection) return;

        connection.on('ReceiveOpponentMove', (move: {row: number, column: number}) => {
            handleOpponentTurn(move.row, move.column);
        });

        return () => {
            connection.off('ReceiveOpponentMove');
        };
    }, [connection, handleOpponentTurn]);

    const handlePlayerShot = useCallback((row: number, col: number) => {
        if (!isPlayerTurn || gameStatus !== 'playing' || !session) return;

        // Игрок делает выстрел
        const wasHit = opponentFieldEngine.current.shoot(row, col);
        if (soundEnabled) playSound('boom');
        setOpponentField([...opponentFieldEngine.current.getField()]);

        // Отправляем ход на сервер
        makeMove(session.sessionId, row, col);

        // Проверяем победу
        if (opponentFieldEngine.current.areAllShipsDestroyed()) {
            setGameStatus('won');
            return;
        }

        if (wasHit) return;  // Если игрок попал, он ходит еще раз
        setIsPlayerTurn(false);  // Иначе ход противника
    }, [isPlayerTurn, gameStatus, session, makeMove, opponentFieldEngine, soundEnabled]);

    return (
        <div className={styles['online-game-module-wrapper']}>
            <GameModule
                playerField={playerField}
                onPlayerShot={handlePlayerShot}
                opponentField={opponentField}
                isPlayerTurn={isPlayerTurn}
                gameStatus={gameStatus}
                soundEnabled={soundEnabled}
                onSoundToggle={toggleSound}
            />

            {(((gameStatus !== 'waiting') && (gameStatus !== 'opponentLeave')) &&
                <Chat
                    onSendMessage={(message) => session && sendChatMessage(session.sessionId, message)}
                    messages={chatMessages}
                />
            )}
        </div>
    );
};

export default OnlineGameModule;