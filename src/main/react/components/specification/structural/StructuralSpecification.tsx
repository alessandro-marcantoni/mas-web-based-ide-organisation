import React from "react"
import Sidebar from "./Sidebar"
import Diagram from "../../common/Diagram"
import { Group, Role, Compatibility } from '../../../../typescript/domain/structural';
import { getAllRoles, getAllGroups } from "../../../../typescript/utils/utils"
import { Option, none } from "scala-types/dist/option/option"
import { list, List } from "scala-types/dist/list/list"
import {
    add,
    addToGroup,
    createComponent,
    removeComponent,
    removeFromGroup,
    changeExtension,
    createCardinality,
    changeRoleCardinality,
} from "../../../../typescript/domain/diagrams/structural"
import SideMenu from "../../common/SideMenu"
import {
    AdditionToGroupEvent,
    CardinalityConstraintAdditionEvent,
    ComponentDeletionEvent,
    ExtensionChangeEvent,
    LinkCreationEvent,
    RemovalFromGroupEvent,
    RoleCardinalityChangeEvent,
    SelectedComponentEvent,
} from "../../../../typescript/domain/events/structural"
import { config, presentation } from "../../../../typescript/utils/cytoscape/structural"
import { Component, DiagramEvent, DiagramEventType } from "../../../../typescript/domain/commons"

type StructuralProps = {
    name: string
    org: List<Component>
    save: (org: List<Component>) => void
}

export type StructuralState = {
    added: List<Component>
    selected: Option<Component>
}

class Structural extends React.Component<StructuralProps, StructuralState> {
    constructor(props) {
        super(props)
        this.state = {
            added: this.props.org,
            selected: none(),
        }
        this.addComponent = this.addComponent.bind(this)
        this.onAdditionToGroup = this.onAdditionToGroup.bind(this)
        this.onRemoveFromGroup = this.onRemoveFromGroup.bind(this)
        this.onSelectedComponent = this.onSelectedComponent.bind(this)
        this.deleteComponent = this.deleteComponent.bind(this)
        this.changeExtension = this.changeExtension.bind(this)
        this.addCardinality = this.addCardinality.bind(this)
        this.changeRoleCardinality = this.changeRoleCardinality.bind(this)
        this.onDiagramEvent = this.onDiagramEvent.bind(this)
    }

    addComponent(c: Component) {
        createComponent(this.state.added, c).apply((comp: Component) =>
            this.setState((state: StructuralState) => add(state, comp))
        )
    }

    addCardinality(g: string, type: string, subject: string, min: number, max: number) {
        this.setState(state => {
            return { added: createCardinality(state, g, type, subject, min, max) }
        })
    }

    deleteComponent(c: Component): void {
        this.setState(state => {
            return {
                added: removeComponent(state, c.type, c),
                selected: state.selected.flatMap(s =>
                    list<Component>()
                        .appendedAll(getAllGroups(state.added))
                        .appendedAll(getAllRoles(state.added))
                        .find(c => (c.type === "group" ? (c as Group) : (c as Role)).name === s.name)
                ),
            }
        })
    }

    changeExtension(role: string, extended: string): void {
        this.setState(state => {
            const added = changeExtension(state, role, extended)
            return {
                added: added,
                selected: state.selected.flatMap(() => getAllRoles(added).find(r => r.name === role)),
            }
        })
    }

    changeRoleCardinality(name: string, property: string, value: number) {
        this.setState(state => {
            const added = changeRoleCardinality(state, name, property, value)
            return {
                added: added,
                selected: state.selected.flatMap(() => getAllRoles(added).find(r => r.name === name)),
            }
        })
    }

    onAdditionToGroup(component: string, type: string, group: string): void {
        this.setState(state => {
            return {
                added: addToGroup(state, component, type, group),
            }
        })
    }

    onRemoveFromGroup(component: string, type: string, group: string): void {
        this.setState(state => {
            return {
                added: removeFromGroup(state, component, type, group),
            }
        })
    }

    onSelectedComponent(componentType: string, component: string): void {
        this.setState(state => {
            return {
                selected:
                    componentType === "group"
                        ? getAllGroups(state.added).find(c => c.name === component)
                        : getAllRoles(state.added).find(c => c.name === component),
            }
        })
    }

    onDiagramEvent(event: DiagramEvent): void {
        switch (event.type) {
            case DiagramEventType.LinkCreation:
                const lce = event as LinkCreationEvent
                this.addComponent(new Compatibility(lce.from, lce.to))
                break
            case DiagramEventType.AdditionToGroup:
                const ae = event as AdditionToGroupEvent
                this.onAdditionToGroup(ae.component, ae.componentType, ae.destinationGroup)
                break
            case DiagramEventType.RemovalFromGroup:
                const re = event as RemovalFromGroupEvent
                this.onRemoveFromGroup(re.component, re.componentType, re.sourceGroup)
                break
            case DiagramEventType.SelectedComponent:
                const se = event as SelectedComponentEvent
                this.onSelectedComponent(se.componentType, se.component)
                break
            case DiagramEventType.ExtensionChange:
                const ece = event as ExtensionChangeEvent
                this.changeExtension(ece.role, ece.extension)
                break
            case DiagramEventType.RoleCardinalityChange:
                const rce = event as RoleCardinalityChangeEvent
                this.changeRoleCardinality(rce.role, rce.property, rce.value)
                break
            case DiagramEventType.ComponentDeletion:
                const de = event as ComponentDeletionEvent
                this.deleteComponent(de.component)
                break
            case DiagramEventType.CardinalityConstraintAddition:
                const cae = event as CardinalityConstraintAdditionEvent
                this.addCardinality(cae.group, cae.objectType, cae.object, cae.min, cae.max)
                break
        }
    }

    render() {
        return (
            <>
                <Sidebar
                    name={this.props.name}
                    components={this.state.added}
                    addComponent={c => this.addComponent(c)}
                    save={this.props.save}
                />
                <Diagram
                    onDiagramEvent={this.onDiagramEvent}
                    elements={this.state.added}
                    presentation={presentation}
                    configuration={(cy, props) => config(cy, props)}
                />
                <SideMenu
                    component={this.state.selected}
                    components={this.state.added}
                    onClose={() => this.setState({ selected: none() })}
                    onEvent={this.onDiagramEvent}
                    roles={list()}
                />
            </>
        )
    }
}

export default Structural
