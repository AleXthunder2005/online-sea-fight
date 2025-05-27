import {MainPage} from "@/pages/main-page";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {BotGamePage} from "@/pages/setup-page";
import {OnlineGamePage} from "@/pages/online-game-page";

function App() {

  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element=<MainPage/> />
                <Route path="/online" element=<OnlineGamePage/> />
                <Route path="/bot" element=<BotGamePage/> />
            </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
