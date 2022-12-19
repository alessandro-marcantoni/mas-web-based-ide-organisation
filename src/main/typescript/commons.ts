import { List } from "scala-types/dist/list/list"
import { Group, Role } from "./domain/structural"

export enum DiagramEventType {
    LinkCreation,
    AdditionToGroup,
    RemovalFromGroup,
    SelectedComponent,
    ExtensionChange,
    ComponentDeletion,
    CardinalityConstraintAddition,
    RoleCardinalityChange,
    GoalCreation,
    SubgoalRemoval,
    DependencyRemoval,
}

export type DiagramEventHandler = (event: DiagramEvent) => void

export abstract class DiagramEvent {
    type: DiagramEventType

    protected constructor(type: DiagramEventType) {
        this.type = type
    }
}

/**
 * A generic component.
 */
export interface Component {
    type: string
    getName: () => string
}

export class Specification {
    structural: Structural
}

export class Structural {
    groups: List<Group>
    roles: List<Role>
}

export abstract class AbstractComponent implements Component {
    type: string

    protected constructor(type: string) {
        this.type = type
    }

    abstract getName(): string
}

export interface XMLElement {
    elements: Array<XMLElement>
    attributes: Array<Record<string, unknown>>
    name: string
}