import {Component, Group, Link, Role} from "./types";
import {StructuralState} from "../../components/Structural";
import {Option, none, some} from "scala-types/dist/option/option";

/**
 * Create a new structural component.
 * @param state The current state of the structural specification.
 * @param type The type of component to create.
 * @param linkType The type of link to create (in case the component is a link).
 * @param toAdd Whether the component should be added straight away to the diagram or not.
 * @returns An {@link Option} containing the new structural component if it could be created.
 */
export const createComponent:
    (state: StructuralState, type: string, linkType: string, toAdd: boolean) => Option<Component> = (state, type, linkType, toAdd) => {
        switch (type) {
            case "role":
                if ((getAllRoles(state.added).map(r => r.name).includes(state.role) && toAdd) ||
                    (getAllRoles(state.components).map(r => r.name).includes(state.role) && !toAdd))
                    return none()
                return some(new Role(
                    calcName(state.role, state.added),
                    state.roleExtension ?
                        getAllRoles(state.components).find(r => r.name === state.roleExtension) :
                        undefined))
            case "group":
                if ((getAllGroups(state.components).map(g => g.name).includes(state.group) && !toAdd) ||
                    (getAllGroups(state.added).map(g => g.name).includes(state.group) && toAdd))
                    return none()
                return some(new Group(state.group))
            case "link":
                return some(new Link(linkType, state.link.from, state.link.to))
            default:
                return none()
        }
    }

/**
 * Retrieve all the {@link Role}s among the {@link Component}s recursively.
 * @param components The array containing all the {@link Component}s.
 * @returns The array containing all the {@link Role}s.
 */
export const getAllRoles: (components: Array<Component>) => Array<Role> = components =>
    components.filter(c => c).filter(c => c.type === "role")
        .map(c => c as Role)
        .concat(components.filter(c => c).filter(c => c.type === "group").flatMap(c => Array.from((c as Group).roles)))
        .concat(Array.from(components.filter(c => c).filter(c => c.type === "group").flatMap(c => Array.from((c as Group).subgroups).flatMap(s => Array.from(s.roles)))))

/**
 * Retrieve the {@link Group}s among the {@link Component}s with depth 0 (only global {@link Group}s).
 * @param components The array containing all the {@link Component}s.
 * @returns The array containing the global {@link Group}s.
 */
export const getGlobalGroups: (components: Array<Component>) => Array<Group> = components =>
    components.filter(c => c).filter(c => c.type === "group")
        .map(c => c as Group)

/**
 * Retrieve all the {@link Group}s among the {@link Component}s recursively (including subgroups).
 * @param components The array containing all the {@link Component}s.
 * @returns The array containing all the {@link Group}s.
 */
export const getAllGroups: (components: Array<Component>) => Array<Group> = components =>
    getGlobalGroups(components).concat(
        components.filter(c => c)
            .filter(c => c.type === "group")
            .flatMap(c => Array.from((c as Group).subgroups)))

/**
 * Retrieve all the {@link Link}s among the {@link Component}s recursively.
 * @param components The array containing all the {@link Component}s.
 * @returns The array containing all the {@link Link}s.
 */
export const getLinks: (components: Array<Component>) => Array<Link> = components =>
    getAllGroups(components).flatMap(c => Array.from(c.links))

export const calcName: (name: string, components: Array<Component>) => string = (name, components) =>
    getAllRoles(components).map(r => r.name).includes(name)
        ? calcName(name + "_", components) : name

export const option: <T>(element: T) => Option<T> = (element) =>
    element ? some(element) : none()

export const separator = '___'
export const separatorRegex = new RegExp(`.*${separator}`)