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

export const subgoalRemover: (other: string) => (g: Goal) => void = other => g => {
    g.subGoals = new Set(Array.from(g.subGoals).filter(s => s.name !== other))
}

export const dependencyRemover: (other: string) => (g: Goal) => void = other => g => {
    g.dependsOn = new Set(Array.from(g.dependsOn).filter(s => s.name !== other))
}
