import {Compatibility, Component, Constraint, Group, Link, Role} from "./types";
import {list, List} from "scala-types/dist/list/list";
import {ElementDefinition} from "cytoscape";
import {fromSet, separatorRegex} from "./utils";

export function presentation(c: Component, group: string | undefined = undefined): List<ElementDefinition> {
    if (!c) return list()
    switch(c.type) {
        case "role":
            const r = c as Role
            return list({ data: { id: r.name, label: r.name.replace(separatorRegex, ""), role: true, parent: group } })
        case "group":
            const g = c as Group
            return list<ElementDefinition>({ data: { id: g.name, label: g.name.replace(separatorRegex, ""), group: true, parent: group } })
                .appendedAll(fromSet(g.roles).flatMap(e => presentation(e, g.name)))
                .appendedAll(fromSet(g.subgroups).filter(s => s && s.name !== g.name).flatMap(e => presentation(e, g.name)))
                .appendedAll(fromSet(g.links).flatMap(l => presentation(l)))
                .appendedAll(fromSet(g.constraints).flatMap(con => presentation(con)))
        case "link":
            const l = c as Link
            return list({ data: { id: `${l.from}${l.to}${l.label}`, source: l.from, target: l.to, label: l.label, link: true, arrow: "triangle" } })
        case "constraint":
            const con = c as Constraint
            switch (con.constraint) {
                case "compatibility":
                    const com = con  as Compatibility
                    return list({ data: { id: `${com.from}${com.to}${com.constraint}`, source: com.from, target: com.to, label: com.constraint, link: true, arrow: "triangle" } })
                default:
                    return list()
            }
        default:
            return list()
    }
}
