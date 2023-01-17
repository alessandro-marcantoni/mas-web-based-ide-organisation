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
import { getAllRoles } from "./typescript/structural/utils"
import { addHeader } from "./typescript/io/serialization/common"
import { serializeStructural } from "./typescript/io/serialization/structural"
import { serializeFunctional } from "./typescript/io/serialization/functional"
import axios from "axios"
import config from "./typescript/config"

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

    function saveStructure(s: List<Component>, backend: boolean = false) {
        setState({ ...state, structural: s })
        if (backend) {
            saveOrganization()
        }
    }

    function saveFunctional(f: List<Component>, backend: boolean = false) {
        setState({ ...state, functional: f })
        if (backend) {
            saveOrganization()
        }
    }

    const saveOrganization: () => void = () => {
        axios.put(
            config.BACKEND_URL + "/specifications/" + state.organizationName,
            addHeader(serializeStructural(state.structural) + serializeFunctional(state.functional)),
            {
                headers : {
                  "Content-Type" : "application/xml"
                },
            }
        )
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
                            element={
                                <Structural name={state.organizationName} org={state.structural} save={saveStructure} />
                            }
                        />
                        <Route
                            path="/functional"
                            element={
                                <Functional
                                    name={state.organizationName}
                                    org={state.functional}
                                    save={saveFunctional}
                                    roles={getAllRoles(state.structural).map(r => r.getName())}
                                />
                            }
                        />
                        <Route path="/entity" element={<Entity name={state.organizationName} structural={state.structural} functional={state.functional} />} />
                    </Routes>
                </Box>
            </BrowserRouter>
        </div>
    )
}

export default App
