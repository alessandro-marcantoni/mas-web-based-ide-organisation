import React from "react";
import {Button, Drawer, Grid, IconButton, InputLabel, MenuItem, Select, Toolbar, Typography} from "@mui/material";
import {Option} from "scala-types/dist/option/option";
import {Component, Group, Role} from "../../utils/structural/entities";
import {Close} from "@mui/icons-material";
import {fromSet, getAllGroups, getAllRoles, getGlobalGroups, shortName} from "../../utils/structural/utils";
import {List, toArray} from "scala-types/dist/list/list";

type SideMenuProps = {
    component: Option<Component>
    components: List<Component>
    onClose: () => void
    onExtensionChange: (role: string, extended: string) => void
    deleteComponent: (c: Component) => void
    addToGroup: (c: string, t: string, g: string) => void
    removeFromGroup: (c: string, t: string, g: string) => void
    addLink: (from: string, to: string, type: string) => void
}

const SideMenu = (p: SideMenuProps) =>
    <Drawer anchor="right" open={p.component.isDefined()}
            onClose={p.onClose} sx={{width: 500}}>
        <Toolbar/>
        <Grid container spacing={2} sx={{mt: 2, px: 2}}>
            <IconButton aria-label="close"
                        onClick={p.onClose}
                        sx={{color: (theme) => theme.palette.grey[500]}}
            ><Close/></IconButton>
            { p.component.map(c => c.type === "role").getOrElse(false) &&
                <RoleMenu component={p.component as Option<Role>} components={p.components}
                          onExtensionChange={p.onExtensionChange} addToGroup={p.addToGroup}
                          removeFromGroup={p.removeFromGroup}/>
            }
            { p.component.map(c => c.type === "group").getOrElse(false) &&
              <GroupMenu component={p.component as Option<Group>} components={p.components}
                         addToGroup={p.addToGroup} removeFromGroup={p.removeFromGroup}
                         addLink={p.addLink}/>
            }
            <Grid item xs={12} sx={{position: "absolute", bottom: 8, mx: 0, px: 2, mb: 1, width: "100%"}}>
                <Button color="error" variant="contained" fullWidth
                        sx={{mx: 0}} onClick={() => {
                            p.deleteComponent(p.component.getOrElse(undefined))
                            p.onClose()
                        }}>Delete component</Button>
            </Grid>
        </Grid>
    </Drawer>

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

type GroupMenu = {
    component: Option<Group>
    components: List<Component>
    addToGroup: (c: string, t: string, g: string) => void
    removeFromGroup: (c: string, t: string, g: string) => void
    addLink: (from: string, to: string, type: string) => void
}

const GroupMenu = (p: GroupMenu) => {
    const subgroup: string = getAllGroups(p.components)
        .find(c => fromSet(c.subgroups)
            .map(s => s.name)
            .contains((p.component.get() as Group).name)).map(c => c.name).getOrElse(noGroup)
    let compatibilityFrom = noRole
    let compatibilityTo = noRole
    return <>
        <Grid item xs={12}>
            <Typography variant="h4" component="div">{p.component.map(c => c.name).getOrElse("")}</Typography>
        </Grid>
        <Grid item xs={12} sx={{mt: 3}}>
            <InputLabel id="subgroupOfLabel" htmlFor="subgroupOf">Subgroup of</InputLabel>
            <Select id="subgroupOf" labelId="subGroupOfLabel" fullWidth value={subgroup} variant="standard"
                    onChange={(e) => { (e.target.value === noGroup) ?
                        p.removeFromGroup(p.component.map(c => c.name).getOrElse(""), "group", subgroup) :
                        p.addToGroup(p.component.map(c => c.name).getOrElse(""), "group", e.target.value)
                    }}>
                <MenuItem value={noGroup}>None</MenuItem>
                {p.component.map(c => (c as Group).subgroups.size === 0).getOrElse(false) ?
                    toArray(getGlobalGroups(p.components)
                        .filter(c => c.name !== p.component.map(c => c.name).getOrElse(""))
                        .map(c => <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>)) : []}
            </Select>
        </Grid>
        <Grid item xs={12} sx={{mt: 3}}>
            <Typography variant="h5" component="div">Compatibilities</Typography>
        </Grid>
        <Grid item xs={5}>
            <InputLabel id="compatibilityFromLabel" htmlFor="compatibilityFrom">From</InputLabel>
            <Select id="compatibilityFrom" labelId="compatibilityFromLabel" fullWidth variant="standard"
                    onChange={(e) => { compatibilityFrom = e.target.value as string}}>
                {p.component.map(g => Array.from(g.roles)).getOrElse([])
                    .map((r: Role) => <MenuItem key={r.name} value={r.name}>{shortName(r.name)}</MenuItem>)}
            </Select>
        </Grid>
        <Grid item xs={5}>
            <InputLabel id="compatibilityToLabel" htmlFor="compatibilityTo">To</InputLabel>
            <Select id="compatibilityTo" labelId="compatibilityToLabel" fullWidth variant="standard"
                    onChange={(e) => { compatibilityTo = e.target.value as string}}>
                {p.component.map(g => Array.from(g.roles)).getOrElse([])
                    .map((r: Role) => <MenuItem key={r.name} value={r.name}>{shortName(r.name)}</MenuItem>)}
            </Select>
        </Grid>
        <Grid item xs={2}
              sx={{display: "flex", direction: "column", justifyContent: "flex-end", alignItems: "flex-end"}}>
            <Button variant="contained" fullWidth
                    onClick={() => {(compatibilityFrom !== noRole && compatibilityTo !== noRole) ?
                        p.addLink(compatibilityFrom, compatibilityTo, "compatibility") : {}
                    }}>ADD</Button>
        </Grid>
    </>
}

const noRole = "++++++"
const noGroup = "++++++"

export default SideMenu
