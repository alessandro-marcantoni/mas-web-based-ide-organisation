import { shortName } from "../structural/utils"
import { Group } from "./structural"

export class EntityGroup {
    group: Group
    players: Map<string, Set<string>> = new Map()

    constructor(group: Group) {
        this.group = group
        this.group.roles.forEach(role => this.players.set(shortName(role.name), new Set<string>()))
    }
}
