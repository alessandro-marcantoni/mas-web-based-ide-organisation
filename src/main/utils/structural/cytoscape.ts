import {Compatibility, Component, Constraint, Group, Role} from "./entities";
import {list, List} from "scala-types/dist/list/list";
import cytoscape, {Core, ElementDefinition} from "cytoscape";
import {fromSet, getAllRoles, separatorRegex, shortName} from "./utils";
import dblclick from "cytoscape-dblclick";
import edgehandles from "cytoscape-edgehandles";
import compoundDragAndDrop from "cytoscape-compound-drag-and-drop";
import {DiagramProps} from "../../components/structural/Diagram";

/**
 * Convert a {@link Component} into an {@link ElementDefinition} to be displayed in cytoscape.
 * @param c The {@link Component} to convert.
 * @param cs The {@link Component}s.
 * @param group The name of the {@link Group} the {@link Component} is inside, if any.
 * @returns The corresponding {@link ElementDefinition} representation.
 */
export function presentation(c: Component, cs: List<Component>, group: string | undefined = undefined): List<ElementDefinition> {
    if (!c) return list()
    switch(c.type) {
        case "role":
            const r = c as Role
            // @ts-ignore
            return list(role(r, group)).appendedAll(!r.extends ? list() :
                    getAllRoles(cs).filter(rc => shortName(rc.name) === r.extends.name)
                        .map(rc => extensionLink(r.name, rc.name)))
        case "group":
            const g = c as Group
            return list<ElementDefinition>({ data: { id: g.name, label: g.name.replace(separatorRegex, ""), group: true, parent: group } })
                .appendedAll(fromSet(g.roles).flatMap(e => presentation(e, cs, g.name)))
                .appendedAll(fromSet(g.subgroups).filter(s => s && s.name !== g.name).flatMap(e => presentation(e, cs, g.name)))
                .appendedAll(fromSet(g.constraints).flatMap(con => presentation(con, cs)))
        case "constraint":
            const con = c as Constraint
            switch (con.constraint) {
                case "compatibility":
                    const com = con  as Compatibility
                    return list(compatibilityLink(com))
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
            "add": () => { cy.layout({ name: "breadthfirst" }).run(); cy.center() },
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

const extensionLink = (extender: string, extended: string) => {
    return {
        data: {
            id: `${extender}extends${extended}`,
            source: extender, target: extended, label: "extends",
            link: true,
            arrow: "extends" }
    }
}

const compatibilityLink = (com: Compatibility) => {
    return {
        data: {
            id: `${com.from}${com.to}${com.constraint}`,
            source: com.from, target: com.to, label: com.constraint,
            link: true,
            arrow: "compatibility", biDir: com.biDir }
    }
}

const role = (role: Role, group: string | undefined) => {
    return {
        data: {
            id: role.name,
            label: role.name.replace(separatorRegex, "") + (group ? 
                ` <${role.min},${role.max === Number.MAX_VALUE ? "Inf" : role.max}>` : ""),
            role: true, parent: group 
        }
    }
}
