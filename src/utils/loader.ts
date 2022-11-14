import {Cardinality, Compatibility, Component, Group, Link, Role} from "./types";
import convert from 'xml-js';
import {none, Option, some} from "scala-types/dist/option/option";
import {getAllGroups, getLinks, option, separator, separatorRegex} from "./utils";

export const loadSpec: (path: string) => Promise<Array<Array<Component>>> = async (path) => {
    const orgSpec = convert.xml2js(await (await fetch(path)).text()).elements[1].elements
    const elems = converter[orgSpec[0].name](orgSpec[0])
    return [[elems[1]].concat(
        (elems[0] as unknown as Array<Role>)
            .filter(e =>
                getLinks([elems[1]])
                    .map(c => c.from)
                    .includes(e.name.replace(separatorRegex, "")) ||
                getLinks([elems[1]])
                    .map(c => c.to)
                    .includes(e.name.replace(separatorRegex, "")))),
        elems[0].concat(getAllGroups([elems[1]]).map(g => new Group(g.name, g.min, g.max)))]
}

const structuralSpecification = (element: any) =>
    element.elements.map(e => converter[e.name](e))

const roleDefinitions = (element: any) =>
    element.elements.map(e => converter[e.name](e))

const role = (element: any, g: Group = undefined) =>
    new Role(
        `${option(g).map(o => o.name + separator).getOrElse("")}${element.attributes.id}`,
        option(element.elements).map(e => new Role(e[0].attributes.role, null)).getOrElse(null),
        option(element.attributes.min).getOrElse(0),
        option(element.attributes.max).getOrElse(Number.MAX_VALUE)
    )

const groupSpecification = (element: any) => {
    const g = new Group(
        element.attributes.id,
        option(element.attributes.min).getOrElse(0),
        option(element.attributes.max).getOrElse(Number.MAX_VALUE)
    )
    element.elements.forEach(e => converter[e.name](e, g))
    g.links.forEach(l => {
        if (!Array.from(g.roles).map(r => r.name).includes(l.from)) {
            l.from = l.from.replace(separatorRegex, "")
        }
        if (!Array.from(g.roles).map(r => r.name).includes(l.to)) {
            l.to = l.to.replace(separatorRegex, "")
        }
    })
    return g
}

const roles = (element: any, g: Group) =>
    element.elements
        .map(e => converter[e.name](e, g))
        .forEach(r => g.addRole(r))

const links = (element: any, g: Group) =>
    element.elements
        .map(e => converter[e.name](e, g))
        .forEach(l => g.addLink(l))

const link = (element: any, g: Group) =>
    new Link(
        element.attributes.type,
        `${g.name}${separator}${element.attributes.from}`,
        `${g.name}${separator}${element.attributes.to}`,
        option(element.attributes.scope).getOrElse("intra-group"),
        option(element.attributes["extends-subgroups"]).getOrElse(false),
        option(element.attributes["bi-dir"]).getOrElse(false),
    )

const subgroups = (element: any, g: Group) =>
    element.elements
        .map(e => converter[e.name](e))
        .forEach(s => g.addSubgroup(s))

const formationConstraints = (element: any, g: Group) => {
    return element.elements
        .map(e => converter[e.name](e, g))
        .forEach(c => g.addConstraint(c))
}

const cardinality = (element: any, g: Group) =>
    new Cardinality(
        element.attributes.id,
        element.attributes.object,
        option(element.attributes.min).getOrElse(0),
        option(element.attributes.max).getOrElse(Number.MAX_VALUE)
    )

const compatibility = (element: any, g: Group) =>
    new Compatibility(
        `${g.name}${separator}${element.attributes.from}`,
        `${g.name}${separator}${element.attributes.to}`,
        option(element.attributes.scope).getOrElse("intra-group"),
        option(element.attributes["extends-subgroups"]).getOrElse(false),
        option(element.attributes["bi-dir"]).getOrElse(false)
    )

const converter = {
    "structural-specification": structuralSpecification,
    "role-definitions": roleDefinitions,
    "group-specification": groupSpecification,
    "role": role,
    "roles": roles,
    "links": links,
    "link": link,
    "subgroups": subgroups,
    "formation-constraints": formationConstraints,
    "cardinality": cardinality,
    "compatibility": compatibility,
}
