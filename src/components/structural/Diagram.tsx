import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import {Component, Group, Link, Role} from "../../types";
import {Core, ElementDefinition} from "cytoscape";
import cytoscape from "cytoscape";
import edgehandles from 'cytoscape-edgehandles';
import compoundDragAndDrop from 'cytoscape-compound-drag-and-drop';
import * as nodesStyle from "../../style/cytoscape/style.json";

type DiagramProps = {
    elements: Array<Component>
    link: {
        from: string,
        to: string,
    }
    onLinkCreation: (from: string, to: string) => void
    onPropertyChange: (p: string, v: string) => void
    onRoleToGroupAddition: (r: string, g: string) => void
    onRoleFromGroupRemove: (r: string, g: string) => void
}

class Diagram extends React.Component<DiagramProps, {}> {
    private cy: Core

    constructor(props) {
        super(props);
        this.presentation = this.presentation.bind(this)
    }

    presentation(c: Component, group: string | undefined = undefined): ElementDefinition[] {
        if (!c) return []
        switch(c.type) {
            case "role":
                const r = c as Role
                return [{ data: { id: r.name, label: r.name.replace(/_+/, ""), role: true, parent: group } }]
            case "group":
                const g = c as Group
                return [{ data: { id: g.name, label: g.name, group: true } }, ...Array.from(g.roles).flatMap(e => this.presentation(e, g.name))]
            case "link":
                const l = c as Link
                return [{ data: { id: l.from.name + l.to.name + l.label, source: l.from.name, target: l.to.name, label: l.label, link: true, arrow: "triangle" } }]
            default:
                return []
        }
    }

    componentDidMount() {
        cytoscape.use(edgehandles)
        cytoscape.use(compoundDragAndDrop)
        const defaults = {
            canConnect: () => true,
        };
        const options = {
            grabbedNode: node => node._private.data.role,
            dropTarget: node => node._private.data.group,
            dropSibling: node => node._private.data.role,
            newParentNode: (grabbedNode, dropSibling) => dropSibling
        }
        //@ts-ignore
        const eh = this.cy.edgehandles(defaults)
        //@ts-ignore
        this.cy.compoundDragAndDrop(options);
        this.cy.center()
        this.cy.on("free", (e) => {
            console.log(e.target._private.position)
        })
        this.cy.on("add", () => {
            this.cy.center()
        })
        this.cy.on("cxttap", (e) => {
            eh.start(e.target)
        })
        // @ts-ignore
        this.cy.on("ehcomplete", (ev, s, t, e) => {
            this.props.onLinkCreation(s._private.data.label, t._private.data.label)
            this.cy.remove(e)
        })
        // @ts-ignore
        this.cy.on("cdnddrop", (event, dropTarget, _) => {
            if (dropTarget._private.data) {
                this.props.onRoleToGroupAddition(event.target._private.data.label, dropTarget._private.data.label)
            }
        })
        // @ts-ignore
        this.cy.on("cdndout", (event, dropTarget, _) => {
            this.props.onRoleFromGroupRemove(event.target._private.data.label, dropTarget._private.data.label)
        })
    }

    render() {
        return (
            <div id="cy" className="diagram h-100">
                <CytoscapeComponent
                    className="diagram-component h-100"
                    layout={ { name: "random", zoom: 1 } }
                    cy={(cy) => { this.cy = cy }}
                    elements={this.props.elements.flatMap(e => this.presentation(e))}
                    // @ts-ignore
                    stylesheet={nodesStyle}
                />
            </div>
        );
    }
}

export default Diagram
