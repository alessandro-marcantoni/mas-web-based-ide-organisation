import { Compatibility, ConcreteRole, Constraint, Group, RoleType } from '../../domain/structural';
import { list, List } from "scala-types/dist/list/list"
import { Core, ElementDefinition } from "cytoscape"
import { fromSet, getAllRoles, separatorRegex, shortName } from "../utils"
import { DiagramProps } from "../../../react/components/common/Diagram"
import { SelectedComponentEvent } from "../../domain/events/structural"
import { Component } from "../../domain/commons"

/**
 * Convert a {@link Component} into an {@link ElementDefinition} to be displayed in cytoscape.
 * @param c The {@link Component} to convert.
 * @param cs The {@link Component}s.
 * @param group The name of the {@link Group} the {@link Component} is inside, if any.
 * @returns The corresponding {@link ElementDefinition} representation.
 */
export function presentation(
    c: Component,
    cs: List<Component>,
    group: string | undefined = undefined
): List<ElementDefinition> {
    if (!c) return list()
    switch (c.type) {
        case "role":
            const r = c as ConcreteRole
            console.log(r)
            return list(role(r, group)).appendedAll(
                // @ts-ignore
                !r.extends
                    ? list()
                    : getAllRoles(cs)
                          .filter(rc => shortName(rc.name) === r.extends)
                          .map(rc => extensionLink(r.name, rc.name))
            )
        case "group":
            const g = c as Group
            return list<ElementDefinition>({
                data: { id: g.name, label: g.name.replace(separatorRegex, ""), componentType: "group", parent: group },
            })
                .appendedAll(fromSet(g.roles).flatMap(e => presentation(e, cs, g.name)))
                .appendedAll(
                    fromSet(g.subgroups)
                        .filter(s => s && s.name !== g.name)
                        .flatMap(e => presentation(e, cs, g.name))
                )
                .appendedAll(fromSet(g.constraints).flatMap(con => presentation(con, cs)))
        case "constraint":
            const con = c as Constraint
            switch (con.constraint) {
                case "compatibility":
                    const com = con as Compatibility
                    return list(compatibilityLink(com))
                default:
                    return list()
            }
        default:
            return list()
    }
}

export const config: (
    cy: Core,
    props: DiagramProps
) => void = (cy, props) => {
    cy.center()

    const handlers = {
        add: () => {
            cy.center()
        },
        tap: e => {
            if (e.target._private.data.id) {
                props.onDiagramEvent(
                    new SelectedComponentEvent(
                        e.target._private.data.id,
                        e.target._private.data.componentType
                    )
                )
            }
        },
    }

    // @ts-ignore
    Object.entries(handlers).forEach(([e, h]) => cy.on(e, h))
}

const extensionLink = (extender: string, extended: string) => {
    return {
        data: {
            id: `${extender}extends${extended}`,
            source: extender,
            target: extended,
            label: "extends",
            componentType: "link",
            arrow: "extends",
        },
    }
}

const compatibilityLink = (com: Compatibility) => {
    return {
        data: {
            id: `${com.from}${com.to}${com.constraint}`,
            source: com.from,
            target: com.to,
            label: com.constraint,
            componentType: "link",
            arrow: "compatibility",
            biDir: com.biDir,
        },
    }
}

const role = (role: ConcreteRole, group: string | undefined) => {
    console.log({
        id: role.name,
        label:
            role.name.replace(separatorRegex, "") +
            (group ? ` <${role.min},${role.max === Number.MAX_VALUE ? "Inf" : role.max}>` : ""),
        componentType: "role",
        parent: group,
        roleType: RoleType.ABSTRACT,
    });
    
    return {
        data: {
            id: role.name,
            label:
                role.name.replace(separatorRegex, "") +
                (group ? ` <${role.min},${role.max === Number.MAX_VALUE ? "Inf" : role.max}>` : ""),
            componentType: "role",
            parent: group,
            roleType: role.roleType,
        },
    }
}
