import Header from "./react/components/Header"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Structural from "./react/components/specification/structural/StructuralSpecification"
import * as React from "react"
import "./style/main.scss"
import { Box, CssBaseline } from "@mui/material"
import Loader from "./react/components/Loader"
import Functional from "./react/components/specification/functional/FunctionalSpecification"
import Entity from "./react/components/entity/OrganizationEntity"

type AppState = {
    organizationName: string
    organization: string
}

const App = () => {
    const [state, setState] = React.useState<AppState>({
        organizationName: "",
        organization: "",
    })

    const changeState: (name: string, org: string) => void = (name, org) => {
        setState({ organizationName: name, organization: org })
    }

    return (
        <div className="App">
            <CssBaseline />
            <BrowserRouter>
                <Box sx={{ height: "100vh" }}>
                    <Header />
                    <Routes>
                        <Route path="/" element={<Loader setOrg={changeState} />} />
                        <Route path="/structural" element={<Structural />} />
                        <Route
                            path="/functional"
                            element={
                                <Functional name={state.organizationName} org={state.organization} />
                            }
                        />
                        <Route path="/entity" element={<Entity />} />
                    </Routes>
                </Box>
            </BrowserRouter>
        </div>
    )
}

export default App
