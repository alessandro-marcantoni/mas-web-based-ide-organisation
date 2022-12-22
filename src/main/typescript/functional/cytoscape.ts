import { ElementDefinition } from "cytoscape"
import { list, List } from "scala-types/dist/list/list"
import { Component } from "../commons"
import { fromSet } from "../structural/utils"
import { Goal, stringOperator } from "../domain/functional"

export const presentation: (c: Component, cs: List<Component>) => List<ElementDefinition> = (c, cs) => {
    switch (c.type) {
        case "goal":
            const g = c as Goal
            return list(goal(g))
                // @ts-ignore
                .appendedAll(fromSet(g.dependencies).map(e => dependency(g, cs.find(c => c.name === e).get() as Goal)))
        default:
            return list()
    }
}

const goal = (g: Goal) => {
    return {
        data: {
            id: g.name,
            label: g.name + (g.dependencies.size > 1 ? "\n\n" + "<" + stringOperator(g.operator) + ">" : ""),
            componentType: "goal",
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
