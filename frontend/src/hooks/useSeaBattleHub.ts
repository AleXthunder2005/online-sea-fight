// hooks/useSeaBattleHub.ts
import { useCallback, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import {BASE_API_URL} from "@/configures/server.configure.ts";
import type {BattlefieldMatrix} from "@/types/ship.types.ts";
import type {GameStatus} from "@/types/game.types.ts";

interface GameSession {
    sessionId: string;
    isPlayerTurn: boolean;
}

export const useSeaBattleHub = (
    onGameStarted: (isPlayerTurn: boolean) => void,
    setOpponentField: (field: BattlefieldMatrix) => void,
    setGameStatus: (status: GameStatus) => void,
) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [session, setSession] = useState<GameSession | null>(null);

    //Устанавливаем соединение с хабом на сервере
    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${BASE_API_URL}/seabattlehub`)
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        return () => {
            newConnection.stop();
        };
    }, []);

    //когда изменился connection стартуем соединение и вызываем joinQueue();
    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    setupListeners();
                    joinQueue();
                })
                .catch(err => console.error('Connection failed: ', err));
        }
    }, [connection]);

    const setupListeners = () => {
        if (!connection) return;

        connection.on('WaitingForOpponent', () => {
            console.log('Waiting for opponent...');
        });

        connection.on('GameSessionCreated', (sessionId: string) => {
            setSession({ sessionId, isPlayerTurn: false });
            console.log('Game session created... Session id =', sessionId);
        });

        connection.on('GameStarted', (isPlayerTurn: boolean) => {
            setSession(prev => prev ? { ...prev, isPlayerTurn } : null);
            console.log(`Game started...`);
            onGameStarted(isPlayerTurn);
        });

        connection.on('ReceiveOpponentField', (battlefield: string[][]) => {
            if (setOpponentField) {
                setOpponentField(battlefield as BattlefieldMatrix);
                console.log(`Opponent field received...`);
            }
        });

        connection.on('OpponentDisconnected', () => {
            console.log('Opponent disconnected');
            setSession(null);
            setGameStatus('opponentLeave');
        });
    };

    const joinQueue = useCallback(() => {
        if (connection) {
            connection.invoke('JoinQueue')
                .catch(err => console.error('JoinQueue failed: ', err));
        }
    }, [connection]);

    const sendBattlefield = useCallback((sessionId: string, battlefield: string[][]) => {
        if (connection) {
            connection.invoke('SendBattlefield', sessionId, battlefield)
                .catch(err => console.error('SendBattlefield failed: ', err));
        }
    }, [connection]);

    const makeMove = useCallback((sessionId: string, row: number, col: number) => {
        if (connection) {
            connection.invoke('MakeMove', sessionId, { row, column: col })
                .catch(err => console.error('MakeMove failed: ', err));
        }
    }, [connection]);

    return {
        session,
        connection,
        sendBattlefield,
        makeMove
    };
};