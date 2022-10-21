export abstract class Component {
    type: string;

    constructor(type: string) {
        this.type = type;
    }
}

export class Role extends Component {
    name: string;
    extends: Role | undefined;

    constructor(name: string, extension: Role | undefined) {
        super("role");
        this.name = name;
        this.extends = extension
    }
}

export type LinkLabel = "communication" | "authority" | "acquaintance"

export class Link extends Component {
    label: LinkLabel;
    from: Role;
    to: Role;

    constructor(label: LinkLabel, from: Role, to: Role) {
        super("link");
        this.label = label;
        this.from = from;
        this.to = to;
    }
}

export type Constraint = Component & {}

export type Group = Component & {
    name: string;
    roles: Array<Role>;
    links: Array<Link>;
    constraints: Array<Constraint>
}

export type RoleInGroup = Role & {
    group: Group;
    min: number;
    max: number;
}
