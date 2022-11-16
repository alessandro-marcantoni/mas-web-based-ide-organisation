import React from "react";
import Sidebar from "./structural/Sidebar";
import Diagram from "./structural/Diagram";
import {Component} from "../utils/structural/types";
import {
    createComponent,
    getAllRoles,
    getAllGroups,
    option,
    getGlobalGroups,
    addToGroup, removeFromGroup, add
} from "../utils/structural/utils";
import LinkModal from "./structural/LinkModal";
import RoleModal from "./structural/RoleModal";
import GroupModal from "./structural/GroupModal";
import UpdateModal from "./structural/UpdateModal";
import {none, Option, some} from "scala-types/dist/option/option";
import {loadSpec} from "../utils/structural/loader";
import {serialize} from "../utils/structural/serializer";

export type StructuralState = {
    components: Array<Component>
    added: Array<Component>
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
    toUpdate: Option<Component>
}

class Structural extends React.Component<{}, StructuralState> {
    constructor(props) {
        super(props);
        this.state = {
            components: [], added: [],
            showRoleModal: false, showGroupModal: false,
            role: "", roleExtension: "", subgroupOf: "", group: "",
            link: { from: "", to: "" },
            toUpdate: none()
        }
        this.addComponent = this.addComponent.bind(this)
        this.onPropertyChange = this.onPropertyChange.bind(this)
        this.onLinkCreation = this.onLinkCreation.bind(this)
        this.onLinkPropertyChange = this.onLinkPropertyChange.bind(this)
        this.onAdditionToGroup = this.onAdditionToGroup.bind(this)
        this.onRemoveFromGroup = this.onRemoveFromGroup.bind(this)
        this.onSelectedComponent = this.onSelectedComponent.bind(this)
    }

    addComponent(c: string, l: string = "", toAdd: boolean = false) {
        createComponent(this.state, c, l, toAdd).apply(comp => this.setState((state) => add(state, comp, toAdd)))
    }

    onPropertyChange(property: string, value: string): void {
        this.setState((state) => {
            return {
                components: state.components, added: state.added,
                showRoleModal: state.showRoleModal, showGroupModal: state.showGroupModal,
                group: state.group, role: state.role,
                roleExtension: state.roleExtension, subgroupOf: state.subgroupOf,
                link: state.link, toUpdate: state.toUpdate,
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
                toUpdate: some(componentType === "group" ?
                    getAllGroups(state.added).find(c => c.name === component) :
                    getAllRoles(state.added).find(c => c.name === component)),
                subgroupOf: componentType === "group" ?
                    option(getGlobalGroups(this.state.added)
                        .find(g => Array.from(g.subgroups).map(s => s.name).includes(component))).map(o => o.name).getOrElse("") :
                    state.subgroupOf
            }
        })
    }

    render() {
        return (
                <div className="container-fluid p-0 body">
                    <LinkModal
                        show={this.state.link.to !== ""}
                        onHide={() => this.setState({ link: { from: "", to: "" }})}
                        onAction={label => this.addComponent("link", label, true)}/>
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
                    <UpdateModal
                        show={this.state.toUpdate.isDefined()}
                        onHide={() => this.setState({ toUpdate: none() })}
                        subgroupOf={this.state.subgroupOf}
                        onPropertyChange={this.onPropertyChange}
                        component={this.state.toUpdate}
                        components={this.state.added}
                        onAdditionToGroup={this.onAdditionToGroup}
                        onRemoveFromGroup={this.onRemoveFromGroup}/>
                    <div className="row m-0">
                        <div className="col-2 vh-100 p-0">
                            <button onClick={() => console.log(this.state.added)}>SHOW STATE</button>
                            <button onClick={() => console.log(this.state.components)}>DISTINCT ROLES</button>
                            <button onClick={() => loadSpec("http://localhost:8080/spec.xml").then(elems => {
                                // @ts-ignore
                                this.setState({
                                    added: elems[0],
                                    components: elems[1],
                                    role: getAllRoles(elems[1]).length > 0 ? getAllRoles(elems[1])[0].name : "",
                                    group: getAllGroups(elems[1]).length > 0 ? getAllGroups(elems[1])[0].name : "" })
                            })}>LOAD</button>
                            <button onClick={() => console.log(serialize(this.state.components, this.state.added))}>SERIALIZE</button>
                            <Sidebar
                                role={this.state.role}
                                group={this.state.group}
                                roles={getAllRoles(this.state.components)}
                                groups={getAllGroups(this.state.components)}
                                addComponent={(c, add) => this.addComponent(c, "", add)}
                                propertyChanged={this.onPropertyChange}/>
                        </div>
                        <div className="col-10 vh-100 p-0">
                            <Diagram
                                onLinkCreation={this.onLinkCreation}
                                onAdditionToGroup={this.onAdditionToGroup}
                                onRemoveFromGroup={this.onRemoveFromGroup}
                                onPropertyChange={this.onLinkPropertyChange}
                                link={this.state.link}
                                elements={this.state.added} onSelectedComponent={this.onSelectedComponent}/>
                        </div>
                    </div>

                </div>
        )
    }
}

export default Structural
