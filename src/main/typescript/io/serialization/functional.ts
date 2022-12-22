import { List, toArray } from 'scala-types/dist/list/list';
import { formatXml } from "./common"
import { Component } from "../../commons"
import { getAllGoals } from '../../functional/utils';
import { Goal } from '../../domain/functional';

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
    "<goal id=\"" + goal.name + "\">" +
        Array.from(goal.dependencies).map(dep => "<depends-on goal=\"" + dep + "\"/>").join("\n") +
    "</goal>"