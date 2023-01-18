import React from "react"
import { List, toArray } from "scala-types/dist/list/list"
import { Drawer, Toolbar, Typography, Grid, Paper, Button, Box, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material"
import { getAllGroups, getAllRoles, option, shortName } from "../../../../typescript/structural/utils"
import { Component } from "../../../../typescript/commons"
import { useNavigate } from "react-router-dom"
import InputBox from "../../common/InputBox"
import { RoleType, Group, ConcreteRole, Role, AbstractRole } from '../../../../typescript/domain/structural';

type SidebarProps = {
    name: string
    components: List<Component>
    addComponent: (c: Component) => void
    save: (c: List<Component>, backend?: boolean) => void
}

type SidebarState = {
    role: string
    group: string
    roleType: RoleType
}

const Sidebar = (p: SidebarProps) => {
    const navigate = useNavigate()

    const [state, setState] = React.useState<SidebarState>({
        role: "",
        group: "",
        roleType: RoleType.CONCRETE,
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
                            Roles
                        </Typography>
                        <FormControl>
                            <RadioGroup sx={{ mb: 2 }}
                                value={state.roleType}
                                onChange={e => setState({ ...state, roleType: e.target.value as RoleType })}
                            >
                                <FormControlLabel value={RoleType.CONCRETE} control={<Radio />} label="Concrete" />
                                <FormControlLabel value={RoleType.ABSTRACT} control={<Radio />} label="Abstract" />
                            </RadioGroup>
                        </FormControl>
                        <InputBox
                            space={[8]}
                            options={[toArray(getAllRoles(p.components).map(r => shortName(r.name)))]}
                            onChange={[v => setState({ ...state, role: v })]}
                            label={["Role"]}
                            value={[state.role]}
                            onButtonClick={() => p.addComponent(creatRole(state.role, state.roleType, p.components))}
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
                            onChange={[v => setState({ ...state, group: v })]}
                            label={["Group"]}
                            value={[state.group]}
                            onButtonClick={() => p.addComponent(new Group(state.group))}
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

const creatRole = (name: string, type: RoleType, components: List<Component>) => {
    const extension: string | undefined = getAllRoles(components)
        .find(r => shortName(r.name) === name)
        .flatMap((r: Role) => option(r.extends))
        .getOrElse(undefined)
    if (type === RoleType.CONCRETE) {
        return new ConcreteRole(name, extension)
    }
    return new AbstractRole(name, extension)
}

export default Sidebar
