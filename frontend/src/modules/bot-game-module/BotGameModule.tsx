import type {BattlefieldMatrix} from "@/types/ship.types.ts";
import {useCallback, useState} from "react";
import {GameModule} from "@/modules/game-module";

interface  BotGameModuleProps {
    filledPlayerField: BattlefieldMatrix;
}

const BotGameModule = ({filledPlayerField} : BotGameModuleProps)  => {
    const [playerField, setPlayerField] = useState<BattlefieldMatrix>(filledPlayerField);
    const [opponentField, setOpponentField] = useState<BattlefieldMatrix>(/* поле противника */);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'won' | 'lost'>('playing');
    const [chatMessages, setChatMessages] = useState<string[]>([]);

    const handlePlayerShot = useCallback((row: number, col: number) => {
        // Логика обработки выстрела игрока
        return true; // возвращает true если выстрел успешен
    }, []);

    const handleSendMessage = useCallback((message: string) => {
        setChatMessages(prev => [...prev, message]);
    }, []);

    return (
        <GameModule
            playerField={playerField}
            onPlayerShot={handlePlayerShot}
            opponentField={opponentField}
            isPlayerTurn={isPlayerTurn}
            gameStatus={gameStatus}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
        />
    );
};

export default BotGameModule;