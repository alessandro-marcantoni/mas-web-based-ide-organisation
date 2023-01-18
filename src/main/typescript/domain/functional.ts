import { Option } from "scala-types/dist/option/option"
import { list, List } from "scala-types/dist/list/list"
import { AbstractComponent } from "./commons"
import { option } from "../utils/utils"

export enum PlanOperator {
    AND,
    OR,
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PlanOperator {
    export const fromString: (s: string) => PlanOperator = s => 
        s === "OR" ? PlanOperator.OR : PlanOperator.AND

    export const toString: (op: PlanOperator) => string = op => 
        op === PlanOperator.OR ? "OR" : "AND"
}

export class Goal extends AbstractComponent {
    name: string
    args: List<Argument<unknown>> = list()
    dependencies: Set<string> = new Set<string>()
    operator: PlanOperator = PlanOperator.AND
    responsibles: Map<string, string> = new Map<string, string>()

    constructor(
        name: string,
    ) {
        super("goal")
        this.name = name
    }

    static named(name: string): GoalBuilder {
        return new GoalBuilder(new Goal(name))
    }

    getName(): string {
        return this.name
    }

    addArgument(arg: Argument<unknown>) {
        this.args = this.args.appended(arg)
    }

    removeArgument(id: string) {
        this.args = this.args.filter(a => a.id !== id)
    }
}

class GoalBuilder {
    goal: Goal
    constructor(goal: Goal) {
        this.goal = goal
    }

    withArguments(arg: List<Argument<unknown>>) {
        this.goal.args = arg
        return this
    }

    withDependencies(deps: Set<string>) {
        this.goal.dependencies = deps
        return this
    }

    withOperator(operator: PlanOperator) {
        this.goal.operator = operator
        return this
    }

    build() {
        return this.goal
    }
}

export class Argument<T> extends AbstractComponent {
    id: string
    value: Option<T>

    constructor(id: string, value: T | undefined = undefined) {
        super("argument")
        this.id = id
        this.value = option(value)
    }

    getName(): string {
        return this.id + "argument"
    }
}
