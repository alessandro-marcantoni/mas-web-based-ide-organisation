import React from "react";
import Sidebar from "./structural/Sidebar";
import Diagram from "./structural/Diagram";
import {Component, Link, Role} from "../types";

class Structural extends React.Component<{}, {}> {
    render() {
        const r1 = new Role("Role1", undefined)
        const r2 = new Role("Role2", undefined)

        const components: Array<Component> = [
            r1, r2, new Link("authority", r1, r2)
        ]

        return (
                <div className="body">
                    <Sidebar/>
                    <Diagram elements={components}/>
                </div>
        )
    }
}

export default Structural;
