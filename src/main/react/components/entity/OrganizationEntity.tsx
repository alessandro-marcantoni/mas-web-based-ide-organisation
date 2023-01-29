import React from "react"
import { Component, DiagramEvent, DiagramEventType } from '../../../typescript/domain/commons';
import { List, list, toArray } from "scala-types/dist/list/list"
import Sidebar from "./Sidebar"
import { Box, Grid, Toolbar } from "@mui/material"
import { Group } from "../../../typescript/domain/structural"
import GroupCard from "./GroupCard"
import { getAllGroups } from "../../../typescript/utils/utils"
import { EntityGroupAdditionEvent, PlayerAdditionEvent } from '../../../typescript/domain/events/entity';
import { EntityGroup } from "../../../typescript/domain/entity";

type EntityProps = {
    name: string
    structural: List<Component>
    functional: List<Component>
}

type EntityState = {
    groups: List<EntityGroup>
    agents: Array<string>
}

const Entity = (p: EntityProps) => {
    const [state, setState] = React.useState<EntityState>({
        groups: list(),
        agents: [],
    })

    const onDiagramEvent: (event: DiagramEvent) => void = event => {
        switch (event.type) {
            case DiagramEventType.EntityGroupAddition:
                const egae = event as EntityGroupAdditionEvent
                getAllGroups(p.structural)
                    .find(g => g.name === egae.group)
                    .apply((g: Group) => setState({ ...state, groups: state.groups.appended(new EntityGroup(g)) }))
                break
            case DiagramEventType.EntityGroupRemoval:
                const egre = event as EntityGroupAdditionEvent
                setState({ ...state, groups: state.groups.filter(g => g.group.name !== egre.group) })
                break
            case DiagramEventType.PlayerAddition:
                const pae = event as PlayerAdditionEvent
                setState({ ...state, groups: addPlayer(pae.group, pae.agent, pae.role)(state.groups) })
                break
            case DiagramEventType.PlayerRemoval:
                const pre = event as PlayerAdditionEvent
                setState({ ...state, groups: removePlayer(pre.group, pre.agent, pre.role)(state.groups) })
                break
        }
    }

    return (
        <>
            <Sidebar name={p.name} structural={p.structural} onEvent={onDiagramEvent} toDeploy={state.groups}/>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }} className="diagram">
                <Toolbar />
                <Grid container spacing={2}>
                    {toArray(state.groups).map(g => (
                        <Grid item xs={4} key={g.group.name}>
                            <GroupCard group={g} onEvent={onDiagramEvent} agents={state.agents} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </>
    )
}

export default Entity

const addPlayer = (group: string, agent: string, role: string) => (groups: List<EntityGroup>): List<EntityGroup> => {
    groups.find(g => g.group.name === group).apply((g: EntityGroup) => g.players.get(role).add(agent))
    return groups
}

const removePlayer = (group: string, agent: string, role: string) => (groups: List<EntityGroup>): List<EntityGroup> => {
    groups.find(g => g.group.name === group).apply((g: EntityGroup) => g.players.get(role).delete(agent))
    return groups
}