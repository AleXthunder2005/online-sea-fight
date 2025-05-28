import {SeaFightEngine} from "@/engines/seaFightEngine.ts";
import {useCallback, useEffect, useRef, useState} from "react";
import {Bot} from "@/engines/botEngine.ts";
import type {BattlefieldMatrix} from "@/types/ship.types.ts";
import {GameModule} from "@/modules/game-module";
import styles from "./styles/BotGameModule.module.css";
import {AudioPlayer} from "@/components/audio-player";
import type {GameStatus} from "@/types/game.types.ts";


interface  BotGameModuleProps {
    filledPlayerField: BattlefieldMatrix;
}

const BotGameModule = ({filledPlayerField} : BotGameModuleProps)  => {
    const [playerField, setPlayerField] = useState<BattlefieldMatrix>(filledPlayerField);
    const [opponentField, setOpponentField] = useState<BattlefieldMatrix>(SeaFightEngine.generateField());
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
    const [soundEnabled, setSoundEnabled] = useState(true);

    const botFieldEngine = useRef(new SeaFightEngine(opponentField)).current;
    const bot = useRef(new Bot(playerField, setPlayerField)).current;

    const toggleSound = useCallback(() => {
        setSoundEnabled(prev => !prev);
    }, []);

    const { playSound } = AudioPlayer();
    useEffect(() => {
        if (!soundEnabled) return;

        switch (gameStatus) {
            case 'won': playSound('win'); break;
            case 'lost': playSound('lose'); break;
            case 'opponentLeave': playSound('opponentLeave'); break;
        }
    }, [gameStatus, playSound, soundEnabled]);

    const handlePlayerShot = useCallback((row: number, col: number) => {
        if (!isPlayerTurn || gameStatus !== 'playing') return;

        const wasHit = botFieldEngine.shoot(row, col);
        if (soundEnabled) playSound('boom');
        setOpponentField([...botFieldEngine.getField()]);

        if (botFieldEngine.areAllShipsDestroyed()) {
            setGameStatus('won');
            return;
        }

        if (wasHit) return;
        setIsPlayerTurn(false);
        handleBotTurn();
    }, [isPlayerTurn, gameStatus, botFieldEngine, bot, soundEnabled, playSound]);

    const handleBotTurn = useCallback(() => {
        const timer = setTimeout(() => {
            const botHit = bot.makeShoot();
            if (soundEnabled) playSound('boom');

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
    }, [bot, soundEnabled, playSound]);

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
        </div>
    );
};

export default BotGameModule;