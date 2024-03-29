import { Add } from "@mui/icons-material"
import { Box, Button, Drawer, Grid, Input, Paper, Toolbar, Typography } from "@mui/material"
import React from "react"
import { List } from "scala-types/dist/list/list"
import { Component, DiagramEventHandler } from "../../../../typescript/domain/commons"
import { GoalCreationEvent } from "../../../../typescript/domain/events/functional"
import { useNavigate } from 'react-router-dom';

type SidebarProps = {
    name: string
    components: List<Component>
    onEvent: DiagramEventHandler
    onPropertyChange: (property: string, value: unknown) => void
    save: (c: List<Component>, backend?: boolean) => void
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
                    <Typography variant="h4" component="div" sx={{ mx: 2, mt: 2 }}>
                        {p.name ?? "New org"}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ mx: 2, p: 2 }}>
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
                <Grid item xs={12} sx={{ mx: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        onClick={() => {
                            p.save(p.components, true)
                        }}>
                        Save
                    </Button>
                </Grid>
            </Grid>
            <Box sx={{ height: "100%", display: "flex", px: 2, flexDirection: "column", justifyContent: "flex-end" }}>
                <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 2 }}
                    onClick={() => {
                        p.save(p.components)
                        navigate("/structural")
                    }}>
                    Back
                </Button>
                {/* <Button
                    fullWidth
                    variant="contained"
                    sx={{ mb: 2 }}
                    onClick={() => {
                        p.save(p.components, true)
                        navigate("/entity")
                    }}>
                    Deploy
                </Button> */}
            </Box>
        </Drawer>
    )
}

export default Sidebar
