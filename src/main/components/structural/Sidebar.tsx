import React from "react";
import {Group, Role} from "../../utils/structural/types";
import {Button, Card, Form, InputGroup, OverlayTrigger, Tooltip} from "react-bootstrap";
import {List, toArray} from "scala-types/dist/list/list";

type SidebarProps = {
    roles: List<Role>
    groups: List<Group>
    role: string
    group: string
    addComponent: (c: string, add: boolean) => void
    propertyChanged: (p: string, v: any) => void
}

const Sidebar = (p: SidebarProps) => {
    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 bg-light h-100">
            <Card className="p-3 shadow border-0 my-2">
                <Card.Title className="mb-3">Roles</Card.Title>
                <Button onClick={() => p.propertyChanged("showRoleModal", true)}>Create new role</Button>
                <InputGroup className="mt-2">
                    <Form.Select onChange={e => p.propertyChanged("role", e.target.value)}>
                        {toArray(p.roles.map(r => <option key={r.name} value={r.name}>{r.name}</option>))}
                    </Form.Select>
                    <OverlayTrigger
                        delay={{ show: 250, hide: 400 }}
                        overlay={<Tooltip>Add the selected role to the specification</Tooltip>}>
                        <Button disabled={p.roles.size() <= 0} onClick={() => p.addComponent("role", true)}>+</Button>
                    </OverlayTrigger>
                </InputGroup>
            </Card>
            <Card className="p-3 shadow border-0 my-2">
                <Card.Title className="mb-3">Groups</Card.Title>
                <Button onClick={() => p.propertyChanged("showGroupModal", true)}>Create new group</Button>
                <InputGroup className="mt-2">
                    <Form.Select onChange={e => p.propertyChanged("group", e.target.value)}>
                        {toArray(p.groups.map(g => <option key={g.name} value={g.name}>{g.name}</option>))}
                    </Form.Select>
                    <OverlayTrigger
                        delay={{ show: 250, hide: 400 }}
                        overlay={<Tooltip>Add the selected group to the specification</Tooltip>}>
                        <Button disabled={p.groups.size() <= 0} onClick={() => p.addComponent("group", true)}>+</Button>
                    </OverlayTrigger>
                </InputGroup>
            </Card>
        </div>
    )
}

export default Sidebar
