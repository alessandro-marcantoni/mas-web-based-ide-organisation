import { DiagramEvent, DiagramEventType } from "../commons"

export class GoalCreationEvent extends DiagramEvent {
    name: string

    constructor(name: string) {
        super(DiagramEventType.GoalCreation)
        this.name = name
    }
}

export class GoalRelationRemovalEvent extends DiagramEvent {
    goal: string
    other: string
    relation: string

    constructor(goal: string, other: string, relation: string) {
        super(DiagramEventType.SubgoalRemoval)
        this.goal = goal
        this.other = other
        this.relation = relation
    }
}

export class GoalDependencyAdditionEvent extends DiagramEvent {
    goal: string
    other: string

    constructor(goal: string, other: string) {
        super(DiagramEventType.DependencyAddition)
        this.goal = goal
        this.other = other
    }
}
