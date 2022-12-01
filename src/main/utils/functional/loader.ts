import { fromArray, List, toArray } from "scala-types/dist/list/list"
import { Component, XMLElement } from "../commons"
import convert from "xml-js"
import { Argument, Goal, PlanOperator } from "./entities"
import { fromSet, option } from "../structural/utils"
import { getAllGoals } from './utils';

const dependencyMap = new Map<string, Set<string>>()

export const loadFunctionalSpec: (path: string) => Promise<List<Component>> = async path => {
    const orgSpec = convert.xml2js(await (await fetch(path)).text()).elements[1].elements
    const elems = fromArray<Component>(converter[orgSpec[1].name](orgSpec[1])[0])
    dependencyMap.forEach((deps, goalName) => {
        getAllGoals(elems).find(g => g.getName() === goalName)
            .apply(g => g.dependsOn = new Set(toArray(fromSet(deps).map(d => getAllGoals(elems).find(g => g.getName() === d).get() as Goal))))
    })
    return elems
}

const functionalSpecification = (element: XMLElement) => element.elements.map(e => converter[e.name](e))

const scheme = (element: XMLElement) => element.elements.filter(e => e.name === "goal").map(goal)

const goal = (element: XMLElement) => {
    const g = Goal.named(element.attributes["id"])
    if (element.elements) {
        element.elements
            .filter(e => e.name === "depends-on")
            .forEach(e => dependsOn(e.attributes["goal"], element.attributes["id"]))
        return g
            .withArguments(fromArray(element.elements.filter(e => e.name === "argument").map(argument)))
            .withSubGoals(new Set(element.elements.filter(e => e.name === "plan").flatMap(plan)))
            .withOperator(
                getPlans(element).length > 0 ? op(getPlans(element)[0].attributes["operator"]) : PlanOperator.AND
            )
            .build()
    }
    return g.build()
}

const argument = (element: XMLElement) => new Argument(element.attributes["id"], option(element.attributes["value"]))

const dependsOn = (dependee: string, depender: string) =>
    dependencyMap.get(depender)
        ? dependencyMap.get(depender).add(dependee)
        : dependencyMap.set(depender, new Set([dependee]))

const plan = (element: XMLElement) => {
    const goals = element.elements.filter(e => e.name === "goal")
    if (element.attributes["operator"] === "sequence") {
        goals
            .slice(0, goals.length - 1)
            .map((g, i) => [g, goals[i + 1]])
            .forEach(([g1, g2]) => dependsOn(g1.attributes["id"], g2.attributes["id"]))
    }
    return goals.map(goal)
}

const converter = {
    "functional-specification": functionalSpecification,
    scheme: scheme,
    goal: goal,
    argument: argument,
    "depends-on": dependsOn,
}

const getPlans = (element: XMLElement) => element.elements.filter(e => e.name === "plan")

const op = (op: string) => (op === "parallel" || op === "sequence" ? PlanOperator.AND : PlanOperator.OR)
