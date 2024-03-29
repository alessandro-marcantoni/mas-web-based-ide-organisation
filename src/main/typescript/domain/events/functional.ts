import { DiagramEvent, DiagramEventType } from "../commons"
import { PlanOperator } from '../functional';

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

export class OperatorChangeEvent extends DiagramEvent {
    goal: string
    operator: PlanOperator

    constructor(goal: string, operator: PlanOperator) {
        super(DiagramEventType.OperatorChange)
        this.goal = goal
        this.operator = operator
    }
}

export class ResponsibleAdditionEvent extends DiagramEvent {
    goal: string
    responsible: string
    modality: string

    constructor(goal: string, responsible: string, modality: string) {
        super(DiagramEventType.ResponsibleAddition)
        this.goal = goal
        this.responsible = responsible
        this.modality = modality
    }
}

export class ResponsibleRemovalEvent extends DiagramEvent {
    goal: string
    responsible: string

    constructor(goal: string, responsible: string) {
        super(DiagramEventType.ResponsibleRemoval)
        this.goal = goal
        this.responsible = responsible
    }
}
