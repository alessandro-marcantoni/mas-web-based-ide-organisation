import {StructuralState} from "../../components/Structural";
import {none, Option, some} from "scala-types/dist/option/option";
import {Compatibility, Component, Constraint, Group, Role} from "./entities";
import {list, List} from "scala-types/dist/list/list";
import {
    defined,
    fromSet,
    getAllGroups,
    getAllRoles, getGlobalGroups, isInGroup,
    option,
    separate,
    shortName, splitName
} from "./utils";

/**
 * Create a new structural {@link Component}.
 * @param state The current state of the structural specification.
 * @param type The type of component to create.
 * @param linkType The type of link to create (in case the component is a link).
 * @param from The role the link comes from.
 * @param to The role the link goes to.
 * @param toAdd Whether the component should be added straight away to the diagram or not.
 * @returns An {@link Option} containing the new structural component if it could be created.
 */
export const createComponent: (state: StructuralState, type: string, link: string, from: string, to: string, toAdd: boolean) => Option<Component> =
    (state, type, linkType, from, to, toAdd) => {
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
                if (!getAllRoles(state.added).exists(r => r.name === from) ||
                    !getAllRoles(state.added).exists(r => r.name === to) ||
                    linkType !== "compatibility")
                    return none()
                return some(new Compatibility(from, to))
            default:
                return none()
        }
    }

export const removeComponent: (state: StructuralState, type: string, comp: Component) => List<Component> =
    (state, type, comp) => {
        switch (type) {
            case "role":
                const r = comp as Role
                const added = isInGroup(r.name) ?
                    removeFromGroup(state, r.name, "role", splitName(r.name).group) : state.added
                return defined(added.collect(
                    list(c => c.type === "role",
                        c => c.type === "constraint" && (c as Constraint).constraint === "compatibility",
                        () => true),
                    list(c => (c as Role).name === r.name ? undefined : c,
                        c => (c as Compatibility).to === r.name || (c as Compatibility).from === r.name ? undefined : c,
                        c => c)
                ))
            case "group":
                const g = comp as Group
                const a = getGlobalGroups(state.added).contains(g) ?
                    state.added :
                    removeFromGroup(state, g.name, "group", getAllGroups(state.added)
                        .find(gr => gr.subgroups.has(g)).map(gr => gr.name).getOrElse(""))
                return a.filter(c => c.type !== "group" || (c as Group).name != g.name)
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
            group: "",
            role: "",
            roleExtension: state.roleExtension, subgroupOf: state.subgroupOf,
            link: {to: "", from: ""}, selected: state.selected
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
                .appended(new Group(og.name, og.min, og.max, og.subgroups, new Set(Array.from(og.roles).filter(r => r.name !== o.name)).add(new Role(separate(group)(shortName(o.name)), o.extends, o.min, o.max)), og.constraints))
            ).getOrElse(state.added)
        }
        if (type === "group") {
            const o = getAllGroups(state.added).find(c => c.name === component).get() as Group
            return destinationGroup.map((og: Group) => defined(state.added)
                .filter(c => c.type !== "group" || ((c as Group).name !== component && (c as Group).name !== group))
                .appended(new Group(og.name, og.min, og.max, new Set(Array.from(og.subgroups).filter(g => g.name !== o.name)).add(new Group(o.name, o.min, o.max, o.subgroups, o.roles, o.constraints)), og.roles, og.constraints))
            ).getOrElse(state.added)
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
                .filter(c => c.type !== "group" || (c as Group).name !== og.name)
                .appended(oc.also(cc => {
                    cc.name = shortName(cc.name)
                })) :
            state.added
                .appended(oc.also(cc => {
                    cc.name = shortName(cc.name)
                })))).getOrElse(state.added)
    }

export const changeExtension: (state: StructuralState, role: string, extended: string) => List<Component> =
    (state, role, extended) => {
        const er = getAllRoles(state.added).find(r => shortName(r.name) === extended)
            .map((r: Role) => new Role(shortName(r.name), r.extends, r.min, r.max)).getOrElse(undefined)
        return state.added.collect(
                list(
                    c => c.type === "role" && shortName((c as Role).name) === shortName(role),
                    c => c.type === "group" && fromSet((c as Group).roles).map(r => shortName(r.name)).contains(shortName(role)),
                    () => true
                ),
                list(
                    c => new Role((c as Role).name, er, (c as Role).min, (c as Role).max),
                    c => {
                        const roleInGroup = fromSet((c as Group).roles).filter(r => shortName(r.name) === shortName(role)).get(0)
                        return new Group((c as Group).name, (c as Group).min, (c as Group).max, (c as Group).subgroups,
                            new Set(Array.from((c as Group).roles).filter(r => shortName(r.name) !== shortName(role)))
                                .add(new Role(roleInGroup.name, er, roleInGroup.min, roleInGroup.max)), (c as Group).constraints)
                    },
                    c => c
                )
            )
    }
