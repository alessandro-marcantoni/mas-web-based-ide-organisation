import axios from 'axios'
import config from '../utils/config'
import { EntityGroup } from '../domain/entity'
import { List, toArray } from 'scala-types/dist/list/list'

const host = 'http://130.82.26.67:8080'

export const createOrganizationArtifacts = async (name: string, groups: List<EntityGroup>) => {
    await createOrgBoard(name)
    await Promise.all(toArray(groups.map(group => createGroupBoard(group.group.name, name))))
    await Promise.all(Array.from(subgroupsMap(groups).entries()).flatMap(([parent, subgroups]) =>
        subgroups.map(subgroup => addSubgroup(parent, subgroup))
    ))
    await createSchemeArtifact(name)
    await Promise.all(toArray(groups)
        .flatMap(group => Array.from(group.players.entries())
            .flatMap(([role, players]) => Array.from(players)
                .map(player => tellAgent(player, group.group.name, role)))))
    setTimeout(() => addSchemeToGroup(groups.get(0).group.name), 5000)
}

const createOrgBoard = async (name: string) =>
    await axios.post(host + '/workspaces/org_workspace/artifacts/' + name, {
        "template": "ora4mas.nopl.OrgBoard",
        "values": [`${config.BACKEND_URL}/specifications/${name}`]
    })

const createGroupBoard = async (name: string, organization: string) =>
    await axios.post(host + '/workspaces/org_workspace/artifacts/' + organization + "/operations/createGroup/execute",
        [name.toLowerCase(), name])

const addSubgroup = async (parent: string, subgroup: string) =>
    await axios.post(
        host + '/workspaces/org_workspace/artifacts/' + parent.toLowerCase() + "/operations/addSubgroup/execute",
        [subgroup, subgroup.toLowerCase(), parent.toLowerCase()])

const createSchemeArtifact = async (organization: string) =>
    await axios.post(host + '/workspaces/org_workspace/artifacts/' + organization + "/operations/createScheme/execute",
        [`orgscheme`, "orgScheme"])

const tellAgent = async (agent: string, group: string, role: string) =>
    await axios.post(host + '/agents/' + agent + "/inbox", {
        "performative": "achieve",
        "sender": "web-ide",
        "receiver": agent,
        "content": `participate(${group.toLowerCase()}, role_${role})`
    })

const subgroupsMap: (groups: List<EntityGroup>) => Map<string, Array<string>> = groups => {
    const map = new Map<string, Array<string>>()
    groups.foreach(group => {
        if (group.group.subgroups.size > 0) {
            map.set(group.group.name, Array.from(group.group.subgroups)
                .map(subgroup => subgroup.name)
                .filter(name => groups.map(group => group.group.name).contains(name)))
        }
    })
    return map
}

const addSchemeToGroup = async (group: string) =>
    await axios.post(
        host + '/workspaces/org_workspace/artifacts/' + group.toLowerCase() + "/operations/addScheme/execute",
        ["orgscheme"])
