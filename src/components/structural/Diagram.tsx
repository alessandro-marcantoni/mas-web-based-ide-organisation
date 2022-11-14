import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import {Compatibility, Component, Constraint, Group, Link, Role} from "../../utils/types";
import {Core, ElementDefinition} from "cytoscape";
import cytoscape from "cytoscape";
import edgehandles from 'cytoscape-edgehandles';
import noOverlap from 'cytoscape-no-overlap';
import compoundDragAndDrop from 'cytoscape-compound-drag-and-drop';
import * as nodesStyle from "../../style/cytoscape/style.json";
import {separatorRegex} from "../../utils/utils";

type DiagramProps = {
    elements: Array<Component>
    link: {
        from: string,
        to: string,
    }
    onLinkCreation: (from: string, to: string) => void
    onPropertyChange: (p: string, v: string) => void
    onAdditionToGroup: (r: string, t: string, g: string) => void
    onRemoveFromGroup: (r: string, t: string, g: string) => void
    onSelectedComponent: (t: string, c: string) => void
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
                return [{ data: { id: r.name, label: r.name.replace(separatorRegex, ""), role: true, parent: group } }]
            case "group":
                const g = c as Group
                return [
                    { data: { id: g.name, label: g.name.replace(separatorRegex, ""), group: true, parent: group } },
                    ...Array.from(g.roles).flatMap(e => this.presentation(e, g.name)),
                    ...Array.from(g.subgroups).filter(s => s && s.name !== g.name).flatMap(e => this.presentation(e, g.name)),
                    ...Array.from(g.links).flatMap(l => this.presentation(l)),
                    ...Array.from(g.constraints).flatMap(con => this.presentation(con))
                ]
            case "link":
                const l = c as Link
                return [{ data: { id: `${l.from}${l.to}${l.label}`, source: l.from, target: l.to, label: l.label, link: true, arrow: "triangle" } }]
            case "constraint":
                const con = c as Constraint
                switch (con.constraint) {
                    case "compatibility":
                        const com = con  as Compatibility
                        return [{ data: { id: `${com.from}${com.to}${com.constraint}`, source: com.from, target: com.to, label: com.constraint, link: true, arrow: "triangle" } }]
                    default:
                        return []
                }
            default:
                return []
        }
    }

    componentDidMount() {
        cytoscape.use(edgehandles)
        cytoscape.use(compoundDragAndDrop)
        cytoscape.use(noOverlap)
        // @ts-ignore
        this.cy.nodes().noOverlap({ padding: 5 });
        const defaults = {
            canConnect: () => true,
        };
        const options = {
            grabbedNode: node =>
                !this.props.elements
                    .filter(e => e)
                    .filter(e => e.type === "group")
                    .map(e => e as Group)
                    .flatMap(g => Array.from(g.subgroups))
                    .map(g => g.name)
                    .includes(node._private.data.parent),
            dropTarget: node => node._private.data.group,
            dropSibling: () => true,
            newParentNode: (grabbedNode, dropSibling) => dropSibling,
            overThreshold: 1,
            outThreshold: 50
        }
        //@ts-ignore
        const eh = this.cy.edgehandles(defaults)
        //@ts-ignore
        this.cy.compoundDragAndDrop(options);
        this.cy.center()
        this.cy.on("free", (e) => {
            //console.log(e.target._private.position)
        })
        this.cy.on("add", () => {
            this.cy.layout({ name: "circle" }).run()
            this.cy.center()
        })
        this.cy.on("cxttap", (e) => {
            eh.start(e.target)
        })
        // @ts-ignore
        this.cy.on("ehcomplete", (ev, s, t, e) => {
            this.props.onLinkCreation(s._private.data.id, t._private.data.id)
            this.cy.remove(e)
        })
        // @ts-ignore
        this.cy.on("cdnddrop", (event, dropTarget, _) => {
            if (dropTarget._private.data) {
                this.props.onAdditionToGroup(event.target._private.data.id, event.target._private.data.group ? "group" : "role", dropTarget._private.data.id)
            }
        })
        // @ts-ignore
        this.cy.on("cdndout", (event, dropTarget, _) => {
            this.props.onRemoveFromGroup(event.target._private.data.id, event.target._private.data.group ? "group" : "role", dropTarget._private.data.id)
        })
        this.cy.on("click", (e) => {
            if (e.target._private.data.id) {
                this.props.onSelectedComponent(e.target._private.data.group ? "group" : "role", e.target._private.data.id)
            }
        })
    }

    render() {
        return (
            <div id="cy" className="diagram h-100">
                <CytoscapeComponent
                    className="diagram-component h-100"
                    layout={ { name: "cose", zoom: 1 } }
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
