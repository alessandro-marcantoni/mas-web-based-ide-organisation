import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import {Component, Link, Role} from "../../types";
import {Core, ElementDefinition} from "cytoscape";

type DiagramProps = {
    elements: Array<Component>
}

class Diagram extends React.Component<DiagramProps, {}> {
    private cy: Core

    presentation(c: Component): ElementDefinition {
        if (c instanceof Role) {
            return { data: { id: c.name, label: c.name }}
        }
        if (c instanceof Link) {
            return { data: { source: c.from.name, target: c.to.name, label: c.label} }
        }
        return { data: { label: "" }}
    }

    componentDidMount() {
        this.cy.on("free", (e) => {
            console.log(e.target._private.position)
        })
    }

    render() {
        const elements = [
            { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
            { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
            { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
        ];

        return (
            <div id="cy" className="diagram">
                <CytoscapeComponent layout={ { name: "random" } } cy={(cy) => { this.cy = cy }} elements={this.props.elements.map(this.presentation)} style={ { width: "100%", height: "100%" } }/>
            </div>
        );
    }
}

export default Diagram;
