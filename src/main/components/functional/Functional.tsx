import React from "react"
import { list } from "scala-types"
import { List } from "scala-types/dist/list/list"
import { none, Option } from "scala-types/dist/option/option"
import { Component, DiagramEvent, DiagramEventType } from "../../utils/commons"
import { GoalCreationEvent, GoalRelationRemovalEvent } from "../../utils/functional/events"
import { presentation } from "../../utils/functional/cytoscape"
import Diagram from "../common/Diagram"
import Sidebar from "./Sidebar"
import { cddOptions, config, ehOptions } from "../../utils/structural/cytoscape"
import { SelectedComponentEvent } from "../../utils/structural/events"
import { getAllGoals } from "../../utils/functional/utils"
import SideMenu from "../common/SideMenu"
import { addGoal, dependencyRemover, removeGoalRelation, subgoalRemover } from "../../utils/functional/diagram"
import { Goal } from "../../utils/functional/entities"

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
                            sre.relation === "subgoal" ? subgoalRemover : dependencyRemover
                        ),
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
