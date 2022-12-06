import React from "react"
import CytoscapeComponent from "react-cytoscapejs"
import { Component } from "../../utils/commons"
import { Core, ElementDefinition } from "cytoscape"
import * as nodesStyle from "../../style/cytoscape/style.json"
import { List, toArray } from "scala-types/dist/list/list"
import { Toolbar } from "@mui/material"
import { DiagramEventHandler } from "../../utils/commons"

export type DiagramProps = {
    elements: List<Component>
    onDiagramEvent: DiagramEventHandler
    presentation: (c: Component, cs: List<Component>, options?: string | undefined) => List<ElementDefinition>
    configuration: (cy: Core, p: DiagramProps) => void
}

class Diagram extends React.Component<DiagramProps, unknown> {
    private cy: Core

    componentDidMount() {
        this.props.configuration(this.cy, this.props)
    }

    render() {
        return (
            <>
                <Toolbar />
                <div id="cy" className="diagram">
                    <CytoscapeComponent
                        className="diagram-component"
                        layout={{ name: "breadthfirst", zoom: 1 }}
                        cy={cy => {
                            this.cy = cy
                        }}
                        elements={toArray(
                            this.props.elements.flatMap(e => this.props.presentation(e, this.props.elements))
                        )}
                        // @ts-ignore
                        stylesheet={nodesStyle}
                    />
                </div>
            </>
        )
    }
}

export default Diagram
