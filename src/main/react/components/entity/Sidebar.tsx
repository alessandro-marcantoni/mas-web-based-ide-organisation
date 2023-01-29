import { Box, Button, Drawer, Grid, Paper, Toolbar, Typography } from '@mui/material';
import React from "react"
import InputBox from '../common/InputBox';
import { List, toArray } from 'scala-types/dist/list/list';
import { Component, DiagramEventHandler } from '../../../typescript/domain/commons';
import { Group } from '../../../typescript/domain/structural';
import { EntityGroupAdditionEvent } from '../../../typescript/domain/events/entity';
import { deployOrganization } from '../../../typescript/io/artifacts';
import { EntityGroup } from '../../../typescript/domain/entity';

type SidebarProps = {
    name: string
    structural: List<Component>
    onEvent: DiagramEventHandler
    toDeploy: List<EntityGroup>
}

type SidebarState = {
    group: string
}

const Sidebar = (p: SidebarProps) => {
    const [state, setState] = React.useState<SidebarState>({
        group: ""
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
                    <Typography variant="h4" component="div" sx={{ mx: 2, my: 2 }}>
                        {p.name ?? "New org"}
                    </Typography>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Paper variant="outlined" sx={{ mx: 2, p: 2 }}>
                    <Typography variant="h5" component="div" sx={{ mb: 2 }}>
                        Groups
                    </Typography>
                    <InputBox
                        space={[8]}
                        options={[toArray(p.structural).filter(c => c.type === "group").map((g: Group) => g.name)]}
                        onChange={[v => setState({ ...state, group: v })]}
                        label={["Group"]}
                        value={[state.group]}
                        onButtonClick={() => p.onEvent(new EntityGroupAdditionEvent(state.group))}
                    />
                </Paper>
            </Grid>
            <Box sx={{ height: "100%", display: "flex", px: 2, flexDirection: "column", justifyContent: "flex-end" }}>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mb: 2 }}
                    onClick={() => {
                        deployOrganization(p.name, p.toDeploy)
                    }}>
                    Deploy
                </Button>
            </Box>
        </Drawer>
    )
}

export default Sidebar