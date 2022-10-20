import Navbar from "./components/Navbar";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Structural from "./components/Structural";
import * as React from "react";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Navbar/>
                <Routes>
                    <Route path="/" element={<Structural/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
