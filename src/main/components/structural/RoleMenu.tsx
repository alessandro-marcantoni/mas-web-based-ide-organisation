import {Option} from "scala-types/dist/option/option";
import {Component, Role} from "../../utils/structural/entities";
import {List, toArray} from "scala-types/dist/list/list";
import {fromSet, getAllGroups, getAllRoles, shortName} from "../../utils/structural/utils";
import {Grid, InputLabel, MenuItem, Select, Typography} from "@mui/material";
import React from "react";
import {noGroup, noRole} from "./SideMenu";

type RoleMenu = {
    component: Option<Role>
    components: List<Component>
    onExtensionChange: (role: string, extended: string) => void
    addToGroup: (c: string, t: string, g: string) => void
    removeFromGroup: (c: string, t: string, g: string) => void
}

const RoleMenu = (p: RoleMenu) => {
    const inGroup: string = getAllGroups(p.components)
        .find(c => fromSet(c.roles)
            .map(r => shortName(r.name))
            .contains(shortName((p.component.get() as Role).name))).map(c => shortName(c.name)).getOrElse(noGroup)
    return <>
        <Grid item xs={12} sx={{mx: 2}}>
            <Typography variant="h4"
                        component="div">{p.component.map(c => shortName(c.name)).getOrElse("")}</Typography>
        </Grid>
        <Grid item xs={12} sx={{mx: 2, mt: 3}}>
            <InputLabel id="extendsLabel" htmlFor="extends">Extends</InputLabel>
            <Select id="extends" labelId="extendsLabel" fullWidth variant="standard"
                    value={p.component.map(c => c.extends ? c.extends.name : noRole).getOrElse(noRole)}
                    onChange={(e) => p.onExtensionChange(p.component.map(c => c.name).getOrElse(""), e.target.value)}>
                <MenuItem value={noRole}>None</MenuItem>
                {Array.from(new Set(toArray(getAllRoles(p.components)).map(r => shortName(r.name))))
                    .map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
        </Grid>
        <Grid item xs={12} sx={{mx: 2, mt: 3}}>
            <InputLabel id="inGroupLabel" htmlFor="inGroup">In group</InputLabel>
            <Select id="inGroup" labelId="subGroupOfLabel" fullWidth variant="standard"
                    value={inGroup}
                    onChange={(e) => {(e.target.value === noGroup) ?
                        p.removeFromGroup(p.component.map(c => c.name).getOrElse(""), "role", inGroup) :
                        p.addToGroup(p.component.map(c => c.name).getOrElse(""), "role", e.target.value)
                    }}>
                <MenuItem value={noGroup}>None</MenuItem>
                {Array.from(new Set(toArray(getAllGroups(p.components)).map(g => g.name)))
                    .map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </Select>
        </Grid>
    </>
}

export default RoleMenu
