import { Cardinality, Compatibility, ConcreteRole, Group, Role, AbstractRole } from "../../domain/structural"
import convert from "xml-js"
import { getAllRoles, option, separate, separator, shortName } from "../../utils/utils"
import { fromArray, List, list } from "scala-types/dist/list/list"
import { Component, XMLElement } from "../../domain/commons"

let roleTopography: List<AbstractRole> = list()

export const loadStructuralSpec: (spec: string) => List<Component> = spec => {
    const orgSpec = convert.xml2js(spec).elements[1].elements
    const elems = converter[orgSpec[0].name](orgSpec[0])

    return list(elems[1])
        .appendedAll(
            fromArray<Role>(elems[0]).filter(
                r =>
                    !getAllRoles(list(elems[1]))
                        .map(ar => shortName(ar.name))
                        .contains(r.name)
            )
        )
        .appendedAll(
            roleTopography
                .filter(r => r.extends !== undefined)
                .map(r => r.extends)
                .distinctBy(r => r)
                .map(r => new AbstractRole(r, undefined))
        )
}

export const loadStructuralSpecFromFile: (path: string) => Promise<List<Component>> = async path =>
    loadStructuralSpec(await (await fetch(path)).text())

const structuralSpecification = (element: XMLElement) => element.elements.map(e => converter[e.name](e))

const roleDefinitions = (element: XMLElement) => {
    element.elements.forEach(e => abstractRole(e))
    return list()
}

const abstractRole = (element: XMLElement) =>
    (roleTopography = roleTopography.appended(
        new AbstractRole(
            element.attributes["id"],
            option(element.elements)
                .map(e => e[0].attributes.role)
                .getOrElse(undefined)
        )
    ))

const role = (element: XMLElement, g: Group = undefined) =>
    new ConcreteRole(
        `${option(g)
            .map(o => o.name + separator)
            .getOrElse("")}${element.attributes["id"]}`,
        roleTopography.find(rt => rt.name === element.attributes["id"]).map(rt => rt.extends).getOrElse(undefined),
        option(parseInt(element.attributes["min"])).getOrElse(0),
        option(parseInt(element.attributes["max"])).getOrElse(Number.MAX_VALUE)
    )

const groupSpecification = (element: XMLElement) => {
    const g = new Group(
        element.attributes["id"],
        option(element.attributes["min"]).getOrElse(0),
        option(element.attributes["max"]).getOrElse(Number.MAX_VALUE)
    )
    element.elements.forEach(e => converter[e.name](e, g))
    return g
}

const roles = (element: XMLElement, g: Group) =>
    element.elements
        .map(e => converter[e.name](e, g))
        .forEach(r => {
            console.log(r)

            g.addRole(r)
        })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const links = (element: XMLElement, g: Group) => []

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const link = (element: XMLElement, g: Group) => undefined

const subgroups = (element: XMLElement, g: Group) =>
    element.elements.map(e => converter[e.name](e)).forEach(s => g.addSubgroup(s))

const formationConstraints = (element: XMLElement, g: Group) => {
    return element.elements.map(e => converter[e.name](e, g)).forEach(c => g.addConstraint(c))
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
    role: role,
    roles: roles,
    links: links,
    link: link,
    subgroups: subgroups,
    "formation-constraints": formationConstraints,
    cardinality: cardinality,
    compatibility: compatibility,
}
