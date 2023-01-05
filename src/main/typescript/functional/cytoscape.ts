import { ElementDefinition } from "cytoscape"
import { list, List } from "scala-types/dist/list/list"
import { Component } from "../commons"
import { fromSet } from "../structural/utils"
import { Goal, PlanOperator } from '../domain/functional';

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
            dom: createDiv(g),
            componentType: "goal",
        },
    }
}

const createDiv = (g: Goal) => {
    const node = document.createElement("div")
    const label = document.createElement("div")
    const roles = document.createElement("div")
    roles.style.display = "flex"
    roles.style.flexWrap = "no-wrap"
    roles.style.justifyContent = "space-around"
    addResponsibles(g, roles)
    label.innerHTML = g.name
    label.style.textAlign = "center"
    node.appendChild(label)
    node.appendChild(roles)
    node.style.padding = "20px"
    node.style.borderRadius = "10px"
    node.style.backgroundColor = "#2EB5E0"
    return node
}

const addResponsibles = (g: Goal, div: HTMLDivElement) => {
    g.responsibles.forEach(r => {
        const role = document.createElement("div")
        role.style.width = "35px"
        role.style.height = "35px"
        role.style.backgroundColor = "red"
        role.style.borderRadius = "50px"
        role.innerHTML = r.charAt(0)
        role.style.textAlign = "center"
        role.style.verticalAlign = "middle"
        role.style.lineHeight = "35px"
        role.style.backgroundColor = "#00A8A8"
        div.appendChild(role)
        console.log(r);
    })
}

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
