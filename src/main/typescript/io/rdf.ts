import axios from 'axios'
import N3 from 'n3'

export const parse = (data: string) => {
    return new N3.Parser().parse(data)
}

export const getAgentsInWorkspace = async (workspaceId: string) => {
    const workspace = (await axios.get('http://localhost:8080/workspaces/' + workspaceId)).data
    const artifactsNames = parse(workspace)
        .filter(q => q._subject.id === `http://localhost:8080/workspaces/102`)
        .filter(q => q._predicate.id === `https://ci.mines-stetienne.fr/hmas/core#directlyContains`)
        .map(q => q._object.id)
    const artifacts = await Promise.all(artifactsNames
        .map(a => axios.get(a)))
    return artifacts
        .map((a, i) => [artifactsNames[i], parse(a.data)])
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, a]) => a.some(q => q._object.id === `http://example.org/Body`))
        .flatMap(([n, a]) => a
            .filter(q => q._predicate.id === `https://www.w3.org/2019/wot/td#title`)
            .filter(q => q._subject.id === n)
            .map(q => q._object.id)
        )
        .map(a => a.substring(6))
}