import { List } from "scala-types/dist/list/list";
import { EntityGroup } from "../domain/entity";
import config from "../utils/config";
import axios from "axios";

const agent = "https://example.com/web-ide#me"
const workspace = "102"

export const deployOrganization = async (name: string, organization: List<EntityGroup>) => {
    console.log(organization);
    
    await createWorkspace(workspace)
    await createOrganizationArtifact(name)
}

const createWorkspace = async (name: string) => {
    console.log(config.RUNTIME_URL);
    
    await fetch(`${config.RUNTIME_URL}/workspaces/test`, {
        method: "POST",
        headers: workspaceHeaders(name)
    })
}

const createOrganizationArtifact = async (organization: string) => {
    await axios.post(`${config.RUNTIME_URL}/workspaces/${workspace}/artifacts`, {
        "artifactClass": "http://example.org/OrgBoard",
        "artifactName": organization,
        "initParams": [`${config.BACKEND_URL}/specifications/${organization}}`]
    }, genericRequestConfig)
}

const workspaceHeaders = (name: string) => {
    return {
        "Slug": name,
    }
}

const genericRequestConfig = {
    headers: {
        "X-Agent-WebID": agent,
        "Content-Type": "application/json"
    }
}