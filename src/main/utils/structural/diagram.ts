import {StructuralState} from "../../components/Structural";
import {none, Option, some} from "scala-types/dist/option/option";
import {Compatibility, Component, Constraint, Group, Link, Role} from "./entities";
import {list, List} from "scala-types/dist/list/list";
import {
    defined,
    fromSet,
    getAllGroups,
    getAllRoles, getGlobalGroups, getLinks, isInGroup,
    option,
    separate,
    shortName, splitName
} from "./utils";
import {Mapper, Predicate} from "scala-types/dist/utils";

/**
 * Create a new structural {@link Component}.
 * @param state The current state of the structural specification.
 * @param type The type of component to create.
 * @param linkType The type of link to create (in case the component is a link).
 * @param toAdd Whether the component should be added straight away to the diagram or not.
 * @returns An {@link Option} containing the new structural component if it could be created.
 */
export const createComponent: (state: StructuralState, type: string, linkType: string, toAdd: boolean) => Option<Component> =
    (state, type, linkType, toAdd) => {
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
                return linkType === "compatibility" ?
                    (isInGroup(state.link.from) && isInGroup(state.link.to) ?
                        some(new Compatibility(state.link.from, state.link.to)) :
                        none()) :
                    some(new Link(linkType, state.link.from, state.link.to))
            default:
                return none()
        }
    }

export const removeComponent: (state: StructuralState, type: string, comp: Component) => List<Component> =
    (state, type, comp) => {
        switch (type) {
            case "link":
                const l = comp as Link
                return state.added.filter(c => c.type !== type ||
                    (c as Link).label !== l.label ||
                    (c as Link).from !== l.from ||
                    (c as Link).to !== l.to)
            case "role":
                const r = comp as Role
                const added = isInGroup(r.name) ?
                    removeFromGroup(state, r.name, "role", splitName(r.name).group) : state.added
                return defined(added.collect(
                    list(c => c.type === "role",
                        c => c.type === "link",
                        c => c.type === "constraint" && (c as Constraint).constraint === "compatibility",
                        () => true),
                    list(c => (c as Role).name === r.name ? undefined : c,
                        c => (c as Link).to === r.name || (c as Link).from === r.name ? undefined : c,
                        c => (c as Compatibility).to === r.name || (c as Compatibility).from === r.name ? undefined : c,
                        c => c)
                ))
            case "group":
                const g = comp as Group
                const a = getGlobalGroups(state.added).contains(g) ?
                    state.added :
                    removeFromGroup(state, g.name, "group", getAllGroups(state.added)
                        .find(gr => gr.subgroups.has(g)).map(gr => gr.name).getOrElse(""))
                const removed = a.filter(c => c.type !== "group" || (c as Group).name != g.name)
                return removed.filter(l => l.type !== "link" ||
                    getAllRoles(state.added).map(c => c.name).contains((l as Link).to) ||
                    getAllRoles(state.added).map(c => c.name).contains((l as Link).from))
            default:
                return state.added
        }
    }

/**
 * Add a new structural {@link Component} to the current ones.
 * @param state The current state of the structural specification.
 * @param comp The component to be added.
 * @param toAdd Whether the component should be added directly to the diagram or not.
 * @returns The new state of the structural specification.
 */
export const add: (state: StructuralState, comp: Component, toAdd: boolean) => StructuralState =
    (state, comp, toAdd) => {
        return !state ? state : {
            components: !toAdd ? state.components.appended(comp) : state.components,
            added: toAdd ? state.added.appended(comp) : state.added,
            showRoleModal: state.showRoleModal, showGroupModal: state.showGroupModal,
            group: getAllGroups(state.components).size() === 0 ? state.group : getAllGroups(state.components).get(0).name,
            role: getAllRoles(state.components).size() === 0 ? state.role : getAllRoles(state.components).get(0).name,
            roleExtension: state.roleExtension, subgroupOf: state.subgroupOf,
            link: {to: "", from: ""}, toUpdate: state.toUpdate
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
export const addToGroup: (state: StructuralState, component: string, type: string, group: string) => List<Component> =
    (state, component, type, group) => {
        const destinationGroup: Option<Group> = getAllGroups(state.added).find(c => c.name === group)
        if (type === "role") {
            const o = getAllRoles(state.added).find(c => c.name === component).get() as Role
            return destinationGroup.map((og: Group) => defined(state.added)
                .filter(c => c.type !== "role" || (c as Role).name !== component)
                .filter(c => c.type !== "group" || (c as Group).name !== group)
                .appended(new Group(og.name, og.min, og.max, og.subgroups, new Set(Array.from(og.roles).filter(r => r.name !== o.name)).add(new Role(separate(group)(shortName(o.name)), o.extends, o.min, o.max)), og.links, og.constraints))
                .collect(updateLinksPredicates(component), updateLinksMappers(component, separate(group)))).getOrElse(state.added)
        }
        if (type === "group") {
            const o = getAllGroups(state.added).find(c => c.name === component).get() as Group
            return destinationGroup.map((og: Group) => defined(state.added)
                .filter(c => c.type !== "group" || ((c as Group).name !== component && (c as Group).name !== group))
                .appended(new Group(og.name, og.min, og.max, new Set(Array.from(og.subgroups).filter(g => g.name !== o.name)).add(new Group(o.name, o.min, o.max, o.subgroups, o.roles, o.links, o.constraints)), og.roles, og.links, og.constraints))
            ).getOrElse(state.added)
        }
        if (type === "link") {
            getLinks(state.added).find(c => `${c.from}${c.to}${c.label}` === component)
                .apply((o: Link) => destinationGroup.apply((og: Group) => og.addLink(
                    new Link(o.label, o.from, o.to, o.scope, o.extendsSubgroups, o.biDir)
                )))
            return destinationGroup.map(() => defined(state.added)
                .filter(c => c.type !== "link" || `${(c as Link).from}${(c as Link).to}${(c as Link).label}` !== component))
                .getOrElse(state.added)
        }
        return state.added
    }

/**
 * Remove a structural {@link Component} from a {@link Group}.
 * @param state The current state of the structural specification.
 * @param component The name of the {@link Component} to be removed from a {@link Group}.
 * @param type The type of {@link Component} to be removed.
 * @param group The {@link Group} the {@link Component} is inside.
 * @returns The new state of the diagram.
 */
export const removeFromGroup: (state: StructuralState, component: string, type: string, group: string) => List<Component> =
    (state, component, type, group) => {
        const g: Option<Group> = getAllGroups(state.added).find(c => c.name === group)
        let comp: Option<Component>
        if (type === "role") {
            comp = g.flatMap((o: Group) => defined(fromSet(o.roles)).find((r: Role) => r.name === component))
            comp.apply(c => g.apply(o => o.removeRole(c as Role)))
        }
        if (type === "group") {
            comp = g.flatMap((o: Group) => defined(fromSet(o.subgroups)).find((r: Group) => r.name === component))
            comp.apply(c => g.apply(o => o.removeSubgroup(c as Group)))
        }
        return g.flatMap(og => comp.map(oc => og.roles.size === 0 && og.subgroups.size === 0 ?
            defined(state.added)
                .collect(updateLinksPredicates(component), updateLinksMappers(component, shortName))
                .filter(c => c.type !== "group" || (c as Group).name !== og.name)
                .appended(oc.also(cc => {
                    cc.name = shortName(cc.name)
                })) :
            state.added.collect(updateLinksPredicates(component), updateLinksMappers(component, shortName))
                .appended(oc.also(cc => {
                    cc.name = shortName(cc.name)
                })))).getOrElse(state.added)
    }

const updateLinksPredicates: (component: string) => List<Predicate<Component>> = component => list(
    c => c.type === "link" && ((c as Link).from === component || (c as Link).to === component),
    c => c.type === "constraint" && (c as Constraint).constraint === "compatibility" &&
        ((c as Compatibility).from === component || (c as Compatibility).to === component),
    () => true
)

const updateLinksMappers: (component: string, f: (s: string) => string) => List<Mapper<Component, Component>> = (component, f) => list(
    l => new Link(
        (l as Link).label, (l as Link).from === component ? f(component) : (l as Link).from,
        (l as Link).to === component ? f(component) : (l as Link).to,
        (l as Link).scope, (l as Link).extendsSubgroups, (l as Link).biDir),
    c => new Compatibility(
        (c as Compatibility).from === component ? f(component) : (c as Compatibility).from,
        (c as Compatibility).to === component ? f(component) : (c as Compatibility).to,
        (c as Compatibility).scope, (c as Compatibility).extendsSubgroups, (c as Compatibility).biDir),
    c => c
)
