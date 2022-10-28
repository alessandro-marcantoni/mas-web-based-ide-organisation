import React from "react";
import Sidebar from "./structural/Sidebar";
import Diagram from "./structural/Diagram";
import {Component, getAllRoles, Group, Link, Role} from "../types";

type StructuralState = {
    components: Array<Component>
    role: string
    group: string
    link: {
        from: string,
        to: string,
    }
}

class Structural extends React.Component<{}, StructuralState> {
    constructor(props) {
        super(props);
        const r1 = new Role("Role1", undefined)
        const r2 = new Role("Role2", undefined)
        const g = new Group("Group1")
        g.addRole(new Role("Role3", undefined))
        this.state = {
            components: [r1, r2, new Link("authority", r1, r2), g],
            role: "",
            group: "",
            link: { from: "", to: "" }
        }
        this.addComponent = this.addComponent.bind(this)
        this.onPropertyChange = this.onPropertyChange.bind(this)
        this.onLinkCreation = this.onLinkCreation.bind(this)
        this.onLinkPropertyChange = this.onLinkPropertyChange.bind(this)
        this.onRoleToGroupAddition = this.onRoleToGroupAddition.bind(this)
        this.onRoleFromGroupRemove = this.onRoleFromGroupRemove.bind(this)
    }

    addComponent(c: string, l: string = "") {
        let comp: Component
        switch (c) {
            case "role":
                comp = new Role(this.state.role, undefined)
                break;
            case "group":
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
                components: state.components.concat([comp]),
                group: state.group,
                role: state.role,
                link: state.link,
                [c]: ""
            }
        })
    }

    onPropertyChange(property: string, value: string): void {
        this.setState((state) => {
            return {
                components: state.components,
                group: state.group,
                role: state.role,
                link: state.link,
                [property]: value
            }
        })
    }

    onLinkCreation(from: string, to: string): void {
        console.log(from, to)
        this.setState({ link: { from: from, to: to } })
    }

    onRoleToGroupAddition(role: string, group: string): void {
        this.setState((state) => {
            const g: Group = state.components.find(c => c.type === "group" && (c as Group).name === group) as Group
            g.addRole(getAllRoles(this.state.components).find(c => c.name === role))
            return {
                components: state.components.filter(c => c).filter(c => { if (c.type !== "role") { return true } else return (c as Role).name !== role})
            }
        })
    }

    onRoleFromGroupRemove(role: string, group: string): void {
        this.setState((state) => {
            const g: Group = state.components.find(c => c.type === "group" && (c as Group).name === group) as Group
            const r: Role = Array.from(g.roles).find(r => r.name === role)
            g.removeRole(r)
            return {
                components: state.components.concat(r)
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
                <div className="body">
                    {this.state.link.to && <div id="linkModal" className="modal">
                        <div className="modal-content">
                          <select onChange={e => {
                              this.addComponent("link", e.target.value)
                          }}>
                            <option value="">Choose a link type</option>
                            <option value="authority">Authority</option>
                            <option value="communication">Communication</option>
                          </select>
                        </div>
                    </div>}
                    <Sidebar
                        role={this.state.role}
                        group={this.state.group}
                        roles={getAllRoles(this.state.components)}
                        addComponent={this.addComponent}
                        propertyChanged={this.onPropertyChange}/>
                    <Diagram
                        onLinkCreation={this.onLinkCreation}
                        onRoleToGroupAddition={this.onRoleToGroupAddition}
                        onRoleFromGroupRemove={this.onRoleFromGroupRemove}
                        onPropertyChange={this.onLinkPropertyChange}
                        link={this.state.link}
                        elements={this.state.components}/>
                </div>
        )
    }
}

export default Structural;
