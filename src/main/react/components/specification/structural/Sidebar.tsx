import React from "react"
import { List, toArray } from "scala-types/dist/list/list"
import { Drawer, Toolbar, Typography, Grid, Paper, Button, Box } from "@mui/material"
import { getAllGroups, getAllRoles, shortName } from "../../../../typescript/structural/utils"
import { Component } from "../../../../typescript/commons"
import { useNavigate } from "react-router-dom"
import InputBox from "../../common/InputBox"

type SidebarProps = {
    name: string
    components: List<Component>
    role: string
    group: string
    addComponent: (c: string) => void
    propertyChanged: (p: string, v: unknown) => void
    save: (c: List<Component>, backend?: boolean) => void
}

const Sidebar = (p: SidebarProps) => {
    const navigate = useNavigate()

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
                            Roles
                        </Typography>
                        <InputBox
                            space={[8]}
                            options={[toArray(getAllRoles(p.components).map(r => shortName(r.name)))]}
                            onChange={[v => p.propertyChanged("role", v)]}
                            label={["Role"]}
                            value={[p.role]}
                            onButtonClick={() => p.addComponent("role")}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ mx: 2, p: 2 }}>
                        <Typography variant="h5" component="div" sx={{ mb: 2 }}>
                            Groups
                        </Typography>
                        <InputBox
                            space={[8]}
                            options={[toArray(getAllGroups(p.components).map(g => g.name))]}
                            onChange={[v => p.propertyChanged("group", v)]}
                            label={["Group"]}
                            value={[p.group]}
                            onButtonClick={() => p.addComponent("group")}
                        />
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
                    variant="contained"
                    sx={{ mb: 2 }}
                    onClick={() => {
                        p.save(p.components)
                        navigate("/functional")
                    }}>
                    Next
                </Button>
            </Box>
        </Drawer>
    )
}

export default Sidebar
