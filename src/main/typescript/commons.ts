import { List } from "scala-types/dist/list/list"
import { Cardinality, Group, Role, Compatibility } from './domain/structural';

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
    DependencyAddition,
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
    name: string
    structural: Structural
}

export class Entity {
    groups: List<Group>
}

export class EntityGroup {
    name: string
    type: string

}

export class Structural {
    groups: List<SpecGroup>
    roles: List<Role>
}

export class SpecGroup {
    name: string
    min: number
    max: number
    subgroups: List<SpecGroup>
    roles: List<Role>
    cardinalities: List<Cardinality>
    compatibilities: List<Compatibility>
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