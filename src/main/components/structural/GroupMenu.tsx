import {Option} from "scala-types/dist/option/option";
import {Compatibility, Component, Constraint, Group, Role} from "../../utils/structural/entities";
import {List, toArray} from "scala-types/dist/list/list";
import {fromSet, getAllGroups, getGlobalGroups, shortName} from "../../utils/structural/utils";
import {
    Button,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    IconButton, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody
} from "@mui/material";
import React from "react";
import {noGroup, noRole} from "./SideMenu";
import {Delete} from "@mui/icons-material";

type GroupMenuProps = {
    component: Option<Group>
    components: List<Component>
    addToGroup: (c: string, t: string, g: string) => void
    removeFromGroup: (c: string, t: string, g: string) => void
    deleteComponent: (c: Component) => void
    addLink: (from: string, to: string, type: string) => void
}

type GroupMenuState = {
    compatibilityFrom: string
    compatibilityTo: string
}

class GroupMenu extends React.Component<GroupMenuProps, GroupMenuState> {
    private readonly subgroup: string

    constructor(props) {
        super(props)
        this.state = {compatibilityTo: noRole, compatibilityFrom: noRole}
        this.subgroup = getAllGroups(this.props.components)
            .find(c => fromSet(c.subgroups)
                .map(s => s.name)
                .contains((this.props.component.get() as Group).name)).map(c => c.name).getOrElse(noGroup)
    }

    render() {
        return <>
            <Grid item xs={12}>
                <Typography variant="h4" component="div"
                            sx={{maxWidth: 400}}>{this.props.component.map(c => c.name).getOrElse("")}</Typography>
            </Grid>
            <Grid item xs={12} sx={{mt: 3}}>
                <InputLabel id="subgroupOfLabel" htmlFor="subgroupOf">Subgroup of</InputLabel>
                <Select id="subgroupOf" labelId="subGroupOfLabel" fullWidth value={this.subgroup} variant="standard"
                        onChange={(e) => {
                            (e.target.value === noGroup) ?
                                this.props.removeFromGroup(this.props.component.map(c => c.name).getOrElse(""), "group", this.subgroup) :
                                this.props.addToGroup(this.props.component.map(c => c.name).getOrElse(""), "group", e.target.value)
                        }} sx={{maxWidth: 500}}>
                    <MenuItem value={noGroup}>None</MenuItem>
                    {this.props.component.map(c => (c as Group).subgroups.size === 0).getOrElse(false) ?
                        toArray(getGlobalGroups(this.props.components)
                            .filter(c => c.name !== this.props.component.map(c => c.name).getOrElse(""))
                            .map(c => <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>)) : []}
                </Select>
            </Grid>
            <Grid item xs={12} sx={{mt: 3}}>
                <Typography variant="h5" component="div">Compatibilities</Typography>
            </Grid>
            <Grid item xs={5}>
                <InputLabel id="compatibilityFromLabel" htmlFor="compatibilityFrom">From</InputLabel>
                <Select id="compatibilityFrom" labelId="compatibilityFromLabel" fullWidth variant="standard"
                        value={this.state.compatibilityFrom}
                        renderValue={v => v === noRole ? "" : shortName(v)} onChange={(e) => {
                            this.setState({ compatibilityFrom: e.target.value as string })
                }} sx={{maxWidth: 200}}>
                    <MenuItem value={noRole}/>
                    {this.props.component.map(g => Array.from(g.roles)).getOrElse([])
                        .map((r: Role) => <MenuItem key={r.name} value={r.name}>{shortName(r.name)}</MenuItem>)}
                </Select>
            </Grid>
            <Grid item xs={5}>
                <InputLabel id="compatibilityToLabel" htmlFor="compatibilityTo">To</InputLabel>
                <Select id="compatibilityTo" labelId="compatibilityToLabel" fullWidth variant="standard"
                        value={this.state.compatibilityTo}
                        renderValue={v => v === noRole ? "" : shortName(v)} onChange={(e) => {
                            this.setState({ compatibilityTo: e.target.value as string })
                }} sx={{maxWidth: 200}}>
                    <MenuItem value={noRole}/>
                    {this.props.component.map(g => Array.from(g.roles)).getOrElse([])
                        .map((r: Role) => <MenuItem key={r.name} value={r.name}>{shortName(r.name)}</MenuItem>)}
                </Select>
            </Grid>
            <Grid item xs={2}
                  sx={{
                      display: "flex",
                      direction: "column",
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                      maxWidth: 100
                  }}>
                <Button variant="contained" fullWidth
                        onClick={() => {
                            (this.state.compatibilityFrom !== noRole && this.state.compatibilityTo !== noRole) ?
                                this.props.addLink(this.state.compatibilityFrom, this.state.compatibilityTo, "compatibility") : {}
                            this.setState({ compatibilityFrom: noRole, compatibilityTo: noRole })
                        }}>ADD</Button>
            </Grid>
            <Grid item xs={12} sx={{maxWidth: 500}}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow><TableCell>From</TableCell><TableCell>To</TableCell><TableCell
                                width={50}/></TableRow>
                        </TableHead>
                        <TableBody>
                            {this.props.component.map((g: Group) => Array.from(g.constraints)
                                .filter((c: Constraint) => c.constraint === "compatibility")).getOrElse([]).map((e: Compatibility) =>
                                <TableRow key={e.from + e.to}>
                                    <TableCell>{shortName(e.from)}</TableCell><TableCell>{shortName(e.to)}</TableCell>
                                    <TableCell sx={{p: 0}}><IconButton
                                        onClick={() => this.props.deleteComponent(e)}><Delete/></IconButton></TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </>
    }
}

export default GroupMenu
