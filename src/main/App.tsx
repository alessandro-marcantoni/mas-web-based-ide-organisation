import Header from "./react/components/Header"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Structural from "./react/components/organizationSpecification/structuralSpecification/StructuralSpecification"
import * as React from "react"
import "./style/main.scss"
import { Box, CssBaseline } from "@mui/material"
import Loader from "./react/components/Loader"
import Functional from "./react/components/organizationSpecification/functionalSpecification/FunctionalSpecification"
import Entity from "./react/components/organizationEntity/OrganizationEntity"

function App() {
    return (
        <div className="App">
            <CssBaseline />
            <BrowserRouter>
                <Box sx={{ height: "100vh" }}>
                    <Header />
                    <Routes>
                        <Route path="/" element={<Loader />} />
                        <Route path="/structural" element={<Structural />} />
                        <Route path="/functional" element={<Functional />} />
                        <Route path="/entity" element={<Entity />} />
                    </Routes>
                </Box>
            </BrowserRouter>
        </div>
    )
}

export default App
