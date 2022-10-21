export type Role = {
    name: string;
    extends: Role | undefined;
}

export type LinkLabel = "communication" | "authority" | "acquaintance"

export type Link = {
    label: LinkLabel;
    from: Role;
    to: Role;
}

export type Constraint = {}

export type Group = {
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
