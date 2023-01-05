import React from "react"
import { List } from "scala-types/dist/list/list"
import { none, Option } from "scala-types/dist/option/option"
import { Component, DiagramEvent, DiagramEventType } from "../../../../typescript/commons"
import { GoalCreationEvent, GoalRelationRemovalEvent, GoalDependencyAdditionEvent, OperatorChangeEvent, ResponsibleAdditionEvent } from '../../../../typescript/functional/events';
import { presentation } from "../../../../typescript/functional/cytoscape"
import Diagram from "../../common/Diagram"
import Sidebar from "./Sidebar"
import { config } from "../../../../typescript/structural/cytoscape"
import { ComponentDeletionEvent, SelectedComponentEvent } from "../../../../typescript/structural/events"
import { getAllGoals } from "../../../../typescript/functional/utils"
import SideMenu from "../../common/SideMenu"
import { addDependency, addGoal, addResponsible, changeOperator, deleteGoal, dependencyRemover, removeGoalRelation } from "../../../../typescript/functional/diagram"
import { Goal } from "../../../../typescript/domain/functional"

type FunctionalProps = {
    name: string
    org: List<Component>
    roles: List<string>
    save: (org: List<Component>) => void
}

type FunctionalState = {
    components: List<Component>
    selected: Option<Component>
}

class Functional extends React.Component<FunctionalProps, FunctionalState> {
    constructor(props) {
        super(props)
        this.state = {
            components: this.props.org,
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
            case DiagramEventType.ComponentDeletion:
                const cde = event as ComponentDeletionEvent
                this.setState(state => {
                    return {
                        components: deleteGoal(state.components, cde.component.getName()),
                        selected: none(),
                    }
                })
                break
            case DiagramEventType.OperatorChange:
                const oce = event as OperatorChangeEvent
                this.setState(state => {
                    return {
                        components: changeOperator(state.components, oce.goal, oce.operator),
                        selected: state.selected.flatMap((g: Goal) =>
                            getAllGoals(state.components).find(c => c.name === g.name)
                        ),
                    }
                })
                break
            case DiagramEventType.ResponsibleAddition:
                const rae = event as ResponsibleAdditionEvent
                this.setState(state => {
                    return {
                        components: addResponsible(state.components, rae.goal, rae.responsible),
                        selected: state.selected.flatMap((g: Goal) =>
                            getAllGoals(state.components).find(c => c.name === g.name)
                        ),
                    }
                })
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
                    save={this.props.save}
                />
                <Diagram
                    configuration={(cy, props) => config(cy, props)}
                    elements={this.state.components}
                    onDiagramEvent={this.onDiagramEvent}
                    presentation={presentation}
                />
                <SideMenu
                    component={this.state.selected}
                    components={this.state.components}
                    onClose={() => this.setState({ selected: none() })}
                    onEvent={this.onDiagramEvent}
                    roles={this.props.roles}
                />
            </>
        )
    }
}

export default Functional
