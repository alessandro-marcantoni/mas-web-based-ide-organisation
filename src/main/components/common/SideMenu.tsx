import React from "react"
import { Button, Drawer, Grid, IconButton, Toolbar } from "@mui/material"
import { Option } from "scala-types/dist/option/option"
import { Group, Role } from "../../utils/structural/entities"
import { Close } from "@mui/icons-material"
import { List } from "scala-types/dist/list/list"
import RoleMenu from "../organizationSpecification/structuralSpecification/RoleMenu"
import GroupMenu from "../organizationSpecification/structuralSpecification/GroupMenu"
import { Component, DiagramEventHandler } from "../../utils/commons"
import { ComponentDeletionEvent } from "../../utils/structural/events"
import GoalMenu from "../organizationSpecification/functionalSpecification/GoalMenu"
import { Goal } from "../../utils/functional/entities"

type SideMenuProps = {
    component: Option<Component>
    components: List<Component>
    onClose: () => void
    onEvent: DiagramEventHandler
}

const SideMenu = (p: SideMenuProps) => (
    <Drawer anchor="right" open={p.component.isDefined()} onClose={p.onClose} sx={{ width: 500 }}>
        <Toolbar />
        <Grid container spacing={2} sx={{ mt: 2, px: 2, maxWidth: 500 }}>
            <IconButton aria-label="close" onClick={p.onClose} sx={{ color: theme => theme.palette.grey[500] }}>
                <Close />
            </IconButton>
            {p.component.map(c => c.type === "role").getOrElse(false) && (
                <RoleMenu component={p.component as Option<Role>} components={p.components} onEvent={p.onEvent} />
            )}
            {p.component.map(c => c.type === "group").getOrElse(false) && (
                <GroupMenu component={p.component as Option<Group>} components={p.components} onEvent={p.onEvent} />
            )}
            {p.component.map(c => c.type === "goal").getOrElse(false) && (
                <GoalMenu component={p.component as Option<Goal>} onEvent={p.onEvent} />
            )}
            <Grid item xs={12} sx={{ position: "fixed", bottom: 8, width: 468, mt: 3 }}>
                <Button
                    color="error"
                    variant="contained"
                    fullWidth
                    sx={{ mx: 0 }}
                    onClick={() => {
                        p.onEvent(new ComponentDeletionEvent(p.component.getOrElse(undefined)))
                        p.onClose()
                    }}>
                    Delete component
                </Button>
            </Grid>
        </Grid>
    </Drawer>
)

export const noRole = "++++++"
export const noGroup = "++++++"

export default SideMenu
