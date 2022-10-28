import React from "react";
import {Role} from "../../types";

type SidebarProps = {
    roles: Array<Role>
    role: string
    group: string
    addComponent: (c: string) => void
    propertyChanged: (p: string, v: string) => void
}

const Sidebar = (p: SidebarProps) => {
    return (<div className="sidebar">
        { p.roles.map(r => <div key={r.name}>{r.name}</div>) }
        <input type="text" value={p.role} onChange={(e) => p.propertyChanged("role", e.target.value)}/>
        <button onClick={() => p.addComponent("role")}>Create role</button>
        <input type="text" value={p.group} onChange={(e) => p.propertyChanged("group", e.target.value)}/>
        <button onClick={() => p.addComponent("group")}>Create group</button>
    </div>)
}

export default Sidebar;
