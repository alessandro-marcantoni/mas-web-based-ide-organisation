import React from "react";
import {Button, Drawer, Grid, IconButton, Toolbar} from "@mui/material";
import {Option} from "scala-types/dist/option/option";
import {Component, Group, Role} from "../../utils/structural/entities";
import {Close} from "@mui/icons-material";
import {List} from "scala-types/dist/list/list";
import RoleMenu from "./RoleMenu";
import GroupMenu from "./GroupMenu";

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
        <Grid container spacing={2} sx={{mt: 2, px: 2, maxWidth: 500}}>
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
                         addLink={p.addLink} deleteComponent={p.deleteComponent}/>
            }
            <Grid item xs={12} sx={{position: "absolute", bottom: 8, mx: 0, px: 2, mb: 1, width: 500}}>
                <Button color="error" variant="contained" fullWidth
                        sx={{mx: 0}} onClick={() => {
                            p.deleteComponent(p.component.getOrElse(undefined))
                            p.onClose()
                        }}>Delete component</Button>
            </Grid>
        </Grid>
    </Drawer>

export const noRole = "++++++"
export const noGroup = "++++++"

export default SideMenu
