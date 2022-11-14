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
    label: string;
    from: Role;
    to: Role;

    constructor(label: string, from: Role, to: Role) {
        super("link");
        this.label = label;
        this.from = from;
        this.to = to;
    }
}

export type Constraint = Component & {}

export class Group extends Component {
    name: string;
    roles: Set<Role>;
    links: Set<Link>;
    constraints: Set<Constraint>;

    constructor(name: string) {
        super("group");
        this.name = name;
        this.roles = new Set<Role>()
        this.links = new Set<Link>()
        this.constraints = new Set<Constraint>()
    }

    addRole(r: Role) {
        this.roles.add(r)
    }

    removeRole(r: Role) {
        this.roles.delete(r)
    }

    addLink(l: Link) {
        this.links.add(l)
    }

    addConstraint(c: Constraint) {
        this.constraints.add(c)
    }
}

export type RoleInGroup = Role & {
    group: Group;
    min: number;
    max: number;
}

export const getAllRoles: (components: Array<Component>) => Array<Role> = components =>
    components.filter(c => c).filter(c => c.type === "role")
        .map(c => c as Role)
        .concat(components.filter(c => c).filter(c => c.type === "group").flatMap(c => Array.from((c as Group).roles)))

export const getGroups: (components: Array<Component>) => Array<Group> = components =>
    components.filter(c => c).filter(c => c.type === "group")
        .map(c => c as Group)
