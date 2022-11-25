import React from "react";
import {Component} from "../../utils/structural/entities";
import {List, toArray} from "scala-types/dist/list/list";
import {Drawer, Toolbar, Typography, Autocomplete, TextField, Grid, Paper, Button} from "@mui/material";
import {Add} from '@mui/icons-material';
import {getAllGroups, getAllRoles, shortName} from "../../utils/structural/utils";
import {loadSpec} from "../../utils/structural/loader";

type SidebarProps = {
    components: List<Component>
    role: string
    group: string
    addComponent: (c: string) => void
    propertyChanged: (p: string, v: unknown) => void
}

const Sidebar = (p: SidebarProps) =>
    <Drawer variant="permanent"
            sx={{ width: 300, flexShrink: 0, zIndex: 0,
                [`& .MuiDrawer-paper`]: { width: 300, boxSizing: 'border-box' }}}>
        <Toolbar/>
        <Grid container spacing={2} sx={{mt: 2}}>
            <Grid item xs={12}>
                <Paper variant="outlined" sx={{mx: 2, p: 2}}>
                    <Typography variant="h5" component="div" sx={{mb: 2}}>
                        Roles
                    </Typography>
                    <InputBox options={toArray(getAllRoles(p.components).map(r => shortName(r.name)))}
                              onChange={v => p.propertyChanged("role", v)}
                              label={"Role"} value={p.role}
                              onButtonClick={() => p.addComponent("role")}/>
                </Paper>
            </Grid>
            <Grid item xs={12}>
                <Paper variant="outlined" sx={{mx: 2, p: 2}}>
                    <Typography variant="h5" component="div" sx={{mb: 2}}>
                        Groups
                    </Typography>
                    <InputBox options={toArray(getAllGroups(p.components).map(g => g.name))}
                              onChange={v => p.propertyChanged("group", v)}
                              label={"Group"} value={p.group}
                              onButtonClick={() => p.addComponent("group")}/>
                </Paper>
            </Grid>
        </Grid>
        <Button variant="contained" sx={{mt:2, mx:2}} onClick={() => console.log(toArray(p.components))}>Show state</Button>
        <Button variant="contained" sx={{mt:2, mx:2}}
                onClick={() => loadSpec("http://localhost:8080/spec.xml")
                    .then(s => p.propertyChanged("added", s.get(0)))}>Load</Button>
    </Drawer>

type InputBoxProps = {
    options: Array<string>
    onChange: (value: string) => void
    label: string
    value: string
    onButtonClick: () => void
}

const InputBox = (p: InputBoxProps) =>
    (<Grid container spacing={1}>
        <Grid item xs={8}>
            <Autocomplete
                size="small"
                freeSolo
                defaultValue=""
                options={p.options}
                onInputChange={(e, value) => p.onChange(value)}
                onChange={(e, value) => p.onChange(value)}
                renderInput={(params) => <TextField {...params} label={p.label} variant="standard" size="small"/>}
            />
        </Grid>
        <Grid item xs={4}>
            <Button variant="contained" sx={{height: "100%"}} fullWidth={true} disabled={!p.value || p.value === ""} onClick={p.onButtonClick}><Add/></Button>
        </Grid>
    </Grid>)

export default Sidebar
