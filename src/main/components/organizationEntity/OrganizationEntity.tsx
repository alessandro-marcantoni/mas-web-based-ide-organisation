import React from "react";
import Diagram from "../common/Diagram";
import { cddOptions, config, ehOptions, presentation } from "../../utils/structural/cytoscape";
import { list } from "scala-types";
import { DiagramEvent } from '../../utils/commons';

type EntityState = {
    hello: string
}

class Entity extends React.Component<unknown, EntityState> {
    constructor(props) {
        super(props)
        this.onDiagramEvent = this.onDiagramEvent.bind(this)
    }

    onDiagramEvent(event: DiagramEvent): void {
        console.log(event)
    }

    render() {
        return (
            <Diagram 
                configuration={(cy, props) => config(cy, ehOptions(), cddOptions(props), props)}
                elements={list()}
                onDiagramEvent={this.onDiagramEvent}
                presentation={presentation}/>
        )
    }
}

export default Entity