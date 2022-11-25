import React from "react";
import Sidebar from "./structural/Sidebar";
import Diagram from "./structural/Diagram";
import {Component} from "../utils/structural/entities";
import {getAllRoles, getAllGroups, getGlobalGroups} from "../utils/structural/utils";
import LinkModal from "./structural/LinkModal";
import {Option, none} from "scala-types/dist/option/option";
import {list, List} from "scala-types/dist/list/list"
import {add, addToGroup, createComponent, removeComponent, removeFromGroup, changeExtension} from "../utils/structural/diagram";
import SideMenu from "./structural/SideMenu";

export type StructuralState = {
    components: List<Component>
    added: List<Component>
    showRoleModal: boolean
    showGroupModal: boolean
    role: string
    roleExtension: string
    subgroupOf: string
    group: string
    link: {
        from: string,
        to: string,
    }
    selected: Option<Component>
}

class Structural extends React.Component<unknown, StructuralState> {
    constructor(props) {
        super(props);
        this.state = {
            components: list<Component>(), added: list<Component>(),
            showRoleModal: false, showGroupModal: false,
            role: "", roleExtension: "", subgroupOf: "", group: "",
            link: { from: "", to: "" },
            selected: none()
        }
        this.addComponent = this.addComponent.bind(this)
        this.onPropertyChange = this.onPropertyChange.bind(this)
        this.onLinkCreation = this.onLinkCreation.bind(this)
        this.onLinkPropertyChange = this.onLinkPropertyChange.bind(this)
        this.onAdditionToGroup = this.onAdditionToGroup.bind(this)
        this.onRemoveFromGroup = this.onRemoveFromGroup.bind(this)
        this.onSelectedComponent = this.onSelectedComponent.bind(this)
        this.deleteComponent = this.deleteComponent.bind(this)
        this.changeExtension = this.changeExtension.bind(this)
    }

    addComponent(c: string, l: string = "", from: string = "", to: string = "", toAdd: boolean = false) {
        createComponent(this.state, c, l, from, to, toAdd)
            .apply((comp: Component) => this.setState((state: StructuralState) => add(state, comp, toAdd)))
    }

    deleteComponent(c: Component): void {
        this.setState((state) => {
            return {
                added: removeComponent(state, c.type, c)
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
                components: state.components, added: state.added,
                showRoleModal: state.showRoleModal, showGroupModal: state.showGroupModal,
                group: state.group, role: state.role,
                roleExtension: state.roleExtension, subgroupOf: state.subgroupOf,
                link: state.link, selected: state.selected,
                [property]: value
            }
        })
    }

    onLinkCreation(from: string, to: string): void {
        this.setState({ link: { from: from, to: to } })
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

    onLinkPropertyChange(property: string, value: string): void {
        this.setState((state) => {
            return {
                components: state.components,
                group: state.group,
                role: state.role,
                link: {
                    from: state.link.from,
                    to: state.link.to,
                    [property]: value
                }
            }
        })
    }

    onSelectedComponent(componentType: string, component: string): void {
        this.setState((state) => {
            return {
                selected: componentType === "group" ?
                    getAllGroups(state.added).find(c => c.name === component) :
                    getAllRoles(state.added).find(c => c.name === component),
                subgroupOf: componentType === "group" ?
                    getGlobalGroups(this.state.added)
                        .find(g => Array.from(g.subgroups).map(s => s.name).includes(component)).map(o => o.name).getOrElse("") :
                    state.subgroupOf
            }
        })
    }

    render() {
        return (
                <>
                    <LinkModal show={false} onHide={() => this.setState({ link: { from: "", to: "" }})}
                               onAction={label => this.addComponent("link", label, this.state.link.from, this.state.link.to, true)}/>
                    <Sidebar role={this.state.role} group={this.state.group}
                             components={this.state.added} propertyChanged={this.onPropertyChange}
                             addComponent={(c, add) => this.addComponent(c, "", "", "", add)}/>
                    <Diagram onLinkCreation={this.onLinkCreation} onAdditionToGroup={this.onAdditionToGroup}
                             onRemoveFromGroup={this.onRemoveFromGroup} onPropertyChange={this.onLinkPropertyChange}
                             link={this.state.link} elements={this.state.added}
                             onSelectedComponent={this.onSelectedComponent}/>
                    <SideMenu component={this.state.selected} components={this.state.added}
                              onClose={() => this.setState({ selected: none() })}
                              onExtensionChange={this.changeExtension} deleteComponent={this.deleteComponent}
                              addToGroup={this.onAdditionToGroup} removeFromGroup={this.onRemoveFromGroup}
                              addLink={(from, to, type) => this.addComponent("link", type, from, to, true)}/>
                </>
        )
    }
}

export default Structural
