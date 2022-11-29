import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import {Component} from "../../utils/structural/entities";
import {Core} from "cytoscape";
import * as nodesStyle from "../../style/cytoscape/style.json";
import {List, toArray} from "scala-types/dist/list/list";
import {cddOptions, config, ehOptions, presentation} from "../../utils/structural/cytoscape";
import {Toolbar} from "@mui/material";

export type DiagramProps = {
    elements: List<Component>
    onLinkCreation: (from: string, to: string) => void
    onAdditionToGroup: (r: string, t: string, g: string) => void
    onRemoveFromGroup: (r: string, t: string, g: string) => void
    onSelectedComponent: (t: string, c: string) => void
}

class Diagram extends React.Component<DiagramProps, unknown> {
    private cy: Core

    componentDidMount() {
        config(this.cy, ehOptions(), cddOptions(this.props), this.props)
    }

    render() {
        return (
            <>
                <Toolbar/>
                <div id="cy" className="diagram">
                    <CytoscapeComponent
                        className="diagram-component"
                        layout={ { name: "breadthfirst", zoom: 1 } }
                        cy={(cy) => { this.cy = cy }}
                        elements={toArray(this.props.elements.flatMap(e => presentation(e, this.props.elements)))}
                        // @ts-ignore
                        stylesheet={nodesStyle}
                    />
                </div>
            </>
        );
    }
}

export default Diagram
