import {Button, Form, Modal} from "react-bootstrap";
import React from "react";
import {Role} from "../../utils/structural/types";
import {List, toArray} from "scala-types/dist/list/list";

type RoleModalProps = {
    show: boolean
    onHide: () => void
    value: string
    roles: List<Role>
    propertyChanged: (p: string, v: any) => void
    addRole: () => void
}

const RoleModal = (p: RoleModalProps) =>
    <Modal show={p.show} onHide={p.onHide}>
        <Modal.Header closeButton>
            <Modal.Title>Role creation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Label>Role name:</Form.Label>
            <Form.Control className="mb-3" type="text" value={p.value}
                          onChange={e => p.propertyChanged("role", e.target.value)}/>
            <Form.Label>Extends from:</Form.Label>
            <Form.Select className="mb-3"
                         onChange={e => p.propertyChanged("roleExtension", e.target.value)}>
                <option value={""}>None</option>
                {toArray(p.roles.map(r => <option key={r.name} value={r.name}>{r.name}</option>))}
            </Form.Select>
            <Button variant="success" className="w-100"
                    onClick={() => {
                        p.addRole()
                        p.propertyChanged("showRoleModal", false)
                    }}>Create role</Button>
        </Modal.Body>
    </Modal>

export default RoleModal
