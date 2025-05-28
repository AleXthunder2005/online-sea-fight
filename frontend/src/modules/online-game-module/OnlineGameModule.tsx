import {useCallback, useEffect, useRef, useState} from 'react';
import { GameModule } from "@/modules/game-module";
import type { BattlefieldMatrix } from "@/types/ship.types.ts";
import { SeaFightEngine } from "@/engines/seaFightEngine.ts";
import { useSeaBattleHub } from '@/hooks/useSeaBattleHub';
import type {GameStatus} from "@/types/game.types.ts";

interface OnlineGameModuleProps {
    filledPlayerField: BattlefieldMatrix;
}

const OnlineGameModule = ({ filledPlayerField }: OnlineGameModuleProps) => {
    const [playerField, setPlayerField] = useState<BattlefieldMatrix>(filledPlayerField);
    const [opponentField, setOpponentField] = useState<BattlefieldMatrix>(SeaFightEngine.createEmptyField);
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');

    const opponentFieldEngine = useRef<SeaFightEngine>(new SeaFightEngine(opponentField));
    const playerFieldEngine = useRef(new SeaFightEngine(playerField)).current;

    const { session, connection, sendBattlefield, makeMove } = useSeaBattleHub(
        useCallback((isPlayerTurn: boolean) => {
            setIsPlayerTurn(isPlayerTurn);
            setGameStatus('playing');
        }, []),
        setOpponentField,
        setGameStatus,
    );

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


    // Обработка хода противника
    const handleOpponentTurn = useCallback((row: number, col: number) => {
        if (gameStatus !== 'playing') return;

        // Обрабатываем выстрел противника
        const wasHit = playerFieldEngine.shoot(row, col);
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
    }, [gameStatus, playerFieldEngine]);

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
    }, [isPlayerTurn, gameStatus, session, makeMove, opponentFieldEngine]);

    return (
        <GameModule
            playerField={playerField}
            onPlayerShot={handlePlayerShot}
            opponentField={opponentField}
            isPlayerTurn={isPlayerTurn}
            gameStatus={gameStatus}
        />
    );
};

export default OnlineGameModule;