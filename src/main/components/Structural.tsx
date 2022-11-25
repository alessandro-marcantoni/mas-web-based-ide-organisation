import React from "react";
import Sidebar from "./structural/Sidebar";
import Diagram from "./structural/Diagram";
import {Component, Group, Role} from "../utils/structural/entities";
import {getAllRoles, getAllGroups} from "../utils/structural/utils";
import {Option, none} from "scala-types/dist/option/option";
import {list, List} from "scala-types/dist/list/list"
import {add, addToGroup, createComponent, removeComponent, removeFromGroup, changeExtension} from "../utils/structural/diagram";
import SideMenu from "./structural/SideMenu";

export type StructuralState = {
    added: List<Component>
    role: string
    group: string
    selected: Option<Component>
}

class Structural extends React.Component<unknown, StructuralState> {
    constructor(props) {
        super(props);
        this.state = {
            added: list<Component>(),
            role: "", group: "",
            selected: none()
        }
        this.addComponent = this.addComponent.bind(this)
        this.onPropertyChange = this.onPropertyChange.bind(this)
        this.onAdditionToGroup = this.onAdditionToGroup.bind(this)
        this.onRemoveFromGroup = this.onRemoveFromGroup.bind(this)
        this.onSelectedComponent = this.onSelectedComponent.bind(this)
        this.deleteComponent = this.deleteComponent.bind(this)
        this.changeExtension = this.changeExtension.bind(this)
    }

    addComponent(c: string, l: string = "", from: string = "", to: string = "") {
        createComponent(this.state, c, l, from, to)
            .apply((comp: Component) => this.setState((state: StructuralState) => add(state, comp)))
    }

    deleteComponent(c: Component): void {
        this.setState((state) => {
            return {
                added: removeComponent(state, c.type, c),
                selected: state.selected
                    .flatMap(s => list<Component>()
                        .appendedAll(getAllGroups(state.added))
                        .appendedAll(getAllRoles(state.added))
                        .find(c => (c.type === "group" ? c as Group : c as Role).name === s.name))
            }
        })
    }

    changeExtension(role: string, extended: string): void {
        this.setState((state) => {
            const added = changeExtension(state, role, extended)
            return {
                added: added,
                selected: state.selected.flatMap(() => getAllRoles(added).find(r => r.name === role))
            }
        })
    }

    onPropertyChange(property: string, value: unknown): void {
        this.setState((state) => {
            return {
                added: state.added,
                group: state.group, role: state.role,
                selected: state.selected,
                [property]: value
            }
        })
    }

    onAdditionToGroup(component: string, type: string, group: string): void {
        this.setState((state) => {
            return {
                added: addToGroup(state, component, type, group)
            }
        })
    }

    onRemoveFromGroup(component: string, type: string, group: string): void {
        this.setState((state) => {
            return {
                added: removeFromGroup(state, component, type, group)
            }
        })
    }

    onSelectedComponent(componentType: string, component: string): void {
        this.setState((state) => {
            return {
                selected: componentType === "group" ?
                    getAllGroups(state.added).find(c => c.name === component) :
                    getAllRoles(state.added).find(c => c.name === component),
            }
        })
    }

    render() {
        return (
                <>
                    <Sidebar role={this.state.role} group={this.state.group}
                             components={this.state.added} propertyChanged={this.onPropertyChange}
                             addComponent={(c) => this.addComponent(c, "", "", "")}/>
                    <Diagram onLinkCreation={(from, to) => this.addComponent("role", "compatibility", from, to)}
                             onAdditionToGroup={this.onAdditionToGroup} onRemoveFromGroup={this.onRemoveFromGroup}
                             elements={this.state.added} onSelectedComponent={this.onSelectedComponent}/>
                    <SideMenu component={this.state.selected} components={this.state.added}
                              onClose={() => this.setState({ selected: none() })}
                              onExtensionChange={this.changeExtension} deleteComponent={this.deleteComponent}
                              addToGroup={this.onAdditionToGroup} removeFromGroup={this.onRemoveFromGroup}
                              addLink={(from, to, type) => this.addComponent("link", type, from, to)}/>
                </>
        )
    }
}

export default Structural
