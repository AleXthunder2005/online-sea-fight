import {useCallback, useRef, useState} from 'react';
import {GameModule} from "@/modules/game-module";
import type {BattlefieldMatrix} from "@/types/ship.types.ts";
import {SeaFightEngine} from "@/engines/seaFightEngine.ts";

interface  BotGameModuleProps {
    filledPlayerField: BattlefieldMatrix;
}

const OnlineGameModule = ({filledPlayerField} : BotGameModuleProps) => {
    // @ts-ignore
    const [playerField, setPlayerField] = useState<BattlefieldMatrix>(filledPlayerField);
    const [opponentField, setOpponentField] = useState<BattlefieldMatrix>(SeaFightEngine.generateField());
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'won' | 'lost'>('playing');

    const opponentFieldEngine = useRef(new SeaFightEngine(opponentField)).current;

    const handlePlayerShot = useCallback((row: number, col: number) => {
        if (!isPlayerTurn || gameStatus !== 'playing') return;

        // Игрок делает выстрел
        const wasHit = opponentFieldEngine.shoot(row, col);
        setOpponentField([...opponentFieldEngine.getField()]);

        // Проверяем победу игрока
        if (opponentFieldEngine.areAllShipsDestroyed()) {
            setGameStatus('won');
            return;
        }

        // Если игрок попал, он ходит еще раз
        if (wasHit) return;

        // Иначе ход бота
        setIsPlayerTurn(false);

    }, [isPlayerTurn, gameStatus, opponentFieldEngine]);

    return (
        <>
            <GameModule
                playerField={playerField}
                onPlayerShot={handlePlayerShot}
                opponentField={opponentField}
                isPlayerTurn={isPlayerTurn}
                gameStatus={gameStatus}
            />
        </>
    );
};

export default OnlineGameModule;