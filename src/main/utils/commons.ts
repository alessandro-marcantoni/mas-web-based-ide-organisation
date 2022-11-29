import { Component } from "./structural/entities";

export enum DiagramEventType {
    LinkCreation, AdditionToGroup, RemovalFromGroup, SelectedComponent,
    ExtensionChange, ComponentDeletion, CardinalityConstraintAddition,
    RoleCardinalityChange,
}

export type DiagramEventHandler = (event: DiagramEvent) => void;

export abstract class DiagramEvent {
    type: DiagramEventType;

    protected constructor(type: DiagramEventType) {
        this.type = type;
    }
}

export class LinkCreationEvent extends DiagramEvent {
    from: string;
    to: string;
    linkType: string;

    constructor(from: string, to: string, linkType: string) {
        super(DiagramEventType.LinkCreation);
        this.from = from;
        this.to = to;
        this.linkType = linkType;
    }
}

export class AdditionToGroupEvent extends DiagramEvent {
    component: string;
    componentType: string;
    destinationGroup: string;

    constructor(component: string, componentType: string, destinationGroup: string) {
        super(DiagramEventType.AdditionToGroup);
        this.component = component;
        this.componentType = componentType;
        this.destinationGroup = destinationGroup;
    }
}

export class RemovalFromGroupEvent extends DiagramEvent {
    component: string;
    componentType: string;
    sourceGroup: string;

    constructor(component: string, componentType: string, sourceGroup: string) {
        super(DiagramEventType.RemovalFromGroup);
        this.component = component;
        this.componentType = componentType;
        this.sourceGroup = sourceGroup;
    }
}

export class SelectedComponentEvent extends DiagramEvent {
    component: string;
    componentType: string;

    constructor(component: string, componentType: string) {
        super(DiagramEventType.SelectedComponent);
        this.component = component;
        this.componentType = componentType;
    }
}

export class ExtensionChangeEvent extends DiagramEvent {
    role: string;
    extension: string;

    constructor(role: string, extension: string) {
        super(DiagramEventType.ExtensionChange);
        this.role = role;
        this.extension = extension;
    }
}

export class RoleCardinalityChangeEvent extends DiagramEvent {
    role: string;
    property: string;
    value: number;

    constructor(role: string, property: string, value: number) {
        super(DiagramEventType.RoleCardinalityChange);
        this.role = role;
        this.property = property;
        this.value = value;
    }
}

export class ComponentDeletionEvent extends DiagramEvent {
    component: Component;

    constructor(component: Component) {
        super(DiagramEventType.ComponentDeletion);
        this.component = component;
    }
}

export class CardinalityConstraintAdditionEvent extends DiagramEvent {
    group: string;
    objectType: string;
    object: string;
    min: number;
    max: number;

    constructor(group: string, type: string, object: string, min: number, max: number) {
        super(DiagramEventType.CardinalityConstraintAddition);
        this.group = group;
        this.objectType = type;
        this.object = object;
        this.min = min;
        this.max = max;
    }
}