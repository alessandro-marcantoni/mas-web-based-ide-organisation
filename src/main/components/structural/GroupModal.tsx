import React from "react";
import {Button, Form, Modal} from "react-bootstrap";

type GroupModalProps = {
    show: boolean
    onHide: () => void
    value: string
    propertyChanged: (p: string, v: unknown) => void
    addGroup: () => void
}

const GroupModal = (p: GroupModalProps) =>
    <Modal show={p.show} onHide={p.onHide}>
        <Modal.Header closeButton>
            <Modal.Title>Group creation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Control className="mb-3" type="text" value={p.value}
                          onChange={e => p.propertyChanged("group", e.target.value)}/>
            <Button variant="success" className="w-100"
                    onClick={() => {
                        p.addGroup()
                        p.propertyChanged("showGroupModal", false)
                    }}>Create group</Button>
        </Modal.Body>
    </Modal>

export default GroupModal
