import { DiagramEvent, DiagramEventType } from "../commons"

export class EntityGroupAdditionEvent extends DiagramEvent {
    group: string

    constructor(group: string) {
        super(DiagramEventType.EntityGroupAddition)
        this.group = group
    }
}

export class EntityGroupRemovalEvent extends DiagramEvent {
    group: string

    constructor(group: string) {
        super(DiagramEventType.EntityGroupRemoval)
        this.group = group
    }
}

export class PlayerAdditionEvent extends DiagramEvent {
    group: string
    agent: string
    role: string

    constructor(group: string, agent: string, role: string) {
        super(DiagramEventType.PlayerAddition)
        this.group = group
        this.agent = agent
        this.role = role
    }
}

export class PlayerRemovalEvent extends DiagramEvent {
    group: string
    agent: string
    role: string

    constructor(group: string, agent: string, role: string) {
        super(DiagramEventType.PlayerRemoval)
        this.group = group
        this.agent = agent
        this.role = role
    }
}
