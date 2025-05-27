import {SeaFightEngine} from "@/engines/seaFightEngine.ts";
import {useCallback, useRef, useState} from "react";
import {Bot} from "@/engines/botEngine.ts";
import type {BattlefieldMatrix} from "@/types/ship.types.ts";
import {GameModule} from "@/modules/game-module";

interface  BotGameModuleProps {
    filledPlayerField: BattlefieldMatrix;
}

const BotGameModule = ({filledPlayerField} : BotGameModuleProps)  => {
    const [playerField, setPlayerField] = useState<BattlefieldMatrix>(filledPlayerField);
    const [opponentField, setOpponentField] = useState<BattlefieldMatrix>(SeaFightEngine.generateField());
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'won' | 'lost'>('playing');

    const botFieldEngine = useRef(new SeaFightEngine(opponentField)).current;
    const bot = useRef(new Bot(playerField, setPlayerField)).current;

    const handlePlayerShot = useCallback((row: number, col: number) => {
        if (!isPlayerTurn || gameStatus !== 'playing') return;

        // Игрок делает выстрел
        const wasHit = botFieldEngine.shoot(row, col);
        setOpponentField([...botFieldEngine.getField()]);

        // Проверяем победу игрока
        if (botFieldEngine.areAllShipsDestroyed()) {
            setGameStatus('won');
            return;
        }

        // Если игрок попал, он ходит еще раз
        if (wasHit) return;

        // Иначе ход бота
        setIsPlayerTurn(false);
        handleBotTurn();

    }, [isPlayerTurn, gameStatus, botFieldEngine, bot]);

    const handleBotTurn = useCallback(() => {
        const timer = setTimeout(() => {
            const botHit = bot.makeShoot();

            if (bot.isWin()) {
                setGameStatus('lost');
                return;
            }

            if (botHit) {
                handleBotTurn();
            } else {
                setIsPlayerTurn(true);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [bot]);

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

export default BotGameModule;