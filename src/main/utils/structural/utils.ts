import {Component, Group, Link, Role} from "./entities";
import {StructuralState} from "../../components/Structural";
import {Option, none, some} from "scala-types/dist/option/option";
import {fromArray, list, List} from "scala-types/dist/list/list";

/**
 * Create a new structural {@link Component}.
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
                if ((getAllRoles(state.added).exists(r => r.name === state.role) && toAdd) ||
                    (getAllRoles(state.components).exists(r => r.name === state.role) && !toAdd))
                    return none()
                return some(new Role(
                    state.role,
                    toAdd ?
                        getAllRoles(state.components).find(r => r.name === state.role).flatMap(r => option(r.extends)).getOrElse(undefined) :
                        state.roleExtension ? getAllRoles(state.components).find(c => c.name === state.roleExtension).getOrElse(undefined) : undefined
                    ))
            case "group":
                if ((getAllGroups(state.components).exists(g => g.name === state.group) && !toAdd) ||
                    (getAllGroups(state.added).exists(g => g.name === state.group) && toAdd))
                    return none()
                return some(new Group(state.group))
            case "link":
                return some(new Link(linkType, state.link.from, state.link.to))
            default:
                return none()
        }
    }

/**
 * Add a new structural {@link Component} to the current ones.
 * @param state The current state of the structural specification.
 * @param comp The component to be added.
 * @param toAdd Whether the component should be added directly to the diagram or not.
 * @returns The new state of the structural specification.
 */
export const add: (state: StructuralState, comp: Component, toAdd: boolean) => StructuralState = (state, comp, toAdd) => {
    return !state ? state : {
        components: !toAdd ? state.components.appended(comp) : state.components,
        added: toAdd ? state.added.appended(comp) : state.added,
        showRoleModal: state.showRoleModal, showGroupModal: state.showGroupModal,
        group: getAllGroups(state.components).size() === 0 ? state.group : getAllGroups(state.components).get(0).name,
        role: getAllRoles(state.components).size() === 0 ? state.role : getAllRoles(state.components).get(0).name,
        roleExtension: state.roleExtension, subgroupOf: state.subgroupOf,
        link: { to: "", from: "" }, toUpdate: state.toUpdate
    }
}

/**
 * Add a structural {@link Component} to a {@link Group}.
 * @param state The current state of the structural specification.
 * @param component The name of the {@link Component} to be added to a {@link Group}.
 * @param type The type of {@link Component} to be added.
 * @param group The destination {@link Group}.
 * @returns The new state of the diagram.
 */
export const addToGroup:
    (state: StructuralState, component: string, type: string, group: string) => List<Component> = (state, component, type, group) => {
        const destinationGroup: Option<Group> = getAllGroups(state.added).find(c => c.name === group)
        if (type === "role") {
            getAllRoles(state.added).find(c => c.name === component)
                .apply(o => destinationGroup.apply(og => og.addRole(
                    new Role(`${group}${separator}${o.name.replace(separatorRegex, "")}`, o.extension, o.min, o.max)
                )))
        }
        if (type === "group") {
            getAllGroups(state.added).find(c => c.name === component)
                .apply(o => destinationGroup.apply(og => og.addSubgroup(
                    new Group(`${o.name.replace(separatorRegex, "")}`, o.min, o.max, o.subgroups, o.roles, o.links, o.constraints)
                )))
        }
        return destinationGroup.map(og => type === "role" ?
            defined(state.added)
                .filter(c => c.type !== "role" || (c as Role).name !== component)
                .collect(
                    list(
                        c => c.type === "group" && (c as Group).name === og.name,
                            c => c.type === "link" && ((c as Link).from === component || (c as Link).to === component),
                        () => true
                    ),
                    list(
                        () => og,
                            l => new Link(
                                l.label,
                                l.from === component ? separate(group, component) : l.from,
                                l.to === component ? separate(group, component) : l.to,
                                l.scope,
                                l.extendsSubgroups,
                                l.biDir
                            ),
                            c => c
                    )
                ):
                //.map(c => c.type === "group" && (c as Group).name === og.name ? og : c):
            defined(state.added)
                .filter(c => c.type !== "group" || (c as Group).name !== component)
                .collect(
                    list(c => c.type === "group" && (c as Group).name === og.name, c => c.type === "link" && ((c as Link).from === component || (c as Link).to === component), () => true),
                    list(() => og, c => c))
        )
                //.map(c => c.type === "group" && (c as Group).name === og.name ? og : c))
        .getOrElse(state.added)
    }

/**
 * Remove a structural {@link Component} from a {@link Group}.
 * @param state The current state of the structural specification.
 * @param component The name of the {@link Component} to be removed from a {@link Group}.
 * @param type The type of {@link Component} to be removed.
 * @param group The {@link Group} the {@link Component} is inside.
 * @returns The new state of the diagram.
 */
export const removeFromGroup:
    (state: StructuralState, component: string, type: string, group: string) => List<Component> = (state, component, type, group) => {
        const g: Option<Group> = getAllGroups(state.added).find(c => c.name === group)
        let comp: Option<Component>
        if (type === "role") {
            comp = g.map(o => fromSet(o.roles)).flatMap(o => o.find(r => r && r.name === component))
            comp.apply(c => g.apply(o => o.removeRole(c as Role)))
        }
        if (type === "group") {
            comp = g.map(o => fromSet(o.subgroups)).flatMap(o => o.find(g => g && g.name === component))
            comp.apply(c => g.apply(o => o.removeSubgroup(c as Group)))
        }
        return g.flatMap(og => comp.map(c => og.roles.size === 0 && og.subgroups.size === 0 ?
            defined(state.added)
                .filter(c => c.type !== "group" || (c as Group).name !== og.name)
                .appended(c.also(cc => { cc.name = cc.name.replace(separatorRegex, "") })) :
            state.added.appended(c.also(cc => { cc.name = cc.name.replace(separatorRegex, "") })))).getOrElse(state.added)
    }

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
    getAllGroups(components).flatMap(c => fromSet(c.links))

export const option: <T>(element: T) => Option<T> = (element) =>
    element ? some(element) : none()

export const separator = '___'
export const separatorRegex = new RegExp(`.*${separator}`)
export const separate: (group: string, component: string) => string = (group, component) =>
    `${group}${separator}${component}`

export const fromSet: <T>(s: Set<T>) => List<T> = (s) =>
    fromArray(Array.from(s))

export const defined: <T>(l: List<T>) => List<T> = (l) =>
    l.filter(e => e !== undefined)
