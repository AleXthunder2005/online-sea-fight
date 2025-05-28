// hooks/useSeaBattleHub.ts
import { useCallback, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import {BASE_API_URL} from "@/configures/server.configure.ts";
import type {BattlefieldMatrix} from "@/types/ship.types.ts";
import type {GameStatus} from "@/types/game.types.ts";

interface GameSession {
    sessionId: string;
    isPlayerTurn: boolean;
    playerName?: string;
    opponentName?: string;
}

export const useSeaBattleHub = (
    onGameStarted: (isPlayerTurn: boolean) => void,
    setOpponentField: (field: BattlefieldMatrix) => void,
    setGameStatus: (status: GameStatus) => void,
) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [session, setSession] = useState<GameSession | null>(null);
    const [chatMessages, setChatMessages] = useState<{sender: string, message: string}[]>([]);
    const [playerName, setPlayerName] = useState<string>('');

    // Устанавливаем соединение с хабом на сервере
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

    // Когда изменился connection стартуем соединение и вызываем joinQueue();
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
            setSession(prev => ({
                ...prev,
                sessionId,
                isPlayerTurn: false
            }));
            console.log('Game session created... Session id =', sessionId);
        });

        connection.on('GameStarted', (isPlayerTurn: boolean) => {
            setSession(prev => prev ? {
                ...prev,
                isPlayerTurn
            } : null);
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

        connection.on('ReceiveChatMessage', (sender: string, message: string) => {
            setChatMessages(prev => [...prev, {sender, message}]);
        });

        connection.on('ReceiveOpponentName', (name: string) => {
            setSession(prev => prev ? {
                ...prev,
                opponentName: name
            } : null);
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

    const sendChatMessage = useCallback((sessionId: string, message: string) => {
        if (connection && playerName) {
            connection.invoke('SendChatMessage', sessionId, playerName, message)
                .catch(err => console.error('SendChatMessage failed: ', err));
        }
        setChatMessages(prev => [...prev, {sender: playerName, message}]);
    }, [connection, playerName]);

    const sendPlayerName = useCallback((sessionId: string, name: string) => {
        if (connection) {
            setPlayerName(name);
            connection.invoke('SendPlayerName', sessionId, name)
                .then(() => {
                    setSession(prev => prev ? {
                        ...prev,
                        playerName: name
                    } : null);
                })
                .catch(err => console.error('SendPlayerName failed: ', err));
        }
    }, [connection]);

    return {
        session,
        connection,
        chatMessages,
        sendBattlefield,
        makeMove,
        sendChatMessage,
        sendPlayerName
    };
};