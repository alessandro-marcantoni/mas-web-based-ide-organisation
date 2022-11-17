/**
 * A generic structural component.
 */
export abstract class Component {
    type: string;

    protected constructor(type: string) {
        this.type = type;
    }
}

export class Role extends Component {
    name: string;
    extends: Role | undefined;
    min: number;
    max: number;

    constructor(name: string, extension: Role | undefined, min: number = 0, max: number = Number.MAX_VALUE) {
        super("role");
        this.name = name;
        this.extends = extension;
        this.min = min;
        this.max = max;
    }

    /**
     * Perform a side effect and continue the computation.
     * @param f A side effect function that can be applied on the component.
     * @returns The component
     */
    also(f: ((o: Role) => void)): Role {
        f(this)
        return this
    }
}

export class Link extends Component {
    label: string;
    from: string;
    to: string;
    scope: string;
    extendsSubgroups: boolean;
    biDir: boolean;

    constructor(label: string, from: string, to: string, scope: string = "intra-group", extendsSubgroups: boolean = false, biDir: boolean = false) {
        super("link");
        this.label = label;
        this.from = from;
        this.to = to;
        this.scope = scope;
        this.extendsSubgroups = extendsSubgroups;
        this.biDir = biDir;
    }
}

export abstract class Constraint extends Component {
    constraint: string;

    protected constructor(constraint: string) {
        super("constraint");
        this.constraint = constraint;
    }
}

export class Cardinality extends Constraint {
    min: number;
    max: number;
    object: string;
    id: string;

    constructor(id: string, object: string, min: number = 0, max: number = Number.MAX_VALUE) {
        super("cardinality");
        this.min = min;
        this.max = max;
        this.object = object;
        this.id = id;
    }
}

export class Compatibility extends Constraint {
    from: string;
    to: string;
    scope: string;
    extendsSubgroups: boolean;
    biDir: boolean;

    constructor(from: string, to: string, scope: string = "intra-group", extendsSubgroups: boolean = false, biDir: boolean = false) {
        super("compatibility");
        this.from = from;
        this.to = to;
        this.scope = scope;
        this.extendsSubgroups = extendsSubgroups;
        this.biDir = biDir;
    }
}

export class Group extends Component {
    name: string;
    min: number;
    max: number;
    subgroups: Set<Group>
    roles: Set<Role>;
    links: Set<Link>;
    constraints: Set<Constraint>;

    constructor(
        name: string,
        min: number = 0,
        max: number = Number.MAX_VALUE,
        subgroups: Set<Group> = new Set<Group>(),
        roles: Set<Role> = new Set<Role>(),
        links: Set<Link> = new Set<Link>(),
        constraints: Set<Constraint> = new Set<Constraint>()
    ) {
        super("group");
        this.name = name;
        this.min = min;
        this.max = max;
        this.subgroups = subgroups
        this.roles = roles
        this.links = links
        this.constraints = constraints
    }

    /**
     * Perform a side effect and continue the computation.
     * @param f A side effect function that can be applied on the component.
     * @returns The component
     */
    also(f: ((o: Group) => void)): Group {
        f(this)
        return this
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

    addSubgroup(g: Group) {
        this.subgroups.add(g)
    }

    removeSubgroup(g: Group) {
        this.subgroups.delete(g)
    }
}
