import React from "react";
import Sidebar from "./structural/Sidebar";
import Diagram from "./structural/Diagram";
import {Component, getAllRoles, getGroups, Group, Link, Role} from "../types";
import LinkModal from "./structural/LinkModal";
import RoleModal from "./structural/RoleModal";
import GroupModal from "./structural/GroupModal";

type StructuralState = {
    components: Array<Component>
    added: Array<Component>
    showRoleModal: boolean
    showGroupModal: boolean
    role: string
    roleExtension: string
    group: string
    link: {
        from: string,
        to: string,
    }
}

class Structural extends React.Component<{}, StructuralState> {
    constructor(props) {
        super(props);
        //const r1 = new Role("Role1", undefined)
        //const r2 = new Role("Role2", undefined)
        //const g = new Group("Group1")
        this.state = {
            components: [/*r1, r2, g*/],
            added: [],
            showRoleModal: false,
            showGroupModal: false,
            role: "",
            roleExtension: "",
            group: "",
            link: { from: "", to: "" }
        }
        this.addComponent = this.addComponent.bind(this)
        this.onPropertyChange = this.onPropertyChange.bind(this)
        this.onLinkCreation = this.onLinkCreation.bind(this)
        this.onLinkPropertyChange = this.onLinkPropertyChange.bind(this)
        this.onRoleToGroupAddition = this.onRoleToGroupAddition.bind(this)
        this.onRoleFromGroupRemove = this.onRoleFromGroupRemove.bind(this)
        this.calcName = this.calcName.bind(this)
    }

    private calcName(name: string): string {
        return getAllRoles(this.state.added).map(r => r.name).includes(name)
            ? this.calcName(name + "_") : name
    }

    addComponent(c: string, l: string = "", toAdd: boolean = false) {
        let comp: Component
        switch (c) {
            case "role":
                if (getAllRoles(this.state.components).map(r => r.name).includes(this.state.role) && !toAdd) return
                comp = new Role(
                    this.calcName(this.state.role),
                    this.state.roleExtension ?
                        getAllRoles(this.state.components).find(r => r.name === this.state.roleExtension) :
                        undefined)
                break;
            case "group":
                if (getGroups(this.state.components).map(g => g.name).includes(this.state.group) && !toAdd) return
                if (getGroups(this.state.added).map(g => g.name).includes(this.state.group) && toAdd) return
                comp = new Group(this.state.group)
                break;
            case "link":
                comp = new Link(l,
                    getAllRoles(this.state.components).find(c => c.name === this.state.link.from),
                    getAllRoles(this.state.components).find(c => c.name === this.state.link.to))
                break;
            default:
        }
        this.setState((state) => {
            return {
                components: !toAdd ? state.components.concat([comp]) : state.components,
                added: toAdd ? state.added.concat([comp]) : state.added,
                group: getGroups(state.components).length === 0 ? state.group : getGroups(state.components)[0].name,
                role: getAllRoles(state.components).length === 0 ? state.role : getAllRoles(state.components)[0].name,
                link: { to: "", from: "" },
            }
        })
    }

    onPropertyChange(property: string, value: string): void {
        this.setState((state) => {
            return {
                components: state.components,
                added: state.added,
                showRoleModal: state.showRoleModal,
                showGroupModal: state.showGroupModal,
                group: state.group,
                role: state.role,
                roleExtension: state.roleExtension,
                link: state.link,
                [property]: value
            }
        })
    }

    onLinkCreation(from: string, to: string): void {
        this.setState({ link: { from: from, to: to } })
    }

    onRoleToGroupAddition(role: string, group: string): void {
        this.setState((state) => {
            const g: Group = state.added.find(c => c.type === "group" && (c as Group).name === group) as Group
            g.addRole(getAllRoles(this.state.added).find(c => c.name === role))
            return {
                added: state.added.filter(c => c).filter(c => { if (c.type !== "role") { return true } else return (c as Role).name !== role})
            }
        })
    }

    onRoleFromGroupRemove(role: string, group: string): void {
        this.setState((state) => {
            const g: Group = state.added.find(c => c.type === "group" && (c as Group).name === group) as Group
            const r: Role = Array.from(g.roles).find(r => r.name === role)
            g.removeRole(r)
            return {
                added: state.added.concat(r)
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

    render() {
        return (
                <div className="container-fluid p-0 body">
                    <LinkModal
                        show={this.state.link.to !== ""}
                        onHide={() => this.setState({ link: { from: "", to: "" }})}
                        onAction={label => this.addComponent("link", label)}/>
                    <RoleModal
                        show={this.state.showRoleModal}
                        onHide={() => this.setState({ showRoleModal: false })}
                        value={this.state.role}
                        roles={getAllRoles(this.state.components)}
                        propertyChanged={this.onPropertyChange}
                        addRole={() => this.addComponent("role")}/>
                    <GroupModal
                        show={this.state.showGroupModal}
                        onHide={() => this.setState({showGroupModal: false})}
                        value={this.state.group}
                        propertyChanged={this.onPropertyChange}
                        addGroup={() => this.addComponent("group")}/>
                    <div className="row m-0">
                        <div className="col-2 vh-100 p-0">
                            <Sidebar
                                role={this.state.role}
                                group={this.state.group}
                                roles={getAllRoles(this.state.components)}
                                groups={getGroups(this.state.components)}
                                addComponent={(c, add) => this.addComponent(c, "", add)}
                                propertyChanged={this.onPropertyChange}/>
                        </div>
                        <div className="col-10 vh-100 p-0">
                            <Diagram
                                onLinkCreation={this.onLinkCreation}
                                onRoleToGroupAddition={this.onRoleToGroupAddition}
                                onRoleFromGroupRemove={this.onRoleFromGroupRemove}
                                onPropertyChange={this.onLinkPropertyChange}
                                link={this.state.link}
                                elements={this.state.added}/>
                        </div>
                    </div>

                </div>
        )
    }
}

export default Structural
