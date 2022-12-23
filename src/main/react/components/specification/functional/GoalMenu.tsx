import { Button, Grid, Typography } from "@mui/material"
import React from "react"
import { Option } from "scala-types"
import { Component, DiagramEventHandler } from "../../../../typescript/commons"
import { Goal } from "../../../../typescript/domain/functional"
import { GoalRelationRemovalEvent, GoalDependencyAdditionEvent } from '../../../../typescript/functional/events';
import TableWithDeletion from "../../common/TableWithDeletion"
import SelectWithLabel from "../../common/SelectWithLabel"
import { List, toArray } from "scala-types/dist/list/list"
import { getAllGoals } from "../../../../typescript/functional/utils"

type GoalMenuProps = {
    component: Option<Goal>
    components: List<Component>
    onEvent: DiagramEventHandler
}

type GoalMenuState = {
    dependency: string
}

class GoalMenu extends React.Component<GoalMenuProps, GoalMenuState> {
    constructor(props) {
        super(props)
        this.state = {
            dependency: "",
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
                        Subgoals
                    </Typography>
                </Grid>
                <Grid item xs={12} sx={{ mt: 3 }}>
                    <Typography variant="h5" component="div">
                        Dependencies
                    </Typography>
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
            </>
        )
    }
}

export default GoalMenu
