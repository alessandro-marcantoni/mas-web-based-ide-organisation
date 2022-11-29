import React from "react"
import { list } from "scala-types"
import { DiagramEvent } from "../../utils/commons"
import { presentation } from "../../utils/structural/cytoscape"
import Diagram from "../Diagram"

type FunctionalState = {
    hi: string
}

class Functional extends React.Component<unknown, FunctionalState> {
    constructor(props) {
        super(props)
        this.state = {
            hi: "hi",
        }
        this.onDiagramEvent = this.onDiagramEvent.bind(this)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onDiagramEvent(event: DiagramEvent): void {
        // event handlers  here
    }

    render() {
        return (
            <>
                <Diagram
                    configuration={(cy, props) => console.log(cy, props)}
                    elements={list()}
                    onDiagramEvent={this.onDiagramEvent}
                    presentation={presentation}
                />
            </>
        )
    }
}

export default Functional
