import {Compatibility, Component, Constraint, Group, Link, Role} from "./entities";
import {list, List} from "scala-types/dist/list/list";
import cytoscape, {Core, ElementDefinition} from "cytoscape";
import {fromSet, separatorRegex} from "./utils";
import dblclick from "cytoscape-dblclick";
import edgehandles from "cytoscape-edgehandles";
import compoundDragAndDrop from "cytoscape-compound-drag-and-drop";
import {DiagramProps} from "../../components/structural/Diagram";

/**
 * Convert a {@link Component} into an {@link ElementDefinition} to be displayed in cytoscape.
 * @param c The {@link Component} to convert.
 * @param group The name of the {@link Group} the {@link Component} is inside, if any.
 * @returns The corresponding {@link ElementDefinition} representation.
 */
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

export const config: (cy: Core, ehOptions: Record<string, unknown>, cddOption: Record<string, unknown>, props: DiagramProps) => void =
    (cy, ehOptions, cddOption, props) => {
        cytoscape.use(edgehandles)
        cytoscape.use(compoundDragAndDrop)
        cytoscape.use(dblclick)
        //@ts-ignore
        const eh = cy.edgehandles(ehOptions)
        // @ts-ignore
        cy.compoundDragAndDrop(cddOption);
        cy.center()

        const handlers = {
            "ehcomplete": (ev, s, t, e) => {
                props.onLinkCreation(s._private.data.id, t._private.data.id)
                cy.remove(e)
            },
            "add": () => { cy.layout({ name: "circle" }).run(); cy.center() },
            "dblclick": (e) => eh.start(e.target),
            "cdnddrop": (event, dropTarget) => {
                if (dropTarget._private.data) {
                    props.onAdditionToGroup(event.target._private.data.id,
                        event.target._private.data.group ? "group" : "role",
                        dropTarget._private.data.id)
                }
            },
            "cdndout": (event, dropTarget) => props.onRemoveFromGroup(
                event.target._private.data.id,
                event.target._private.data.group ? "group" : "role",
                dropTarget._private.data.id),
            "cxttap": (e) => {
                if (e.target._private.data.id) {
                    props.onSelectedComponent(e.target._private.data.group ? "group" : "role", e.target._private.data.id)
                }
            }
        }

        // @ts-ignore
        Object.entries(handlers).forEach(([e, h]) => cy.on(e, h))
    }
