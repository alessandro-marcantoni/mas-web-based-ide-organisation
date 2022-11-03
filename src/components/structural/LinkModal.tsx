import {Form, Modal} from "react-bootstrap";
import React from "react";

type LinkModalProps = {
    show: boolean
    onHide: () => void
    onAction: (s: string) => void
}

const LinkModal = (p: LinkModalProps) =>
    <Modal
        show={p.show}
        onHide={p.onHide}>
        <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Select onChange={e => p.onAction(e.target.value)}>
                <option value="">Choose a link type</option>
                <option value="authority">Authority</option>
                <option value="communication">Communication</option>
            </Form.Select>
        </Modal.Body>
    </Modal>

export default LinkModal;
