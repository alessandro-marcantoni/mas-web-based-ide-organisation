import { DiagramEvent, DiagramEventType } from "../commons"

export class GoalCreationEvent extends DiagramEvent {
    name: string

    constructor(name: string) {
        super(DiagramEventType.GoalCreation)
        this.name = name
    }
}
