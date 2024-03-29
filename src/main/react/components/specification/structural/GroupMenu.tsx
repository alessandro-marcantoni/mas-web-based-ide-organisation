import { Option } from "scala-types/dist/option/option"
import { Cardinality, Compatibility, Constraint, Group, Role } from "../../../../typescript/domain/structural"
import { List, toArray } from "scala-types/dist/list/list"
import { fromSet, getAllGroups, getGlobalGroups, shortName } from "../../../../typescript/utils/utils"
import {
    Button,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    Input,
} from "@mui/material"
import React from "react"
import { noGroup, noRole } from "../../common/SideMenu"
import {
    AdditionToGroupEvent,
    CardinalityConstraintAdditionEvent,
    ComponentDeletionEvent,
    LinkCreationEvent,
    RemovalFromGroupEvent,
} from "../../../../typescript/domain/events/structural"
import { Component, DiagramEventHandler } from "../../../../typescript/domain/commons"
import TableWithDeletion from "../../common/TableWithDeletion"
import SelectWithLabel from '../../common/SelectWithLabel';

type GroupMenuProps = {
    component: Option<Group>
    components: List<Component>
    onEvent: DiagramEventHandler
}

type GroupMenuState = {
    compatibilityFrom: string
    compatibilityTo: string
    cardinalityRole: string
    cardinalitySubject: string
    cardinalityMin: string
    cardinalityMax: string
}

class GroupMenu extends React.Component<GroupMenuProps, GroupMenuState> {
    private readonly subgroup: string

    constructor(props) {
        super(props)
        this.state = {
            compatibilityTo: noRole,
            compatibilityFrom: noRole,
            cardinalityRole: "role",
            cardinalitySubject: noRole,
            cardinalityMin: "",
            cardinalityMax: "",
        }
        this.subgroup = getAllGroups(this.props.components)
            .find(c =>
                fromSet(c.subgroups)
                    .map(s => s.name)
                    .contains((this.props.component.get() as Group).name)
            )
            .map(c => c.name)
            .getOrElse(noGroup)
    }

    render() {
        return (
            <>
                <Grid item xs={12}>
                    <Typography variant="h4" component="div" sx={{ maxWidth: 400 }}>
                        {this.props.component.map(c => c.name).getOrElse("")}
                    </Typography>
                </Grid>
                <Grid item xs={12} sx={{ mt: 3 }}>
                    <InputLabel id="subgroupOfLabel" htmlFor="subgroupOf">
                        Subgroup of
                    </InputLabel>
                    <Select
                        id="subgroupOf"
                        labelId="subGroupOfLabel"
                        fullWidth
                        value={this.subgroup}
                        variant="standard"
                        sx={{ maxWidth: 500 }}
                        onChange={e => {
                            e.target.value === noGroup
                                ? this.props.onEvent(
                                      new RemovalFromGroupEvent(
                                          this.props.component.map(c => c.name).getOrElse(""),
                                          "group",
                                          this.subgroup
                                      )
                                  )
                                : this.props.onEvent(
                                      new AdditionToGroupEvent(
                                          this.props.component.map(c => c.name).getOrElse(""),
                                          "group",
                                          e.target.value
                                      )
                                  )
                        }}>
                        <MenuItem value={noGroup}>None</MenuItem>
                        {this.props.component.map(c => (c as Group).subgroups.size === 0).getOrElse(false)
                            ? toArray(
                                  getGlobalGroups(this.props.components)
                                      .filter(c => c.name !== this.props.component.map(c => c.name).getOrElse(""))
                                      .map(c => (
                                          <MenuItem key={c.name} value={c.name}>
                                              {c.name}
                                          </MenuItem>
                                      ))
                              )
                            : []}
                    </Select>
                </Grid>
                <Grid item xs={12} sx={{ mt: 3 }}>
                    <Typography variant="h5" component="div">
                        Compatibilities
                    </Typography>
                </Grid>
                <SelectWithLabel
                    value={this.state.compatibilityFrom}
                    label="From"
                    width={5}
                    valueChange={v => this.setState({ compatibilityFrom: v })}
                    options={this.props.component.map(g => Array.from(g.roles).map((r: Role) => r.name)).getOrElse([])}
                />
                <SelectWithLabel
                    value={this.state.compatibilityTo}
                    label="To"
                    width={5}
                    valueChange={v => this.setState({ compatibilityTo: v })}
                    options={this.props.component.map(g => Array.from(g.roles).map((r: Role) => r.name)).getOrElse([])}
                />
                <Grid
                    item
                    xs={2}
                    sx={{
                        display: "flex",
                        direction: "column",
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                        maxWidth: 100,
                    }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                            this.state.compatibilityFrom !== noRole && this.state.compatibilityTo !== noRole
                                ? this.props.onEvent(
                                      new LinkCreationEvent(
                                          this.state.compatibilityFrom,
                                          this.state.compatibilityTo,
                                          "compatibility"
                                      )
                                  )
                                : {}
                            this.setState({ compatibilityFrom: noRole, compatibilityTo: noRole })
                        }}>
                        ADD
                    </Button>
                </Grid>
                <TableWithDeletion
                    cols={["From", "To"]}
                    onDelete={(c) => this.props.onEvent(new ComponentDeletionEvent(c))}
                    items={this.props.component
                        .map((g: Group) =>
                            Array.from(g.constraints).filter((c: Constraint) => c.constraint === "compatibility")
                        )
                        .getOrElse([])}
                    props={[(e: Compatibility) => shortName(e.from), (e: Compatibility) => shortName(e.to)]}
                />
                <Grid item xs={12} sx={{ mt: 3 }}>
                    <Typography variant="h5" component="div">
                        Cardinality constraints
                    </Typography>
                </Grid>
                <SelectWithLabel
                    value={this.state.cardinalityRole}
                    label="Type"
                    width={3}
                    valueChange={v => this.setState({ cardinalityRole: v })}
                    options={["role", "group"]}
                />
                <SelectWithLabel
                    value={this.state.cardinalitySubject}
                    label="Subject"
                    width={3}
                    valueChange={v => this.setState({ cardinalitySubject: v })}
                    options={(this.state.cardinalityRole === "role"
                        ? this.props.component.map(g =>
                              Array.from(g.roles)
                                  .concat(Array.from(g.subgroups).flatMap((s: Group) => Array.from(s.roles)))
                                  .map((r: Role) => r.name)
                          )
                        : this.props.component.map(g => Array.from(g.subgroups).map((r: Group) => r.name))
                    ).getOrElse([])}
                />
                <Grid item xs={2}>
                    <InputLabel id="compatibilityMinLabel" htmlFor="compatibilityMin">
                        Min
                    </InputLabel>
                    <Input
                        type="number"
                        value={this.state.cardinalityMin}
                        onChange={e => this.setState({ cardinalityMin: e.target.value })}
                    />
                </Grid>
                <Grid item xs={2}>
                    <InputLabel id="compatibilityMaxLabel" htmlFor="compatibilityMax">
                        Max
                    </InputLabel>
                    <Input
                        type="number"
                        value={this.state.cardinalityMax}
                        onChange={e => this.setState({ cardinalityMax: e.target.value })}
                    />
                </Grid>
                <Grid
                    item
                    xs={2}
                    sx={{
                        display: "flex",
                        direction: "column",
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                        maxWidth: 100,
                    }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                            this.state.cardinalitySubject !== noRole
                                ? this.props.onEvent(
                                      new CardinalityConstraintAdditionEvent(
                                          this.props.component.map(g => g.name).get() as string,
                                          this.state.cardinalityRole,
                                          this.state.cardinalitySubject,
                                          this.state.cardinalityMin === "" ? 0 : parseInt(this.state.cardinalityMin),
                                          this.state.cardinalityMax === ""
                                              ? Number.MAX_VALUE
                                              : parseInt(this.state.cardinalityMax)
                                      )
                                  )
                                : {}
                            this.setState({ cardinalityMin: "", cardinalityMax: "", cardinalitySubject: noRole })
                        }}>
                        ADD
                    </Button>
                </Grid>
                <TableWithDeletion
                    cols={["Subject", "Min", "Max"]}
                    onDelete={(c) => this.props.onEvent(new ComponentDeletionEvent(c))}
                    items={this.props.component
                        .map(g => Array.from(g.constraints).filter((c: Constraint) => c.constraint === "cardinality"))
                        .getOrElse([])}
                    props={[
                        (c: Cardinality) => c.id,
                        (c: Cardinality) => c.min.toString(),
                        (c: Cardinality) => c.max.toString(),
                    ]}
                />
            </>
        )
    }
}


export default GroupMenu
