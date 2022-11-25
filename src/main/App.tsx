import Header from "./components/Header";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Structural from "./components/Structural";
import * as React from "react";
import "./style/main.scss"
import {Box, CssBaseline} from "@mui/material";

function App() {
    return (
        <div className="App">
            <CssBaseline/>
            <BrowserRouter>
                <Box sx={{ height: "100vh" }}>
                    <Header/>
                    <Routes>
                        <Route path="/" element={<Structural/>}/>
                    </Routes>
                </Box>
            </BrowserRouter>
        </div>
    );
}

export default App
