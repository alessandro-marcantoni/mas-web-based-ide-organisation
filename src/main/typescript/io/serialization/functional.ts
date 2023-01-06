import { List, toArray } from 'scala-types/dist/list/list';
import { formatXml } from "./common"
import { Component } from "../../commons"
import { getAllGoals } from '../../functional/utils';
import { Goal, PlanOperator } from '../../domain/functional';

export const serialize: (diagram: List<Component>) => string = diagram =>
    formatXml(
        "<functional-specification>" +
            "<scheme id=\"orgScheme\">" +
                "<goal id=\"orgGoal\">" +
                    "<plan operator=\"parallel\">" +
                    toArray(getAllGoals(diagram).map(goal)).join("\n") +
                    "</plan>" +
                "</goal>" +
            "</scheme>" +
        "</functional-specification>"
    )

const goal: (goal: Goal) => string = goal =>
    (goal.operator === PlanOperator.OR && goal.dependencies.size >= 2) ? orGoal(goal) : andGoal(goal)

const orGoal: (goal: Goal) => string = goal =>
    "<goal id=\"" + goal.name + "\">" +
        "<depends-on goal=\"OR" + goal.name + "\"/>" +
    "</goal>" +
    "<goal id=\"" + OR_TOKEN + goal.name + "\">" +
        "<plan operator=\"choice\">" +
            Array.from(goal.dependencies).map(dep => "<goal id=\"" + dep + "\"/>").join("\n") +
        "</plan>" +
    "</goal>"

const andGoal: (goal: Goal) => string = goal =>
    "<goal id=\"" + goal.name + "\">" +
    Array.from(goal.dependencies).map(dep => "<depends-on goal=\"" + dep + "\"/>").join("\n") +
    "</goal>"

export const OR_TOKEN = "OR__"