import { Button, FormControlLabel, Grid, Radio, RadioGroup, Typography, Toolbar } from '@mui/material';
import React from "react"
import { Option } from "scala-types"
import { Component, DiagramEventHandler } from "../../../../typescript/commons"
import { Goal, PlanOperator } from '../../../../typescript/domain/functional';
import { GoalRelationRemovalEvent, GoalDependencyAdditionEvent, OperatorChangeEvent, ResponsibleAdditionEvent, ResponsibleRemovalEvent } from '../../../../typescript/functional/events';
import TableWithDeletion from "../../common/TableWithDeletion"
import SelectWithLabel from "../../common/SelectWithLabel"
import { List, toArray } from "scala-types/dist/list/list"
import { getAllGoals } from "../../../../typescript/functional/utils"
import { shortName } from "../../../../typescript/structural/utils";

type GoalMenuProps = {
    component: Option<Goal>
    components: List<Component>
    onEvent: DiagramEventHandler
    roles: List<string>
}

type GoalMenuState = {
    dependency: string
    responsible: string
    modality: string
}

class GoalMenu extends React.Component<GoalMenuProps, GoalMenuState> {
    constructor(props) {
        super(props)
        this.state = {
            dependency: "",
            responsible: "",
            modality: "obligation",
        }
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
                    <Typography variant="h5" component="div">
                        Dependencies
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <RadioGroup
                        name="controlled-radio-buttons-group"
                        value={this.props.component.map((c: Goal) => PlanOperator.toString(c.operator)).getOrElse("AND")}
                        onChange={(e) => this.props.onEvent(new OperatorChangeEvent(this.props.component.map(c => c.name).getOrElse(""), PlanOperator.fromString(e.target.value)))}
                    >
                        <FormControlLabel value="AND" control={<Radio />} label="AND" />
                        <FormControlLabel value="OR" control={<Radio />} label="OR" />
                    </RadioGroup>
                </Grid>
                <SelectWithLabel
                    width={10}
                    label={"Depends on"}
                    value={this.state.dependency}
                    valueChange={v => this.setState({ dependency: v })}
                    options={toArray(getAllGoals(this.props.components).map(c => c.name))}
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
                        onClick={() => this.props.onEvent(new GoalDependencyAdditionEvent(this.props.component.map(c => c.name).getOrElse(""), this.state.dependency))}>
                            Add
                    </Button>
                </Grid>
                <TableWithDeletion
                    cols={["Goal"]}
                    items={this.props.component.map((c: Goal) => Array.from(c.dependencies)).getOrElse([])}
                    onDelete={c =>
                        this.props.onEvent(
                            new GoalRelationRemovalEvent(
                                this.props.component.map((g: Goal) => g.name).getOrElse(""),
                                c.toString(),
                                "dependency"
                            )
                        )
                    }
                    props={[g => g]}
                />
                <Grid item xs={12} sx={{ mt: 5 }}>
                    <Typography variant="h5" component="div">
                        Responsible Roles
                    </Typography>
                </Grid>
                <SelectWithLabel
                    width={5}
                    label={"Responsible"}
                    value={this.state.responsible}
                    valueChange={v => this.setState({ responsible: v })}
                    options={toArray(this.props.roles.map(shortName).distinctBy(r => r))}
                />
                <SelectWithLabel
                    width={5}
                    label={"Modality"}
                    value={this.state.modality}
                    valueChange={v => this.setState({ modality: v })}
                    options={["obligation", "permission"]}
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
                        onClick={() => this.props.onEvent(new ResponsibleAdditionEvent(this.props.component.map(c => c.name).getOrElse(""), this.state.responsible, this.state.modality))}>
                            Add
                    </Button>
                </Grid>
                <TableWithDeletion
                    cols={["Responsibles", "Modality"]}
                    items={this.props.component.map((c: Goal) => Array.from(c.responsibles.entries())).getOrElse([])}
                    onDelete={c =>
                        this.props.onEvent(
                            new ResponsibleRemovalEvent(
                                this.props.component.map((g: Goal) => g.name).getOrElse(""),
                                c[0],
                            )
                        )
                    }
                    props={[r => shortName(r[0]), r => r[1]]}
                />
                <Toolbar/>
            </>
        )
    }
}

export default GoalMenu
