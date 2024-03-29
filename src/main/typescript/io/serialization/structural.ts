import { Cardinality, Compatibility, ConcreteRole, Constraint, Group, Role } from "../../domain/structural"
import { getAllRoles, getGlobalGroups, option, shortName } from "../../utils/utils"
import { List, toArray } from "scala-types/dist/list/list"
import { Component } from "../../domain/commons"
import { formatXml } from "./common"

export const serializeStructural: (diagram: List<Component>) => string = diagram =>
    formatXml(
        "<structural-specification>" +
            "<role-definitions>" +
            toArray(
                getAllRoles(diagram)
                    .distinctBy(r => shortName(r.name))
                    .map(role)
            ).join("\n") +
            "</role-definitions>" +
            "\n" +
            toArray(getGlobalGroups(diagram).map(group)).join("\n") +
            "</structural-specification>"
    )

export const role: (role: Role) => string = role =>
    `<role id="role_${shortName(role.name)}">${option(role.extends)
        .map(e => ` <extends role="role_${e}"/> `)
        .getOrElse("")}</role>`

export const group: (group: Group) => string = group =>
    `<group-specification id="${shortName(group.name)}" ${group.min === 0 ? "" : `min="${group.min}"`} ${
        group.max === Number.MAX_VALUE ? "" : `max="${group.max}"`
    }>${Object.entries(groupElements)
        .map(e => (group[e[0]].size > 0 ? e[1](group[e[0]]) : ""))
        .join("\n")}</group-specification>`

export const roles: (roles: Set<ConcreteRole>) => string = roles =>
    "<roles>\n" +
    Array.from(roles)
        .map(
            r =>
                `<role id="role_${shortName(r.name)}" ${r.min === 0 ? "" : `min="${r.min}"`} ${
                    r.max === Number.MAX_VALUE ? "" : `max="${r.max}"`
                }/>`
        )
        .join("\n") +
    "</roles>"

export const subgroups: (subgroups: Set<Group>) => string = subgroups =>
    "<subgroups>\n" + Array.from(subgroups).map(group).join("\n") + "</subgroups>"

export const constraints: (constraints: Set<Constraint>) => string = constraints =>
    "<formation-constraints>\n" + Array.from(constraints).map(constraint).join("\n") + "</formation-constraints>"

export const constraint: (constraint: Constraint) => string = constraint => {
    switch (constraint.constraint) {
        case "cardinality":
            const ca = constraint as Cardinality
            return `<cardinality ${ca.min === 0 ? "" : `min="${ca.min}"`} ${
                ca.max === Number.MAX_VALUE ? "" : `max="${ca.max}"`
            } object="${ca.object}" id="${ca.object === "role" ? "role_" : ""}${shortName(ca.id)}"/>`
        case "compatibility":
            const co = constraint as Compatibility
            return `<compatibility from="role_${shortName(co.from)}" to="role_${shortName(co.to)}" type="${
                co.constraint
            }" scope="${co.scope}" extends-subgroups="${co.extendsSubgroups}" bi-dir="${co.biDir}"/>`
        default:
            return ""
    }
}

const groupElements = {
    roles: roles,
    subgroups: subgroups,
    constraints: constraints,
}
