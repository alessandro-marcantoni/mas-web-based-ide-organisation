import { ElementDefinition } from "cytoscape"
import { list, List } from "scala-types/dist/list/list"
import { Component } from "../commons"
import { fromSet } from "../structural/utils"
import { Goal, PlanOperator, stringOperator } from "./entities"

export const presentation: (c: Component, cs: List<Component>) => List<ElementDefinition> = (c, cs) => {
    switch (c.type) {
        case "goal":
            const g = c as Goal
            return list(goal(g))
                .appendedAll(
                    // @ts-ignore
                    fromSet(g.subGoals).flatMap(e => presentation(e, cs).appended(relation(g, e)))
                )
                // @ts-ignore
                .appendedAll(fromSet(g.dependsOn).map(e => dependency(g, e)))
        default:
            return list()
    }
}

const goal = (g: Goal) => {
    return {
        data: {
            id: g.name,
            label: g.name + (g.subGoals.size > 1 ? "\n\n" + "<" + stringOperator(g.operator) + ">" : ""),
            componentType: "goal",
        },
    }
}

const relation = (goal: Goal, subGoal: Goal) => {
    return {
        data: {
            id: `${goal.name}-${subGoal.name}`,
            source: subGoal.name,
            target: goal.name,
            componentType: "relation",
            relationType: goal.operator === PlanOperator.AND ? "and" : "or",
        },
    }
}

const dependency = (from: Goal, to: Goal) => {
    return {
        data: {
            id: `${from.name}-${to.name}`,
            source: from.name,
            target: to.name,
            componentType: "dependency",
        },
    }
}
