import {useState} from 'react';
import type {BattlefieldMatrix} from "@/types/ship.types.ts";
import type {GameState} from "@/types/game.types.ts";
import {SetupModule} from "@/modules/setup-module";
import {OnlineGameModule} from "@/modules/online-game-module";

const OnlineGamePage = () => {
    const [userField, setUserField] = useState<BattlefieldMatrix | null>(null);
    const [gameState, setGameState] = useState<GameState>("setup");

    const handleStartGame = (userMatrix: BattlefieldMatrix) => {
        setUserField(userMatrix);
        setGameState("onlineGame");
    };

    return (
        <>
            {gameState === 'setup' && (
                <SetupModule
                    onStartGame={handleStartGame}
                />
            )}
            {gameState === "onlineGame" && userField && (
                <OnlineGameModule filledPlayerField={userField} />
            )}
        </>
    );
};

export default OnlineGamePage;