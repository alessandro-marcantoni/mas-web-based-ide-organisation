import { fromArray, List } from "scala-types/dist/list/list"
import { Component, XMLElement } from "../../domain/commons"
import convert from "xml-js"
import { Argument, Goal, PlanOperator } from "../../domain/functional"
import { option } from "../../utils/utils"
import { OR_TOKEN } from '../serialization/functional';

const dependencyGraph = new Map<Goal, Set<string>>()
const missions = new Map<string, Set<string>>()

export const loadFunctionalSpec: (spec: string) => List<Component> = spec => {
    const orgSpec = convert.xml2js(spec).elements[1].elements
    converter[orgSpec[1].name](orgSpec[1])[0]
    converter[orgSpec[2].name](orgSpec[2])
    dependencyGraph.forEach((v, k) => k.dependencies = v)
    return fromArray(Array.from(dependencyGraph.keys())).filter(g => g.name !== "orgGoal")
}

export const loadFunctionalFromFile: (path: string) => Promise<List<Component>> = async path => {
    return loadFunctionalSpec(await (await fetch(path)).text())
}

const functionalSpecification = (element: XMLElement) => element.elements.map(e => converter[e.name](e))

const scheme = (element: XMLElement) => {
    element.elements.filter(e => e.name === "goal").forEach(goal)
    element.elements.filter(e => e.name === "mission").forEach(mission)
}

const goal = (element: XMLElement) => {
    if ((element.attributes["id"] as string).includes(OR_TOKEN)) {
        const g = getKey((element.attributes["id"] as string).replace(OR_TOKEN, ""))
        dependencyGraph.set(g, dependencyGraph.get(g) ?? new Set<string>())
        element.elements[0].elements.forEach(e => dependsOn(e.attributes["id"], g))
        g.operator = PlanOperator.OR
        return
    }
    const g = getKey(element.attributes["id"])
    dependencyGraph.set(g, dependencyGraph.get(g) ?? new Set<string>())
    if (element.elements) {
        element.elements
            .filter(e => e.name === "depends-on")
            .forEach(e => dependsOn(e.attributes["goal"], g))
        fromArray(element.elements.filter(e => e.name === "argument").map(argument)).foreach(g.addArgument)
        fromArray(element.elements.filter(e => e.name === "plan")).foreach(p => plan(p, g))
        g.operator = getPlans(element).length > 0 ? op(getPlans(element)[0].attributes["operator"]) : PlanOperator.AND
    }
}

const argument = (element: XMLElement) => new Argument(element.attributes["id"], option(element.attributes["value"]))

const dependsOn = (dependee: string, depender: Goal) => {
    if (!dependee.includes(OR_TOKEN)) {
        dependencyGraph.get(depender)
            ? dependencyGraph.get(depender).add(dependee)
            : dependencyGraph.set(depender, new Set([dependee]))
    }
}

const plan = (element: XMLElement, root: Goal) => {
    const goals = element.elements.filter(e => e.name === "goal")
    if (element.attributes["operator"] === "choice") {
        root.operator = PlanOperator.OR
    }
    if (element.attributes["operator"] === "sequence") {
        goals
            .slice(0, goals.length - 1)
            .map((g, i) => [g, goals[i + 1]])
            .forEach(([g1, g2]) => dependsOn(g1.attributes["id"], getKey(g2.attributes["id"])))
    }
    goals.forEach(goal)
    goals.forEach(g => dependsOn(g.attributes["id"], root))
}

const mission = (element: XMLElement) => {
    missions.set(element.attributes["id"], new Set<string>())
    element.elements.filter(e => e.name === "goal").forEach(e => missions.get(element.attributes["id"]).add(e.attributes["id"]))
}

const normativeSpecification = (element: XMLElement) =>
    element.elements.filter(e => e.name === "norm").forEach(norm)

const norm = (element: XMLElement) =>
    missions.get(element.attributes["mission"])?.forEach(g => {
        const goal = getKey(g)
        goal.responsibles.set(element.attributes["role"], element.attributes["type"])
    })

const getKey: (goalName: string) => Goal =
    (goalName) => Array.from(dependencyGraph.keys()).find(g => g.getName() === goalName) ?? new Goal(goalName)

const converter = {
    "functional-specification": functionalSpecification,
    "scheme": scheme,
    "goal": goal,
    "argument": argument,
    "depends-on": dependsOn,
    "normative-specification": normativeSpecification
}

const getPlans = (element: XMLElement) => element.elements.filter(e => e.name === "plan")

const op = (op: string) => (op === "parallel" || op === "sequence" ? PlanOperator.AND : PlanOperator.OR)
