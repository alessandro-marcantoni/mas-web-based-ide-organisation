import { Grid, Typography } from "@mui/material"
import React from "react"
import { Option } from "scala-types"
import { DiagramEventHandler } from "../../../../typescript/commons"
import { Goal } from "../../../../typescript/domain/functional"
import { GoalRelationRemovalEvent } from "../../../../typescript/functional/events"
import TableWithDeletion from "../../common/TableWithDeletion"

type GoalMenuProps = {
    component: Option<Goal>
    onEvent: DiagramEventHandler
}

class GoalMenu extends React.Component<GoalMenuProps, unknown> {
    constructor(props) {
        super(props)
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
                <TableWithDeletion
                    cols={["Goal"]}
                    items={this.props.component.map((c: Goal) => Array.from(c.dependencies)).getOrElse([])}
                    onDelete={c =>
                        this.props.onEvent(
                            new GoalRelationRemovalEvent(
                                this.props.component.map((g: Goal) => g.name).getOrElse(""),
                                c.getName(),
                                "dependency"
                            )
                        )
                    }
                    props={[(g: Goal) => g.name]}
                />
            </>
        )
    }
}

export default GoalMenu
