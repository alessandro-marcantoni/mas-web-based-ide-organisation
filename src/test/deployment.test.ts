import { list } from 'scala-types/dist/list/list';
import { deployOrganization } from '../main/typescript/io/artifacts';

describe("deploy an organization", () => {
    test("deploy on Yggdrasil", async () => {
        await deployOrganization("test", list())
    })
})