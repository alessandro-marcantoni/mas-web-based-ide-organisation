import { AbstractComponent } from "./commons"

export enum RoleType {
    ABSTRACT = "abstract",
    CONCRETE = "concrete"
}

export abstract class Role extends AbstractComponent {
    name: string
    roleType: RoleType
    extends: string | undefined

    getName(): string {
        return this.name
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

export class AbstractRole extends Role {
    constructor(name: string, extension: string | undefined) {
        super("role")
        this.roleType = RoleType.ABSTRACT
        this.name = name
        this.extends = extension
    }
}

export class ConcreteRole extends Role {
    name: string
    min: number
    max: number

    constructor(name: string, extension: string | undefined, min: number = 0, max: number = Number.MAX_VALUE) {
        super("role")
        this.roleType = RoleType.CONCRETE
        this.name = name
        this.extends = extension
        this.min = min
        this.max = max
    }
}

export abstract class Constraint extends AbstractComponent {
    constraint: string

    protected constructor(constraint: string) {
        super("constraint")
        this.constraint = constraint
    }
}

export class Cardinality extends Constraint {
    min: number
    max: number
    object: string
    id: string

    constructor(id: string, object: string, min: number = 0, max: number = Number.MAX_VALUE) {
        super("cardinality")
        this.min = min
        this.max = max
        this.object = object
        this.id = id
    }

    getName(): string {
        return this.type + this.object + "cardinality"
    }
}

export class Compatibility extends Constraint {
    from: string
    to: string
    scope: string
    extendsSubgroups: boolean
    biDir: boolean

    constructor(
        from: string,
        to: string,
        scope: string = "intra-group",
        extendsSubgroups: boolean = false,
        biDir: boolean = false
    ) {
        super("compatibility")
        this.from = from
        this.to = to
        this.scope = scope
        this.extendsSubgroups = extendsSubgroups
        this.biDir = biDir
    }

    getName(): string {
        return this.from + this.to + "compatibility"
    }
}

export class Group extends AbstractComponent {
    name: string
    min: number
    max: number
    subgroups: Set<Group>
    roles: Set<ConcreteRole>
    constraints: Set<Constraint>

    constructor(
        name: string,
        min: number = 0,
        max: number = Number.MAX_VALUE,
        subgroups: Set<Group> = new Set<Group>(),
        roles: Set<ConcreteRole> = new Set<ConcreteRole>(),
        constraints: Set<Constraint> = new Set<Constraint>()
    ) {
        super("group")
        this.name = name
        this.min = min
        this.max = max
        this.subgroups = subgroups
        this.roles = roles
        this.constraints = constraints
    }

    getName(): string {
        return this.name
    }

    addRole(r: ConcreteRole) {
        this.roles.add(r)
    }

    removeRole(r: ConcreteRole) {
        this.roles.delete(r)
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

    /**
     * Perform a side effect and continue the computation.
     * @param f A side effect function that can be applied on the component.
     * @returns The component
     */
    also(f: ((o: Group) => void)): Group {
        f(this)
        return this
    }
}
