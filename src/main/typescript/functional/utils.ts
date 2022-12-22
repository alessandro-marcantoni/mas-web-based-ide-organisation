import { list, List } from "scala-types/dist/list/list";
import { Component } from "../commons";
import { Goal } from "../domain/functional";

const onlyGoals: (components: List<Component>) => List<Goal> = components =>
    components.collect(list(c => c.type === "goal"), list(c => c as Goal))

export const getAllGoals: (l: List<Component>) => List<Goal> = (l: List<Component>) =>
    onlyGoals(l)
