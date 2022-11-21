import {Cardinality, Compatibility, Component, Group, Link, Role} from "./entities";
import convert from 'xml-js';
import {getAllGroups, getLinks, option, separate, separator, separatorRegex} from "./utils";
import {fromArray, List, list} from "scala-types/dist/list/list";

export const loadSpec: (path: string) => Promise<List<List<Component>>> = async (path) => {
    const orgSpec = convert.xml2js(await (await fetch(path)).text()).elements[1].elements
    const elems = converter[orgSpec[0].name](orgSpec[0])
    return list(
        list(elems[1]).appendedAll(
            fromArray<Role>(elems[0]).filter(e =>
                getLinks(list(elems[1]))
                    .map(c => c.from)
                    .contains(e.name.replace(separatorRegex, "")) ||
                getLinks(list(elems[1]))
                    .map(c => c.to)
                    .contains(e.name.replace(separatorRegex, "")))
        ),
        fromArray<Component>(elems[0]).appendedAll(getAllGroups(list(elems[1])).map(g => new Group(g.name, g.min, g.max)))
    )
}

const structuralSpecification = (element: XMLElement) =>
    element.elements.map(e => converter[e.name](e))

const roleDefinitions = (element: XMLElement) =>
    element.elements.map(e => converter[e.name](e))

const role = (element: XMLElement, g: Group = undefined) =>
    new Role(
        `${option(g).map(o => o.name + separator).getOrElse("")}${element.attributes["id"]}`,
        option(element.elements).map(e => new Role(e[0].attributes.role, null)).getOrElse(null),
        option(element.attributes["min"]).getOrElse(0),
        option(element.attributes["max"]).getOrElse(Number.MAX_VALUE)
    )

const groupSpecification = (element: XMLElement) => {
    const g = new Group(
        element.attributes["id"],
        option(element.attributes["min"]).getOrElse(0),
        option(element.attributes["max"]).getOrElse(Number.MAX_VALUE)
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

const roles = (element: XMLElement, g: Group) =>
    element.elements
        .map(e => converter[e.name](e, g))
        .forEach(r => g.addRole(r))

const links = (element: XMLElement, g: Group) =>
    element.elements
        .map(e => converter[e.name](e, g))
        .forEach(l => g.addLink(l))

const link = (element: XMLElement, g: Group) =>
    new Link(
        element.attributes["type"],
        separate(g.name)(element.attributes["from"]),
        separate(g.name)(element.attributes["to"]),
        option(element.attributes["scope"]).getOrElse("intra-group"),
        option(element.attributes["extends-subgroups"]).getOrElse(false),
        option(element.attributes["bi-dir"]).getOrElse(false),
    )

const subgroups = (element: XMLElement, g: Group) =>
    element.elements
        .map(e => converter[e.name](e))
        .forEach(s => g.addSubgroup(s))

const formationConstraints = (element: XMLElement, g: Group) => {
    return element.elements
        .map(e => converter[e.name](e, g))
        .forEach(c => g.addConstraint(c))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cardinality = (element: XMLElement, _: Group) =>
    new Cardinality(
        element.attributes["id"],
        element.attributes["object"],
        option(element.attributes["min"]).getOrElse(0),
        option(element.attributes["max"]).getOrElse(Number.MAX_VALUE)
    )

const compatibility = (element: XMLElement, g: Group) =>
    new Compatibility(
        separate(g.name)(element.attributes["from"]),
        separate(g.name)(element.attributes["to"]),
        option(element.attributes["scope"]).getOrElse("intra-group"),
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

interface XMLElement {
    elements: Array<XMLElement>
    attributes: Array<Record<string, unknown>>
    name: string
}
