import Header from "./react/components/Header"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Structural from "./react/components/specification/structural/StructuralSpecification"
import * as React from "react"
import "./style/main.scss"
import { Box, CssBaseline } from "@mui/material"
import Loader from "./react/components/Loader"
import Functional from "./react/components/specification/functional/FunctionalSpecification"
import Entity from "./react/components/entity/OrganizationEntity"
import { Component } from "./typescript/commons"
import { List, list } from "scala-types/dist/list/list"

type AppState = {
    organizationName: string
    structural: List<Component>
    functional: List<Component>
}

const App = () => {
    const [state, setState] = React.useState<AppState>({
        organizationName: "",
        structural: list(),
        functional: list(),
    })

    const changeState: (name: string, s: List<Component>, f: List<Component>) => void = (name, s, f) => {
        setState({ organizationName: name, structural: s, functional: f })
    }

    const saveStructure: (s: List<Component>) => void = (s) => {
        setState({ ...state, structural: s })
    }

    const saveFunctional: (f: List<Component>) => void = (f) => {
        setState({ ...state, functional: f })
    }

    return (
        <div className="App">
            <CssBaseline />
            <BrowserRouter>
                <Box sx={{ height: "100vh" }}>
                    <Header />
                    <Routes>
                        <Route path="/" element={<Loader setOrg={changeState} />} />
                        <Route
                            path="/structural"
                            element={<Structural name={state.organizationName} org={state.structural} save={saveStructure} />}
                        />
                        <Route
                            path="/functional"
                            element={<Functional name={state.organizationName} org={state.functional} save={saveFunctional} />}
                        />
                        <Route path="/entity" element={<Entity />} />
                    </Routes>
                </Box>
            </BrowserRouter>
        </div>
    )
}

export default App
