import React from "react";
import { DiagramEvent, Specification } from '../../../typescript/commons';
import axios from 'axios';
import config from "../../../typescript/config";
import { Toolbar } from "@mui/material";
import { List } from "scala-types/dist/list/list";

type EntityState = {
    specifications: List<Specification>
}

class Entity extends React.Component<unknown, EntityState> {
    constructor(props) {
        super(props)
        this.onDiagramEvent = this.onDiagramEvent.bind(this)
    }

    fetchSpecifications(): void {
        axios.get(config.BACKEND_URL + '/specifications').then(response => {
            this.setState({ specifications: response.data })
        })
    }

    onDiagramEvent(event: DiagramEvent): void {
        console.log(event)
    }

    render() {
        return (
            <>
                <Toolbar></Toolbar>
                <h1>Entity</h1>  
            </>
        )
    }
}

export default Entity