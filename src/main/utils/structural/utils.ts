import {Compatibility, Component, Constraint, Group, Link, Role} from "./entities";
import {Option, none, some} from "scala-types/dist/option/option";
import {fromArray, list, List} from "scala-types/dist/list/list";

/**
 * Retrieve all the {@link Role}s among the {@link Component}s recursively.
 * @param components The List containing all the {@link Component}s.
 * @returns The List containing all the {@link Role}s.
 */
export const getAllRoles: (components: List<Component>) => List<Role> = components =>
    defined(components).filter(c => c.type === "role")
        .map(c => c as Role)
        .appendedAll(defined(components).collect(list(c => c.type === "group"), list(c => c as Group)).flatMap(c => fromSet(c.roles)))
        .appendedAll(defined(components).collect(list(c => c.type === "group"), list(c => c as Group)).flatMap(c => fromSet(c.subgroups)).flatMap(s => fromSet(s.roles)))

/**
 * Retrieve the {@link Group}s among the {@link Component}s with depth 0 (only global {@link Group}s).
 * @param components The List containing all the {@link Component}s.
 * @returns The List containing the global {@link Group}s.
 */
export const getGlobalGroups: (components: List<Component>) => List<Group> = components =>
    defined(components).filter(c => c.type === "group")
        .map(c => c as Group)

/**
 * Retrieve all the {@link Group}s among the {@link Component}s recursively (including subgroups).
 * @param components The List containing all the {@link Component}s.
 * @returns The List containing all the {@link Group}s.
 */
export const getAllGroups: (components: List<Component>) => List<Group> = components =>
    getGlobalGroups(components).appendedAll(
        defined(components)
            .collect(list(c => c.type === "group"), list(c => c as Group))
            .flatMap(c => fromSet(c.subgroups)))

/**
 * Retrieve all the {@link Link}s among the {@link Component}s recursively.
 * @param components The List containing all the {@link Component}s.
 * @returns The List containing all the {@link Link}s.
 */
export const getLinks: (components: List<Component>) => List<Link> = components =>
    components.collect(list(c => c.type === "link"), list(c => c as Link))
        .appendedAll(getAllGroups(components).flatMap(c => fromSet(c.links)))

export const getConstraints: (components: List<Component>) => List<Constraint> = components =>
    getAllGroups(components).flatMap(c => fromSet(c.constraints))

export const getCompatibilities: (components: List<Component>) => List<Compatibility> = components =>
    getConstraints(components)
        .collect(list(c => c.constraint === "compatibility"), list(c => c as Compatibility))

export const option: <T>(element: T) => Option<T> = (element) =>
    element ? some(element) : none()

export const separator = '___'
export const separatorRegex = new RegExp(`.*${separator}`)
export const separate: (group: string) => (component: string) => string =
    (group) => (component) => `${group}${separator}${component}`
export function shortName(longName: string, regex: RegExp = separatorRegex): string {
    return longName.replace(regex, "")
}

export const fromSet: <T>(s: Set<T>) => List<T> = (s) =>
    fromArray(Array.from(s))

export const defined: <T>(l: List<T>) => List<T> = (l) =>
    l.filter(e => e !== undefined)
