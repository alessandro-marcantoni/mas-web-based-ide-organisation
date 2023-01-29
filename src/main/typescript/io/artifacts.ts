import { List, toArray } from "scala-types/dist/list/list";
import { EntityGroup } from "../domain/entity";
import config from "../utils/config";
import axios from "axios";

const agent = "https://example.com/web-ide#me"
const workspace = "102"

export const deployOrganization = async (name: string, organization: List<EntityGroup>) => {
    await createOrganizationArtifact(name)
    await Promise.all(toArray(organization.map(group => createGroupArtifact(group.group.name, name))))
    await Promise.all(Array.from(subgroupsMap(organization).entries()).flatMap(([parent, subgroups]) =>
        subgroups.map(subgroup => addSubgroup(parent, subgroup))
    ))
    await Promise.all(toArray(organization)
        .flatMap(group => Array.from(group.players.entries())
            .flatMap(([role, players]) => Array.from(players)
                .map(player => tellAgent(player, group.group.name, role)))))
    await createSchemeArtifact(name)
    setTimeout(async () => {
        await addSchemeToGroup(organization.get(0)?.group?.name ?? "")
        await axios.post(`${config.RUNTIME_URL}/workspaces/${workspace}/artifacts/${name}/createNormativeBoard`,
            ["normativeboard"], genericRequestConfig)
    }, 5000)
}

const createOrganizationArtifact = async (organization: string) => {
    await axios.post(`${config.RUNTIME_URL}/workspaces/${workspace}/artifacts/`, {
        "artifactClass": "http://example.org/OrgBoard",
        "artifactName": organization,
        "initParams": [`${config.BACKEND_URL}/specifications/${organization}`]
    }, genericRequestConfig)
}

const createGroupArtifact = async (group: string, organization: string) =>
    await axios.post(`${config.RUNTIME_URL}/workspaces/${workspace}/artifacts/${organization}/createGroup`,
    [group.toLowerCase(), group], genericRequestConfig)

const addSubgroup = async (parent: string, subgroup: string) =>
    await axios.post(`${config.RUNTIME_URL}/workspaces/${workspace}/artifacts/${subgroup.toLowerCase()}/setParentGroup`,
    [parent.toLowerCase()], genericRequestConfig)

const tellAgent = async (agent: string, group: string, role: string) =>
    await axios.post(`${config.RUNTIME_URL}/agents/${agent}/message`,
    {
        "groupId": group.toLowerCase(),
        "role": "role_" + role,
        "group": config.RUNTIME_URL + "/workspaces/" + workspace + "/artifacts/" + group.toLowerCase(),
        "agentId": config.RUNTIME_URL + "/agents/" + agent,
        "group2Id": "farmgroup",
        "group2": config.RUNTIME_URL + "/workspaces/" + workspace + "/artifacts/farmgroup"
    }, genericRequestConfig)

const createSchemeArtifact = async (organization: string) =>
    await axios.post(`${config.RUNTIME_URL}/workspaces/${workspace}/artifacts/${organization}/createScheme`,
    ["orgscheme", "orgScheme"], genericRequestConfig)

const addSchemeToGroup = async (group: string) =>
    await axios.post(`${config.RUNTIME_URL}/workspaces/${workspace}/artifacts/${group.toLowerCase()}/addScheme`,
    ["orgscheme"], genericRequestConfig)

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

const genericRequestConfig = {
    headers: {
        "X-Agent-WebID": agent,
        "Content-Type": "application/json"
    }
}