import { Option } from "scala-types/dist/option/option"
import { list, List } from "scala-types/dist/list/list"
import { AbstractComponent } from "../commons"
import { option } from "../structural/utils"

export enum PlanOperator {
    AND,
    OR,
}

export const stringOperator = (op: PlanOperator): string => {
    switch (op) {
        case PlanOperator.AND:
            return "AND"
        case PlanOperator.OR:
            return "OR"
    }
}

export class Goal extends AbstractComponent {
    name: string
    args: List<Argument<unknown>> = list()
    dependencies: Set<string> = new Set<string>()
    operator: PlanOperator = PlanOperator.AND
    responsibles: Set<string> = new Set<string>()

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
