import React from "react"
import { list } from "scala-types"
import { List } from "scala-types/dist/list/list"
import { Component, DiagramEvent, DiagramEventType } from "../../utils/commons"
import { GoalCreationEvent } from "../../utils/functional/events"
import { presentation } from "../../utils/functional/cytoscape"
import Diagram from "../Diagram"
import Sidebar from "./Sidebar"
import { cddOptions, config, ehOptions } from "../../utils/structural/cytoscape"

type FunctionalState = {
    components: List<Component>
}

class Functional extends React.Component<unknown, FunctionalState> {
    constructor(props) {
        super(props)
        this.state = {
            components: list<Component>(),
        }
        this.onDiagramEvent = this.onDiagramEvent.bind(this)
        this.onPropertyChange = this.onPropertyChange.bind(this)
    }

    onDiagramEvent(event: DiagramEvent): void {
        switch (event.type) {
            case DiagramEventType.GoalCreation:
                const gce = event as GoalCreationEvent
                console.log(gce)
                break
        }
    }

    onPropertyChange(property: string, value: unknown): void {
        this.setState(state => {
            return {
                components: state.components,
                [property]: value,
            }
        })
    }

    render() {
        return (
            <>
                <Sidebar
                    components={this.state.components}
                    onEvent={this.onDiagramEvent}
                    onPropertyChange={this.onPropertyChange}
                />
                <Diagram
                    configuration={(cy, props) => config(cy, ehOptions(), cddOptions(props), props)}
                    elements={this.state.components}
                    onDiagramEvent={this.onDiagramEvent}
                    presentation={presentation}
                />
            </>
        )
    }
}

export default Functional
