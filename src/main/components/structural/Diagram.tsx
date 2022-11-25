import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import {Component, Group} from "../../utils/structural/entities";
import {Core} from "cytoscape";
import * as nodesStyle from "../../style/cytoscape/style.json";
import {defined, fromSet} from "../../utils/structural/utils";
import {list, List, toArray} from "scala-types/dist/list/list";
import {config, presentation} from "../../utils/structural/cytoscape";
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
    private ehOptions = {
        canConnect: (source, target) =>
            (source._private.data && source._private.data.parent) ||
            (target._private.data && target._private.data.parent),
    }
    private cddOptions = {
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

    componentDidMount() {
        config(this.cy, this.ehOptions, this.cddOptions, this.props)
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
