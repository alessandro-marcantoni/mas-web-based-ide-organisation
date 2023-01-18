import React from "react"
import { Role } from "../../../typescript/domain/structural"
import { Card, CardContent, CardHeader, IconButton, List, ListItem, ListItemText, Typography, Box } from "@mui/material"
import InputBox from "../common/InputBox"
import { DiagramEventHandler } from "../../../typescript/domain/commons"
import {
    EntityGroupAdditionEvent,
    EntityGroupRemovalEvent,
    PlayerAdditionEvent,
    PlayerRemovalEvent,
} from "../../../typescript/domain/events/entity"
import CloseIcon from "@mui/icons-material/Close"
import DeleteIcon from "@mui/icons-material/Delete"
import { shortName } from "../../../typescript/utils/utils"
import { EntityGroup } from "../../../typescript/domain/entity"

type GroupCardState = {
    subgroup: string
    agent: string
    role: string
    agents: Array<string>
}

const GroupCard = (p: { group: EntityGroup; onEvent: DiagramEventHandler, agents: Array<string> }) => {
    const [state, setState] = React.useState<GroupCardState>({
        subgroup: "",
        agent: "",
        role: "",
        agents: p.agents,
    })

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader
                title={p.group.group.name}
                action={
                    <IconButton
                        aria-label="settings"
                        onClick={() => p.onEvent(new EntityGroupRemovalEvent(p.group.group.name))}>
                        <CloseIcon />
                    </IconButton>
                }
            />
            <CardContent>
                {p.group.group.subgroups.size > 0 && (
                    <>
                        <Typography variant="h6" component="div">
                            Subgroups
                        </Typography>
                        <InputBox
                            space={[10]}
                            options={[Array.from(p.group.group.subgroups).map(g => g.name)]}
                            onChange={[v => setState({ ...state, subgroup: v })]}
                            label={["Subgroup"]}
                            value={[state.subgroup]}
                            onButtonClick={() => p.onEvent(new EntityGroupAdditionEvent(state.subgroup))}
                        />
                    </>
                )}
                {p.group.group.roles.size > 0 && (
                    <>
                        <Typography variant="h6" component="div">
                            Players
                        </Typography>
                        <InputBox
                            space={[5, 5]}
                            options={[
                                state.agents,
                                Array.from(p.group.group.roles).map((r: Role) => shortName(r.name)),
                            ]}
                            onChange={[v => setState({ ...state, agent: v }), v => setState({ ...state, role: v })]}
                            label={["Agent", "Role"]}
                            value={[state.agent, state.role]}
                            onButtonClick={() =>
                                p.onEvent(
                                    new PlayerAdditionEvent(p.group.group.name, state.agent, shortName(state.role))
                                )
                            }
                        />
                        {Array.from(p.group.group.roles).map((r: Role) => (
                            Array.from(p.group.players.get(shortName(r.name))).length > 0 && (
                                <Box key={r.name} sx={{ mt: 3 }}>
                                    <Typography variant="h6" component="div">
                                        {shortName(r.name)}
                                    </Typography>
                                    <List dense>
                                        {(Array.from(p.group.players.get(shortName(r.name))) ?? []).map(a => (
                                            <ListItem
                                                key={a}
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="delete"
                                                        onClick={() =>
                                                            p.onEvent(
                                                                new PlayerRemovalEvent(
                                                                    p.group.group.name,
                                                                    a,
                                                                    shortName(r.name)
                                                                )
                                                            )
                                                        }>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                }>
                                                <ListItemText primary={a} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>)
                        ))}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default GroupCard
