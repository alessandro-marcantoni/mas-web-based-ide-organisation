import {Cardinality, Compatibility, Component, Constraint, Group, Link, Role} from "./types";
import {getAllRoles, getGlobalGroups, option, separatorRegex} from "./utils";

export const serialize: (components: Array<Component>, diagram: Array<Component>) => string = (components, diagram) =>
    "<structural-specification>" +
        "<role-definitions>" +
            getAllRoles(components).map(role).join("\n") +
        "</role-definitions>" + "\n" +
        getGlobalGroups(diagram).map(group).join("\n") +
    "</structural-specification>"

export const role: (role: Role) => string = (role) =>
    `<role id="${role.name}">${option(role.extends).map(e => ` <extends role="${e.name}"/> `).getOrElse("")}</role>`

export const group: (group: Group) => string = (group) =>
    `<group-specification id="${shortName(group.name)}" ${group.min === 0 ? "" : `min="${group.min}"`} ${group.max === Number.MAX_VALUE ? "" : `max="${group.max}"`}>${Object.entries(groupElements).map(e => group[e[0]].size > 0 ? e[1](group[e[0]]) : "").join("\n")}</group-specification>`

export const roles: (roles: Set<Role>) => string = (roles) =>
    "<roles>\n" +
    Array.from(roles).map(r => `<role id="${shortName(r.name)}" ${r.min === 0 ? "" : `min="${r.min}"`} ${r.max === Number.MAX_VALUE ? "" : `max="${r.max}"`}/>`).join("\n") +
    "</roles>"

export const links: (links: Set<Link>) => string = (links) =>
    "<links>\n" +
    Array.from(links).map(l =>
        `<link from="${shortName(l.from)}" to="${shortName(l.to)}" type="${l.label}" scope="${l.scope}" extends-subgroups="${l.extendsSubgroups}" bi-dir="${l.biDir}"/>`).join("\n") +
    "</links>"

export const subgroups: (subgroups: Set<Group>) => string = (subgroups) =>
    "<subgroups>\n" +
    Array.from(subgroups).map(group).join("\n") +
    "</subgroups>"

export const constraints: (constraints: Set<Constraint>) => string = (constraints) =>
    "<formation-constraints>\n" +
    Array.from(constraints).map(constraint).join("\n") +
    "</formation-constraints>"

export const constraint: (constraint: Constraint) => string = (constraint) => {
    switch (constraint.constraint) {
        case "cardinality":
            const ca = constraint as Cardinality
            return `<cardinality ${ca.min === 0 ? "" : `min="${ca.min}"`} ${ca.max === Number.MAX_VALUE ? "" : `max="${ca.max}"`} object="${ca.object}" id="${ca.id}"/>`
        case "compatibility":
            const co = constraint as Compatibility
            return `<compatibility from="${co.from}" to="${co.to}" type="${co.type}" scope="${co.scope}" extends-subgroups="${co.extendsSubgroups}" bi-dir="${co.biDir}"/>`
        default:
            return ""
    }
}

const groupElements = {
    roles: roles,
    links: links,
    subgroups: subgroups,
    constraints: constraints,
}

function shortName(longName: string, regex: RegExp = separatorRegex): string {
    return longName.replace(regex, "")
}
