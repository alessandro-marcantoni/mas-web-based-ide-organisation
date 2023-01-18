import { Option } from "scala-types/dist/option/option"
import { Role, RoleType } from "../../../../typescript/domain/structural"
import { List, toArray } from "scala-types/dist/list/list"
import { fromSet, getAllGroups, getAllRoles, shortName } from "../../../../typescript/utils/utils"
import { Grid, Input, InputLabel, MenuItem, Select, Typography } from "@mui/material"
import React from "react"
import { noGroup, noRole } from "../../common/SideMenu"
import {
    AdditionToGroupEvent,
    ExtensionChangeEvent,
    RemovalFromGroupEvent,
    RoleCardinalityChangeEvent,
} from "../../../../typescript/domain/events/structural"
import { Component, DiagramEventHandler } from "../../../../typescript/domain/commons"

type RoleMenu = {
    component: Option<Role>
    components: List<Component>
    onEvent: DiagramEventHandler
}

const RoleMenu = (p: RoleMenu) => {
    const inGroup: string = getAllGroups(p.components)
        .find(c =>
            fromSet(c.roles)
                .map(r => shortName(r.name))
                .contains(shortName((p.component.get() as Role).name))
        )
        .map(c => shortName(c.name))
        .getOrElse(noGroup)
    return (
        <>
            <Grid item xs={12}>
                <Typography variant="h4" component="div" sx={{ maxWidth: 400 }}>
                    {p.component.map(c => shortName(c.name)).getOrElse("")}
                </Typography>
            </Grid>
            <Grid item xs={12} sx={{ mt: 3 }}>
                <InputLabel id="extendsLabel" htmlFor="extends">
                    Extends
                </InputLabel>
                <Select
                    id="extends"
                    labelId="extendsLabel"
                    fullWidth
                    variant="standard"
                    sx={{ width: 450 }}
                    value={p.component.map(c => (c.extends ?? noRole)).getOrElse(noRole)}
                    onChange={e =>
                        p.onEvent(new ExtensionChangeEvent(p.component.map(c => c.name).getOrElse(""), e.target.value))
                    }>
                    <MenuItem value={noRole}>None</MenuItem>
                    {toArray(getAllRoles(p.components).filter((r: Role) => r.roleType === RoleType.ABSTRACT).map(r => shortName(r.name))).map(r => (
                        <MenuItem key={r} value={r}>
                            {r}
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
            {p.component.map((c: Role) => c.roleType === RoleType.CONCRETE).getOrElse(false) && (
                <Grid item xs={12} sx={{ mt: 3 }}>
                    <InputLabel id="inGroupLabel" htmlFor="inGroup">
                        In group
                    </InputLabel>
                    <Select
                        id="inGroup"
                        labelId="subGroupOfLabel"
                        fullWidth
                        variant="standard"
                        value={inGroup}
                        onChange={e => {
                            e.target.value === noGroup
                                ? p.onEvent(
                                    new RemovalFromGroupEvent(p.component.map(c => c.name).getOrElse(""), "role", inGroup)
                                )
                                : p.onEvent(
                                    new AdditionToGroupEvent(
                                        p.component.map(c => c.name).getOrElse(""),
                                        "role",
                                        e.target.value
                                    )
                                )
                        }}>
                        <MenuItem value={noGroup}>None</MenuItem>
                        {Array.from(new Set(toArray(getAllGroups(p.components)).map(g => g.name))).map(g => (
                            <MenuItem key={g} value={g}>
                                {g}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>)}
            {inGroup !== noGroup && (
                <>
                    <Grid item xs={6} sx={{ mt: 3 }}>
                        <InputLabel id="cardinalityMinLabel" htmlFor="cardinalityMin">
                            Min
                        </InputLabel>
                        <Input
                            type="number"
                            value={p.component.map(c => c.min).getOrElse(0)}
                            fullWidth
                            onChange={e =>
                                p.onEvent(
                                    new RoleCardinalityChangeEvent(
                                        (p.component.get() as Role).name,
                                        "min",
                                        e.target.value === "" ? 0 : parseInt(e.target.value)
                                    )
                                )
                            }
                        />
                    </Grid>
                    <Grid item xs={6} sx={{ mt: 3 }}>
                        <InputLabel id="cardinalityMaxLabel" htmlFor="cardinalitytMax">
                            Max
                        </InputLabel>
                        <Input
                            type="number"
                            value={p.component.map(c => c.max).getOrElse("")}
                            fullWidth
                            onChange={e =>
                                p.onEvent(
                                    new RoleCardinalityChangeEvent(
                                        (p.component.get() as Role).name,
                                        "max",
                                        e.target.value === "" ? Number.MAX_VALUE : parseInt(e.target.value)
                                    )
                                )
                            }
                        />
                    </Grid>
                </>
            )}
        </>
    )
}

export default RoleMenu
