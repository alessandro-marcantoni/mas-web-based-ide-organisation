import {StructuralState} from "../main/components/Structural";
import {
    fromSet, getAllRoles, getCompatibilities, getGlobalGroups, separate
} from "../main/utils/structural/utils";
import {none} from "scala-types/dist/option/option";
import {Component, Group, Role} from "../main/utils/structural/entities";
import {List, list} from "scala-types/dist/list/list";
import {add, addToGroup, createComponent, removeComponent, removeFromGroup} from "../main/utils/structural/diagram";

let globalState: StructuralState = {
    components: list(), added: list(),
    showRoleModal: false, showGroupModal: false,
    role: "", roleExtension: "", subgroupOf: "", group: "",
    link: { from: "", to: "" }, selected: none()
}

describe("create a structural specification", () => {
    describe("crate components", () => {
        test("create a simple role", () => {
            createRole("Role1", "")
        })
        test("create a role with extends", () => {
            createRole("Role2", "Role1")
            globalState.components.find(c => c.type === "role" && (c as Role).name === "Role2").apply(r => {
                expect((r as Role).extends.name === "Role1")
            })
        })
        test("create a group", () => {
            createGroup("Group1")
        })
        test("create a second group", () => {
            createGroup("Group2")
        })
    })
    describe("add components", () => {
        test("add a role", () => {
            globalState.components.find(c => c.type === "role" && (c as Role).name === "Role1")
                .apply(c => {
                    globalState.role = (c as Role).name
                    addComponent(c)
                })
        })
        test("add a second role", () => {
            globalState.role = "Role2"
            globalState.components.find(c => c.type === "role" && (c as Role).name === "Role2")
                .apply(c => addComponent(c))
        })
        test("add a group", () => {
            globalState.group = "Group1"
            globalState.components.find(c => c.type === "group" && (c as Group).name === "Group1")
                .apply(c => addComponent(c))
        })
        test("add a second group", () => {
            globalState.group = "Group2"
            globalState.components.find(c => c.type === "group" && (c as Group).name === "Group2")
                .apply(c => addComponent(c))
        })
    })
    describe("move components", () => {
        test("add role to group", () => {
            const added = addToGroup(globalState, "Role1", "role", "Group1")
            assertRoleCorrectlyInGroup(globalState.added, added, "Role1", "Group1")
            assertLinksUpdatedInAddition(globalState.added, added, "Role1", "Group1")
            globalState.added = added
        })
        test("add another role to another group", () => {
            const added = addToGroup(globalState, "Role2", "role", "Group2")
            assertRoleCorrectlyInGroup(globalState.added, added, "Role2", "Group2")
            assertLinksUpdatedInAddition(globalState.added, added, "Role2", "Group2")
            globalState.added = added
        })
        test("add group to group", () => {
            const added = addToGroup(globalState, "Group1", "group", "Group2")
            assertGroupCorrectlyInGroup(globalState.added, added, "Group1", "Group2")
            globalState.added = added
        })
        test("remove group from group", () => {
            const added = removeFromGroup(globalState, "Group1", "group", "Group2")
            assertGroupCorrectlyOutOfGroup(globalState.added, added, "Group1", "Group2")
            globalState.added = added
        })
        test("remove role from group", () => {
            const added = removeFromGroup(globalState, separate("Group2")("Role2"), "role", "Group2")
            assertRoleCorrectlyOutOfGroup(globalState.added, added, "Role2", "Group2")
            assertLinksUpdatedInRemoval(globalState.added, added, "Role2", "Group2")
            globalState.added = added
        })
    })
    describe("remove components", () => {
        test("remove a role", () => {
            getAllRoles(globalState.added).find(c => c.name === separate("Group1")("Role1")).apply((r: Role) => {
                const added = removeComponent(globalState, "role", r)
                expect(getAllRoles(added).find(c => c.name === r.name).isDefined()).toBeFalsy()
            })
        })
    });
})

const createRole: (name: string, extend: string) => void = (name, extend) => {
    globalState.role = name
    globalState.roleExtension = extend
    createComponent(globalState, "role", "", "", "", false).apply(c => {
        const newState = add(globalState, c, false)
        creationAssertions(globalState, newState, "role", name)
        globalState = newState
    })
}

const createGroup: (name: string) => void = (name) => {
    globalState.group = name
    createComponent(globalState, "group", "", "", "", false).apply(c => {
        const newState = add(globalState, c, false)
        creationAssertions(globalState, newState, "group", name)
        globalState = newState
    })
}

const creationAssertions: (oldState: StructuralState, newState: StructuralState, type: string, name: string) => void =
    (oldState, newState, type, name) => {
        expect(oldState.added.size()).toBe(newState.added.size())
        expect(oldState.components.size()).toBeLessThan(newState.components.size())
        expect(newState.components.exists(c => c.type === type && (type === "group" ? c as Group : c as Role).name === name)).toBeTruthy()
    }

const addComponent: (component: Component) => void = (component) =>
    createComponent(globalState, component.type, "", "", "", true).apply(c => {
        const newState = add(globalState, c, true)
        additionAssertions(globalState, newState, component.type, (component.type === "group" ? component as Group : component as Role).name)
        globalState = newState
    })

const additionAssertions: (oldState: StructuralState, newState: StructuralState, type: string, name: string) => void =
    (oldState, newState, type, name) => {
        expect(oldState.added.size()).toBeLessThan(newState.added.size())
        expect(oldState.components.size()).toBe(newState.components.size())
        expect(newState.added.exists(c => c.type === type && (type === "group" ? c as Group : c as Role).name === name)).toBeTruthy()
    }

const assertRoleCorrectlyInGroup: (oldState: List<Component>, newState: List<Component>, role: string, group: string) => void =
    (oldState, newState, role, group) => {
        expect(oldState.find(c => c.type === "role" && (c as Role).name === role).isDefined()).toBeTruthy()
        expect(newState.find(c => c.type === "role" && (c as Role).name === role).isEmpty()).toBeTruthy()
        expect(getGlobalGroups(oldState).find(c => c.name === group).isDefined())
            .toBe(getGlobalGroups(newState).find(c => c.name === group).isDefined())
        getGlobalGroups(newState).find(c => c.name === group).apply((g: Group) => {
            expect(g.roles.size).toBeGreaterThan(0)
            oldState.find(c => c.type === "role" && (c as Role).name === role).apply(r => {
                expect(fromSet(g.roles).exists(e => e.name === separate(g.name)(r.name))).toBeTruthy()
            })
        })
    }

const assertGroupCorrectlyInGroup: (oldState: List<Component>, newState: List<Component>, moved: string, group: string) => void =
    (oldState, newState, moved, group) => {
        expect(getGlobalGroups(oldState).find(c => c.name === moved).isDefined()).toBeTruthy()
        expect(getGlobalGroups(newState).find(c => c.name === moved).isEmpty()).toBeTruthy()
        expect(getGlobalGroups(oldState).find(c => c.name === group).isDefined())
            .toBe(getGlobalGroups(newState).find(c => c.name === group).isDefined())
        getGlobalGroups(newState).find(c => c.name === group).apply((g: Group) => {
            expect(g.subgroups.size).toBeGreaterThan(0)
            expect(fromSet(g.subgroups).exists(e => e.name === moved)).toBeTruthy()
        })
    }

const assertLinksUpdatedInAddition: (oldState: List<Component>, newState: List<Component>, role: string, group: string) => void =
    (oldState, newState, role, group) => {
        // If there's a compatibility connected to the role, its name should be updated.
        if (getCompatibilities(oldState).exists(c => c.from === role || c.to === role)) {
            expect(getCompatibilities(oldState).count(c => c.from === role || c.to === role))
                .toBe(getCompatibilities(newState).count(c => c.from === separate(group)(role) || c.to === separate(group)(role)))
        }
    }

const assertLinksUpdatedInRemoval: (oldState: List<Component>, newState: List<Component>, role: string, group: string) => void =
    (oldState, newState, role, group) => {
        // If there's a compatibility connected to the role, its name should be updated.
        if (getCompatibilities(oldState).exists(c => c.from === separate(group)(role) || c.to === separate(group)(role))) {
            expect(getCompatibilities(oldState).count(c => c.from === separate(group)(role) || c.to === separate(group)(role)))
                .toBe(getCompatibilities(newState).count(c => c.from === role || c.to === role))
        }
    }

const assertGroupCorrectlyOutOfGroup: (oldState: List<Component>, newState: List<Component>, moved: string, group: string) => void =
    (oldState, newState, moved, group) => {
        expect(getGlobalGroups(oldState).find(c => c.name === moved).isEmpty()).toBeTruthy()
        expect(getGlobalGroups(newState).find(c => c.name === moved).isDefined()).toBeTruthy()
        getGlobalGroups(newState).find(c => c.name === group).apply((g: Group) => {
            expect(fromSet(g.subgroups).exists(s => s.name === moved)).toBeFalsy()
        })
    }

const assertRoleCorrectlyOutOfGroup: (oldState: List<Component>, newState: List<Component>, role: string, group: string) => void =
    (oldState, newState, role, group) => {
        expect(oldState.find(c => c.type === "role" && (c as Role).name === role).isEmpty()).toBeTruthy()
        expect(newState.find(c => c.type === "role" && (c as Role).name === role).isDefined()).toBeTruthy()
        getGlobalGroups(newState).find(c => c.name === group).apply((g: Group) => {
            expect(fromSet(g.roles).exists(r => r.name === role)).toBeFalsy()
        })
    }
