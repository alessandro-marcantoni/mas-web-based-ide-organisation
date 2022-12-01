import { Add } from "@mui/icons-material"
import { Button, Drawer, Grid, Input, Paper, Toolbar, Typography } from "@mui/material"
import React from "react"
import { List, toArray } from "scala-types/dist/list/list"
import { Component, DiagramEventHandler } from "../../utils/commons"
import { GoalCreationEvent } from "../../utils/functional/events"
import { loadFunctionalSpec } from "../../utils/functional/loader"

type SidebarProps = {
    components: List<Component>
    onEvent: DiagramEventHandler
    onPropertyChange: (property: string, value: unknown) => void
}

type SidebarState = {
    goalName: string
}

class Sidebar extends React.Component<SidebarProps, SidebarState> {
    constructor(props: SidebarProps) {
        super(props)
        this.state = {
            goalName: "",
        }
    }

    render() {
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
                <Grid container spacing={2} sx={{ mt: 2 }}>
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
                                        onChange={e => this.setState({ goalName: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <Button
                                        variant="contained"
                                        sx={{ height: "100%" }}
                                        fullWidth={true}
                                        disabled={this.state.goalName === ""}
                                        onClick={() => this.props.onEvent(new GoalCreationEvent(this.state.goalName))}>
                                        <Add />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
                <Button
                    variant="contained"
                    sx={{ mt: 2, mx: 2 }}
                    onClick={() => console.log(toArray(this.props.components))}>
                    Show state
                </Button>
                <Button
                    variant="contained"
                    sx={{ mt: 2, mx: 2 }}
                    onClick={() =>
                        loadFunctionalSpec("http://localhost:8080/spec.xml").then(s =>
                            this.props.onPropertyChange("components", s)
                        )
                    }>
                    Load
                </Button>
            </Drawer>
        )
    }
}

export default Sidebar
