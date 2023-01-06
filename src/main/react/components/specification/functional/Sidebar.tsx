import { Add } from "@mui/icons-material"
import { Box, Button, Drawer, Grid, Input, Paper, Toolbar, Typography } from "@mui/material"
import React from "react"
import { List, toArray } from "scala-types/dist/list/list"
import { Component, DiagramEventHandler } from "../../../../typescript/commons"
import { GoalCreationEvent } from "../../../../typescript/functional/events"
import { useNavigate } from 'react-router-dom';
import { loadFunctionalFromFile } from '../../../../typescript/io/deserialization/functional';
import { serialize } from "../../../../typescript/io/serialization/functional"

type SidebarProps = {
    components: List<Component>
    onEvent: DiagramEventHandler
    onPropertyChange: (property: string, value: unknown) => void
    save: (c: List<Component>) => void
}

type SidebarState = {
    goalName: string
}

const Sidebar = (p: SidebarProps) => {
    const navigate = useNavigate()

    const [state, setState] = React.useState<SidebarState>({
        goalName: ""
    })

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 300,
                flexShrink: 0,
                zIndex: 0,
                [`& .MuiDrawer-paper`]: { width: 300, boxSizing: "border-box" },
            }}>
            <Toolbar />
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ mt:2, mx: 2, p: 2 }}>
                        <Typography variant="h5" component="div" sx={{ mb: 2 }}>
                            Goals
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={8}>
                                <Input
                                    fullWidth
                                    type="text"
                                    onChange={e => setState({ goalName: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Button
                                    variant="contained"
                                    sx={{ height: "100%" }}
                                    fullWidth={true}
                                    disabled={state.goalName === ""}
                                    onClick={() => p.onEvent(new GoalCreationEvent(state.goalName))}>
                                    <Add />
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
            <Box sx={{ height: "100%", display: "flex", px: 2, flexDirection: "column", justifyContent: "flex-end" }}>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mb: 2 }}
                    onClick={() => {
                        p.save(p.components)
                        navigate("/structural")
                    }}>
                    Back
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mb: 2 }}
                    onClick={() => console.log(toArray(p.components))}>
                    Show state
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mb: 2 }}
                    onClick={() => loadFunctionalFromFile("http://localhost/spec.xml").then(c => p.onPropertyChange("components", c))}>
                    LOAD
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mb: 2 }}
                    onClick={() => console.log(serialize(p.components))}>
                    SERIALIZE
                </Button>
            </Box>
        </Drawer>
    )
}

export default Sidebar
