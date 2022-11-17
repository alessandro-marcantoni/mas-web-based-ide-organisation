import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import {Component, Group} from "../../utils/structural/entities";
import {Core} from "cytoscape";
import cytoscape from "cytoscape";
import edgehandles from 'cytoscape-edgehandles';
import compoundDragAndDrop from 'cytoscape-compound-drag-and-drop';
import * as nodesStyle from "../../style/cytoscape/style.json";
import {defined, fromSet} from "../../utils/structural/utils";
import {list, List, toArray} from "scala-types/dist/list/list";
import {presentation} from "../../utils/structural/cytoscape";

type DiagramProps = {
    elements: List<Component>
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

class Diagram extends React.Component<DiagramProps, unknown> {
    private cy: Core

    componentDidMount() {
        cytoscape.use(edgehandles)
        cytoscape.use(compoundDragAndDrop)
        const defaults = {
            canConnect: () => true,
        };
        const options = {
            grabbedNode: node =>
                !defined(this.props.elements)
                    .collect(list(e => e.type === "group"), list(e => e as Group))
                    .flatMap(g => fromSet(g.subgroups))
                    .map(g => g.name)
                    .contains(node._private.data.parent),
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
        this.cy.on("free", () => {
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
        this.cy.on("cdnddrop", (event, dropTarget) => {
            if (dropTarget._private.data) {
                this.props.onAdditionToGroup(event.target._private.data.id, event.target._private.data.group ? "group" : "role", dropTarget._private.data.id)
            }
        })
        // @ts-ignore
        this.cy.on("cdndout", (event, dropTarget) => {
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
                    elements={toArray(this.props.elements.flatMap(e => presentation(e)))}
                    // @ts-ignore
                    stylesheet={nodesStyle}
                />
            </div>
        );
    }
}

export default Diagram
