import { SetupModule } from "@/modules/setup-module";
import { useState } from "react";
import type { BattlefieldMatrix } from "@/types/ship.types.ts";
import type { GameState } from "@/types/game.types.ts";
import { BotGameModule } from "@/modules/bot-game-module";
import {OnlineGameModule} from "@/modules/online-game-module";

const BotGamePage = () => {
    const [userField, setUserField] = useState<BattlefieldMatrix | null>(null);
    const [gameState, setGameState] = useState<GameState>("setup");

    const handleStartGame = (userMatrix: BattlefieldMatrix) => {
        setUserField(userMatrix);
        setGameState("botGame");
    };

    return (
        <>
            {gameState === 'setup' && (
                <SetupModule
                    onStartGame={handleStartGame}
                />
            )}
            {gameState === "botGame" && userField && (
                <BotGameModule filledPlayerField={userField} />
            )}
            {gameState === "onlineGame" && userField && (
                <OnlineGameModule filledPlayerField={userField} />
            )}
        </>
    );
};

export default BotGamePage;