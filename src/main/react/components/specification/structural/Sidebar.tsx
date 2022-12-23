import React from "react"
import { List, toArray } from "scala-types/dist/list/list"
import { Drawer, Toolbar, Typography, Autocomplete, TextField, Grid, Paper, Button, Box } from '@mui/material';
import { Add } from "@mui/icons-material"
import { getAllGroups, getAllRoles, shortName } from "../../../../typescript/structural/utils"
import { loadSpec } from "../../../../typescript/io/deserialization/structural"
import { Component } from "../../../../typescript/commons"

type SidebarProps = {
    components: List<Component>
    role: string
    group: string
    addComponent: (c: string) => void
    propertyChanged: (p: string, v: unknown) => void
}

const Sidebar = (p: SidebarProps) => (
    <Drawer
        variant="permanent"
        sx={{ width: 300, flexShrink: 0, zIndex: 0, [`& .MuiDrawer-paper`]: { width: 300, boxSizing: "border-box" } }}>
        <Toolbar />
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Paper variant="outlined" sx={{ mt:2, mx: 2, p: 2 }}>
                    <Typography variant="h5" component="div" sx={{ mb: 2 }}>
                        Roles
                    </Typography>
                    <InputBox
                        options={toArray(getAllRoles(p.components).map(r => shortName(r.name)))}
                        onChange={v => p.propertyChanged("role", v)}
                        label={"Role"}
                        value={p.role}
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
                        options={toArray(getAllGroups(p.components).map(g => g.name))}
                        onChange={v => p.propertyChanged("group", v)}
                        label={"Group"}
                        value={p.group}
                        onButtonClick={() => p.addComponent("group")}
                    />
                </Paper>
            </Grid>
        </Grid>
        <Box sx={{ height: "100%", display: "flex", px: 2, flexDirection: "column", justifyContent: "flex-end" }}>
            <Button
                variant="contained"
                sx={{ mb: 2 }}
                onClick={() => loadSpec(process.env.PUBLIC_URL + "/spec.xml").then(s => p.propertyChanged("added", s))}>
                Load
            </Button>
        </Box>
    </Drawer>
)

type InputBoxProps = {
    options: Array<string>
    onChange: (value: string) => void
    label: string
    value: string
    onButtonClick: () => void
}

const InputBox = (p: InputBoxProps) => (
    <Grid container spacing={1}>
        <Grid item xs={8}>
            <Autocomplete
                size="small"
                freeSolo
                options={p.options}
                onInputChange={(e, value) => p.onChange(value)}
                onChange={(e, value) => p.onChange(value instanceof Array<string> ? value.join() : value)}
                renderInput={params => <TextField {...params} label={p.label} variant="standard" size="small" />}
            />
        </Grid>
        <Grid item xs={4}>
            <Button
                variant="contained"
                sx={{ height: "100%" }}
                fullWidth={true}
                disabled={!p.value || p.value === ""}
                onClick={p.onButtonClick}>
                <Add />
            </Button>
        </Grid>
    </Grid>
)

export default Sidebar
