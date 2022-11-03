import Header from "./components/Header";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Structural from "./components/Structural";
import * as React from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./style/main.scss"

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Header/>
                <Routes>
                    <Route path="/" element={<Structural/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App
