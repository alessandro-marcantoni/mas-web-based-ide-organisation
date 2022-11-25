import React from "react";
import {Button, Form, InputGroup, Modal} from "react-bootstrap";
import {Component, Group} from "../../utils/structural/entities";
import {Option} from "scala-types/dist/option/option";
import {getGlobalGroups, isInGroup, separator} from "../../utils/structural/utils";
import {List, toArray} from "scala-types/dist/list/list";

type UpdateModalProps = {
    show: boolean
    onHide: () => void
    subgroupOf: string
    onPropertyChange: (p: string, v: string) => void
    onAdditionToGroup: (c: string, t: string, g: string) => void
    onRemoveFromGroup: (c: string, t: string, g: string) => void
    onComponentDelete: (c: Component) => void
    component: Option<Component>
    components: List<Component>
}

const UpdateModal = (p: UpdateModalProps) =>
    <Modal show={p.show} onHide={p.onHide}>
        <Modal.Header closeButton>
            <Modal.Title>{p.component.map(c => c.name)
                .map(n => isInGroup(n) ? n.replace(separator, "'s ") : n).getOrElse("")}
            </Modal.Title>
        </Modal.Header>
        {p.component.map(c => c.type === "group").getOrElse(false) &&
          <Modal.Body>
            <Form.Label>Subgroup of:</Form.Label>
            <InputGroup>
                <Form.Select value={p.subgroupOf} onChange={e => p.onPropertyChange("subgroupOf", e.target.value)}>
                  <option value={""}>None</option>
                  {p.component.map(c => (c as Group).subgroups.size === 0).getOrElse(false) ?
                      toArray(getGlobalGroups(p.components)
                          .filter(c => c.name !== p.component.map(c => c.name).getOrElse(""))
                          .map(c => <option key={c.name} value={c.name}>{c.name}</option>)) : []}
                </Form.Select>
                <Button variant="success"
                        onClick={() => {
                            p.subgroupOf ?
                                p.onAdditionToGroup(p.component.map(c => c.name).getOrElse(""), "group", p.subgroupOf) :
                                p.onRemoveFromGroup(
                                    p.component.map(c => c.name).getOrElse(""), "group",
                                    p.component.flatMap(o => getGlobalGroups(p.components).find(g =>
                                        Array.from(g.subgroups).map(s => s.name).includes(o.name))).map(o => o.name).getOrElse(""))
                            p.onHide()
                        }}>Apply</Button>
            </InputGroup>
          </Modal.Body>
        }
        {p.component.isDefined() &&
          <Modal.Footer>
            <Button variant="danger" className="w-100"
                    onClick={() => {
                        p.onComponentDelete(p.component.getOrElse(undefined))
                        p.onHide()
                    }}>Delete Element</Button>
          </Modal.Footer>
        }
    </Modal>

export default UpdateModal
