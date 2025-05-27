import {MainPage} from "@/pages/main-page";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {SetupPage} from "@/pages/setup-page";

function App() {

  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element=<MainPage/> />
                <Route path="/setup" element=<SetupPage/> />
            </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
