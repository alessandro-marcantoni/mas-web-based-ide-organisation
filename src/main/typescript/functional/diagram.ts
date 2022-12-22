import { List } from "scala-types/dist/list/list"
import { Component } from "../commons"
import { Goal } from "../domain/functional"
import { getAllGoals } from "./utils"

export const addGoal: (components: List<Component>, goalName: string) => List<Component> = (components, goalName) =>
    components.appended(new Goal(goalName))

export const removeGoalRelation: (
    components: List<Component>,
    goalName: string,
    other: string,
    f: (other: string) => (g: Goal) => void
) => List<Component> = (components, goalName, other, f) => {
    const toRemove = getAllGoals(components).find(g => g.name === other)
    getAllGoals(components)
        .find(g => g.name === goalName)
        .apply(f(other))
    return toRemove.isDefined() ? components.appended(toRemove.get() as Goal) : components
}

export const dependencyRemover: (other: string) => (g: Goal) => void = other => g => {
    g.dependencies = new Set(Array.from(g.dependencies).filter(s => s !== other))
}

export const addDependency: (components: List<Component>, goalName: string, other: string) => List<Component> = (components, goalName, other) => {
    getAllGoals(components)
        .find(g => g.name === goalName)
        .apply(g => g.dependencies.add(other))
    return components
}