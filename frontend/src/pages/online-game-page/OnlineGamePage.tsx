import {useState} from 'react';
import type {BattlefieldMatrix} from "@/types/ship.types.ts";
import type {GameState} from "@/types/game.types.ts";
import {SetupModule} from "@/modules/setup-module";
import {OnlineGameModule} from "@/modules/online-game-module";

const OnlineGamePage = () => {
    const [userField, setUserField] = useState<BattlefieldMatrix | null>(null);
    const [userName, setUserName] = useState<string>('Игрок');
    const [gameState, setGameState] = useState<GameState>("setup");

    const handleStartGame = (userMatrix: BattlefieldMatrix, userName: string) => {
        setUserField(userMatrix);
        setUserName(userName);
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
                <OnlineGameModule filledPlayerField={userField} userName={userName} />
            )}
        </>
    );
};

export default OnlineGamePage;