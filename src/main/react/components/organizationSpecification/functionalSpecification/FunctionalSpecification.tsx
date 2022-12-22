import React from "react"
import { list } from "scala-types"
import { List } from "scala-types/dist/list/list"
import { none, Option } from "scala-types/dist/option/option"
import { Component, DiagramEvent, DiagramEventType } from "../../../../typescript/commons"
import { GoalCreationEvent, GoalRelationRemovalEvent, GoalDependencyAdditionEvent } from '../../../../typescript/functional/events';
import { presentation } from "../../../../typescript/functional/cytoscape"
import Diagram from "../../common/Diagram"
import Sidebar from "./Sidebar"
import { cddOptions, config, ehOptions } from "../../../../typescript/structural/cytoscape"
import { SelectedComponentEvent } from "../../../../typescript/structural/events"
import { getAllGoals } from "../../../../typescript/functional/utils"
import SideMenu from "../../common/SideMenu"
import { addDependency, addGoal, dependencyRemover, removeGoalRelation } from "../../../../typescript/functional/diagram"
import { Goal } from "../../../../typescript/domain/functional"

type FunctionalState = {
    components: List<Component>
    selected: Option<Component>
}

class Functional extends React.Component<unknown, FunctionalState> {
    constructor(props) {
        super(props)
        this.state = {
            components: list<Component>(),
            selected: none(),
        }
        this.onDiagramEvent = this.onDiagramEvent.bind(this)
        this.onPropertyChange = this.onPropertyChange.bind(this)
    }

    onDiagramEvent(event: DiagramEvent): void {
        switch (event.type) {
            case DiagramEventType.GoalCreation:
                const gce = event as GoalCreationEvent
                this.setState(state => {
                    return {
                        components: addGoal(state.components, gce.name),
                        selected: state.selected,
                    }
                })
                break
            case DiagramEventType.SelectedComponent:
                const se = event as SelectedComponentEvent
                this.setState({ selected: getAllGoals(this.state.components).find(c => c.name === se.component) })
                break
            case DiagramEventType.SubgoalRemoval || DiagramEventType.DependencyRemoval:
                const sre = event as GoalRelationRemovalEvent
                this.setState(state => {
                    return {
                        components: removeGoalRelation(
                            state.components,
                            sre.goal,
                            sre.other,
                            dependencyRemover
                        ),
                        selected: state.selected.flatMap((g: Goal) =>
                            getAllGoals(state.components).find(c => c.name === g.name)
                        ),
                    }
                })
                break
            case DiagramEventType.DependencyAddition:
                const dae = event as GoalDependencyAdditionEvent
                this.setState(state => {
                    return {
                        components: addDependency(state.components, dae.goal, dae.other),
                        selected: state.selected.flatMap((g: Goal) =>
                            getAllGoals(state.components).find(c => c.name === g.name)
                        ),
                    }
                })
                break
        }
    }

    onPropertyChange(property: string, value: unknown): void {
        this.setState(state => {
            return {
                components: state.components,
                selected: state.selected,
                [property]: value,
            }
        })
    }

    render() {
        return (
            <>
                <Sidebar
                    components={this.state.components}
                    onEvent={this.onDiagramEvent}
                    onPropertyChange={this.onPropertyChange}
                />
                <Diagram
                    configuration={(cy, props) => config(cy, ehOptions(), cddOptions(props), props)}
                    elements={this.state.components}
                    onDiagramEvent={this.onDiagramEvent}
                    presentation={presentation}
                />
                <SideMenu
                    component={this.state.selected}
                    components={this.state.components}
                    onClose={() => this.setState({ selected: none() })}
                    onEvent={this.onDiagramEvent}
                />
            </>
        )
    }
}

export default Functional
