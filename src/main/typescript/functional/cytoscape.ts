import { ElementDefinition } from "cytoscape"
import { list, List } from "scala-types/dist/list/list"
import { Component } from "../commons"
import { fromSet, separate, shortName } from '../structural/utils';
import { Goal, PlanOperator } from "../domain/functional"

export const presentation: (c: Component, cs: List<Component>) => List<ElementDefinition> = (c, cs) => {
    switch (c.type) {
        case "goal":
            const g = c as Goal
            return (
                goal(g)
                    // @ts-ignore
                    .appendedAll(
                        fromSet(g.dependencies).map(e => dependency(g, cs.find(c => c.getName() === e).get() as Goal))
                    )
            )
        default:
            return list()
    }
}

const goal: (g: Goal) => List<ElementDefinition> = (g) =>
    list<ElementDefinition>({
        data: {
            id: g.name,
            label: g.name,
            componentType: "goal",
            withResponsibles: g.responsibles.size > 0 ? "yes" : "no"
        },
    }).appendedAll(responsibles(g))

const responsibles: (g: Goal) => List<ElementDefinition> = (g) =>
    fromSet(g.responsibles).map(r => {
        return {
            data: {
                id: separate(g.name)(r),
                label: shortName(r).charAt(0),
                componentType: "responsible",
                parent: g.name
            },
        }
    })

const dependency = (from: Goal, to: Goal) => {
    return {
        data: {
            id: `${from.name}-${to.name}`,
            source: from.name,
            target: to.name,
            componentType: "dependency",
            relationType: PlanOperator.toString(from.operator),
        },
    }
}
