import { StructuralState } from "../../react/components/specification/structural/StructuralSpecification"
import { none, Option, some } from "scala-types/dist/option/option"
import { Cardinality, Compatibility, Constraint, Group, Role } from "../domain/structural"
import { list, List } from "scala-types/dist/list/list"
import {
    defined,
    fromSet,
    getAllGroups,
    getAllRoles,
    getGlobalGroups,
    isInGroup,
    option,
    removeDuplicates,
    separate,
    shortName,
    splitName,
} from "./utils"
import { Component } from "../commons"

/**
 * Create a new structural {@link Component}.
 * @param state The current state of the structural specification.
 * @param type The type of component to create.
 * @param linkType The type of link to create (in case the component is a link).
 * @param from The role the link comes from.
 * @param to The role the link goes to.
 * @returns An {@link Option} containing the new structural component if it could be created.
 */
export const createComponent: (
    state: StructuralState,
    type: string,
    linkType: string,
    from: string,
    to: string
) => Option<Component> = (state, type, linkType, from, to) => {
    switch (type) {
        case "role":
            if (getAllRoles(state.added).exists(r => r.name === state.role)) return none()
            return some(
                new Role(
                    state.role,
                    getAllRoles(state.added)
                        .find(r => shortName(r.name) === state.role)
                        .flatMap(r => option(r.extends))
                        .getOrElse(undefined)
                )
            )
        case "group":
            if (getAllGroups(state.added).exists(g => g.name === state.group)) return none()
            return some(new Group(state.group))
        case "link":
            if (
                !getAllRoles(state.added).exists(r => r.name === from) ||
                !getAllRoles(state.added).exists(r => r.name === to) ||
                linkType !== "compatibility"
            )
                return none()
            return some(new Compatibility(from, to))
        default:
            return none()
    }
}

export const createCardinality: (
    state: StructuralState,
    group: string,
    type: string,
    subject: string,
    min: number,
    max: number
) => List<Component> = (state, group, type, subject, min, max) => {
    getAllGroups(state.added)
        .find(g => g.name === group)
        .apply((g: Group) => {
            g.addConstraint(new Cardinality(subject, type, min, max))
            g.constraints = removeDuplicates<Constraint>(g.constraints, c => c.getName())
        })
    return state.added
}

export const changeRoleCardinality: (
    state: StructuralState,
    role: string,
    property: string,
    value: number
) => List<Component> = (state, role, property, value) => {
    getAllRoles(state.added)
        .find(r => r.name === role)
        .apply((r: Role) => {
            if (property === "min") r.min = value
            if (property === "max") r.max = value
        })
    return state.added
}

export const removeComponent: (state: StructuralState, type: string, comp: Component) => List<Component> = (
    state,
    type,
    comp
) => {
    switch (type) {
        case "role":
            const r = comp as Role
            const added = isInGroup(r.name)
                ? removeFromGroup(state, r.name, "role", splitName(r.name).group)
                : state.added
            return defined(
                added.collect(
                    list(
                        c => c.type === "role",
                        c => c.type === "constraint" && (c as Constraint).constraint === "compatibility",
                        () => true
                    ),
                    list(
                        c => ((c as Role).name === r.name ? undefined : c),
                        c =>
                            (c as Compatibility).to === r.name || (c as Compatibility).from === r.name ? undefined : c,
                        c => c
                    )
                )
            )
        case "group":
            const g = comp as Group
            const a = getGlobalGroups(state.added).contains(g)
                ? state.added
                : removeFromGroup(
                      state,
                      g.name,
                      "group",
                      getAllGroups(state.added)
                          .find(gr => gr.subgroups.has(g))
                          .map(gr => gr.name)
                          .getOrElse("")
                  )
            return a.filter(c => c.type !== "group" || (c as Group).name != g.name)
        case "constraint":
            (comp as Constraint).constraint === "compatibility"
                ? getAllGroups(state.added).foreach(g => g.constraints.delete(comp as Compatibility))
                : getAllGroups(state.added).foreach(g => g.constraints.delete(comp as Cardinality))
            return state.added
        default:
            return state.added
    }
}

/**
 * Add a new structural {@link Component} to the current ones.
 * @param state The current state of the structural specification.
 * @param comp The component to be added.
 * @returns The new state of the structural specification.
 */
export const add: (state: StructuralState, comp: Component) => StructuralState = (state, comp) => {
    return !state
        ? state
        : {
              added:
                  comp.type === "group" || comp.type === "role"
                      ? state.added.appended(comp)
                      : comp.type === "constraint" && (comp as Constraint).constraint === "compatibility"
                      ? compatibilityInGroup(state, comp as Compatibility)
                      : state.added,
              group: "",
              role: "",
              link: { to: "", from: "" },
              selected: state.selected.flatMap(s => getAllGroups(state.added).find(g => g.name === s.name)),
          }
}

const compatibilityInGroup: (state: StructuralState, comp: Compatibility) => List<Component> = (state, comp) => {
    getAllGroups(state.added)
        .find(g => g.name === splitName(comp.from).group)
        .apply((g: Group) => g.addConstraint(comp))
    return state.added
}

/**
 * Add a structural {@link Component} to a {@link Group}.
 * @param state The current state of the structural specification.
 * @param component The name of the {@link Component} to be added to a {@link Group}.
 * @param type The type of {@link Component} to be added.
 * @param group The destination {@link Group}.
 * @returns The new state of the diagram.
 */
export const addToGroup: (state: StructuralState, component: string, type: string, group: string) => List<Component> = (
    state,
    component,
    type,
    group
) => {
    const destinationGroup: Option<Group> = getAllGroups(state.added).find(c => c.name === group)
    if (type === "role") {
        destinationGroup
            .zip(
                getAllRoles(state.added).find(c => c.name === component),
                (g, r) => [g, r]
            )
            .apply(([g, r]) => {
                state.added = state.added.filter(c => c !== r)
                getAllGroups(state.added).foreach(c => c.roles.delete(r))
                g.addRole(new Role(separate(group)(shortName(r.name)), r.extends, r.min, r.max))
                g.roles = removeDuplicates<Role>(g.roles, c => c.name)
            })
    }
    if (type === "group") {
        const o = getAllGroups(state.added)
            .find(c => c.name === component)
            .get() as Group
        return destinationGroup
            .map((og: Group) =>
                defined(state.added)
                    .filter(c => c.type !== "group" || ((c as Group).name !== component && (c as Group).name !== group))
                    .appended(
                        new Group(
                            og.name,
                            og.min,
                            og.max,
                            new Set(Array.from(og.subgroups).filter(g => g.name !== o.name)).add(
                                new Group(o.name, o.min, o.max, o.subgroups, o.roles, o.constraints)
                            ),
                            og.roles,
                            og.constraints
                        )
                    )
            )
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
export const removeFromGroup: (
    state: StructuralState,
    component: string,
    type: string,
    group: string
) => List<Component> = (state, component, type, group) => {
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
    return g
        .flatMap(og =>
            comp.map(oc =>
                og.roles.size === 0 && og.subgroups.size === 0
                    ? defined(state.added)
                          .filter(c => c.type !== "group" || (c as Group).name !== og.name)
                          .appended(
                              oc.also(cc => {
                                  cc.name = shortName(cc.name)
                              })
                          )
                    : state.added.appended(
                          oc.also(cc => {
                              cc.name = shortName(cc.name)
                          })
                      )
            )
        )
        .getOrElse(state.added)
}

export const changeExtension: (state: StructuralState, role: string, extended: string) => List<Component> = (
    state,
    role,
    extended
) => {
    getAllRoles(state.added)
        .filter(r => shortName(r.name) === shortName(role))
        .foreach(r => {
            r.extends = getAllRoles(state.added)
                .find(r => shortName(r.name) === extended)
                .map((r: Role) => new Role(shortName(r.name), r.extends, r.min, r.max))
                .getOrElse(undefined)
        })
    return state.added
}
