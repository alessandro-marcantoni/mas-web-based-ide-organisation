import { Box, Button, Grid, TextField, Toolbar } from "@mui/material"
import axios from "axios"
import React from "react"
import config from "../../typescript/utils/config"
import { useNavigate } from 'react-router-dom';
import { List, list } from "scala-types/dist/list/list";
import { Component } from "../../typescript/domain/commons";
import { loadStructuralSpec } from '../../typescript/io/deserialization/structural';
import { loadFunctionalSpec } from '../../typescript/io/deserialization/functional';

type LoaderState = {
    organizationName: string
}

type LoaderProps = {
    setOrg: (name: string, structural: List<Component>, functional: List<Component>) => void
}

const Loader = (p: LoaderProps) => {
    const navigate = useNavigate()

    const [state, setState] = React.useState<LoaderState>({
        organizationName: "",
    })

    const setOrganization: (option: string) => void = (option) => {
        if (option === "new") {
            axios.post(`${config.BACKEND_URL}/specifications/${state.organizationName}`, "",
            {
                headers : {
                  "Content-Type" : "application/xml"
                },
            }).then(() => {
                p.setOrg(state.organizationName, list(), list())
                navigate("/structural")
            }).catch(() => {
                p.setOrg(state.organizationName, list(), list())
                navigate("/structural")
            })
        } else {
            axios.get(`${config.BACKEND_URL}/specifications/${state.organizationName}`).then(response => {
                p.setOrg(state.organizationName, loadStructuralSpec(response.data), loadFunctionalSpec(response.data))
                navigate("/structural")
            })
        }
    }

    return (
        <>
            <Toolbar />
            <Box
                sx={{
                    p: 5,
                    mt: 20,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}>
                <img
                    id="loading-logo"
                    width={300}
                    src="/img/interactions-logo-reduced.png"
                    alt="Interactions Research Group, University of St.Gallen"
                />
                <Grid
                    container
                    spacing={2}
                    sx={{ mt: 2, display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Grid item xs={4}></Grid>
                    <Grid item xs={4} sx={{ p: 0 }}>
                        <TextField
                            fullWidth
                            label="Organization Name"
                            variant="filled"
                            onChange={e => setState({ organizationName: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={4}></Grid>

                    <Grid item xs={4}></Grid>
                    <Grid item xs={2} sx={{ p: 0 }}>
                        <Button variant="outlined" fullWidth onClick={() => setOrganization("load")}>
                            Load organization
                        </Button>
                    </Grid>
                    <Grid item xs={2} sx={{ p: 0 }}>
                        <Button variant="contained" fullWidth onClick={() => setOrganization("new")}>
                            New organization
                        </Button>
                    </Grid>
                    <Grid item xs={4}></Grid>
                </Grid>
            </Box>
        </>
    )
}

export default Loader
