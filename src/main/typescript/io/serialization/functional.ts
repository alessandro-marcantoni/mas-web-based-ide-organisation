import { List, toArray } from "scala-types/dist/list/list"
import { formatXml } from "./common"
import { Component } from "../../domain/commons"
import { getAllGoals } from "../../utils/utils"
import { Goal, PlanOperator } from "../../domain/functional"

class Norm {
    type: string
    role: string
    mission: string

    constructor(type: string, role: string, goal: string) {
        this.type = type
        this.role = role
        this.mission = MISSION_TOKEN + goal
    }
}

export const serializeFunctional: (diagram: List<Component>) => string = diagram => {
    console.log(formatXml(
        "<functional-specification>" +
            '<scheme id="orgScheme">' +
            '<goal id="orgGoal">' +
            '<plan operator="parallel">' +
            toArray(getAllGoals(diagram).map(goal)).join("\n") +
            "</plan>" +
            "</goal>" +
            toArray(getAllGoals(diagram).map(mission)).join("\n") +
            "</scheme>" +
            "</functional-specification>" +
            "<normative-specification>" +
            norms(getAllGoals(diagram)) +
            "</normative-specification>"
    ));
    
    return formatXml(
        "<functional-specification>" +
            '<scheme id="orgScheme">' +
            '<goal id="orgGoal">' +
            '<plan operator="parallel">' +
            toArray(getAllGoals(diagram).map(goal)).join("\n") +
            "</plan>" +
            "</goal>" +
            toArray(getAllGoals(diagram).map(mission)).join("\n") +
            "</scheme>" +
            "</functional-specification>" +
            "<normative-specification>" +
            norms(getAllGoals(diagram)) +
            "</normative-specification>"
    )
}

const goal: (goal: Goal) => string = goal =>
    goal.operator === PlanOperator.OR && goal.dependencies.size >= 2 ? orGoal(goal) : andGoal(goal)

const mission: (goal: Goal) => string = goal =>
    '<mission id="' + MISSION_TOKEN + goal.name + '">' + '<goal id="' + "goal_" + goal.name + '"/>' + "</mission>"

const norms: (goals: List<Goal>) => string = goals =>
    toArray(goals)
        .flatMap(goal => Array.from(goal.responsibles.entries()).map(([resp, mod]) => new Norm(mod, resp, goal.name)))
        .map(
            norm =>
                '<norm id="' +
                norm.type +
                norm.role +
                norm.mission +
                '" type="' +
                norm.type +
                '" role="role_' +
                norm.role +
                '" mission="' +
                norm.mission +
                '"/>'
        )
        .join("\n")

const orGoal: (goal: Goal) => string = goal =>
    '<goal id="' + "goal_" + goal.name + '">' +
    '<depends-on goal="' + OR_TOKEN + goal.name + '"/>' +
    "</goal>" + '<goal id="' + OR_TOKEN + goal.name + '">' +
    '<plan operator="choice">' +
    Array.from(goal.dependencies)
        .map(dep => '<goal id="' + "goal_" + dep + '"/>')
        .join("\n") +
    "</plan>" +
    "</goal>"

const andGoal: (goal: Goal) => string = goal =>
    '<goal id="' + "goal_" +
    goal.name +
    '">' +
    Array.from(goal.dependencies)
        .map(dep => '<depends-on goal="' + "goal_" + dep + '"/>')
        .join("\n") +
    "</goal>"

export const OR_TOKEN = "or__"
export const MISSION_TOKEN = "mission__"
