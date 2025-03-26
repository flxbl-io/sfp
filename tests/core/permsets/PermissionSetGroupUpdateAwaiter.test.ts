import { MockTestOrgData, TestContext } from '../../../node_modules/@salesforce/core/lib/testSetup';
import { AuthInfo, Connection, OrgConfigProperties } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
const $$ = new TestContext();
import PermissionSetGroupUpdateAwaiter from '../../../src/core/permsets/PermissionSetGroupUpdateAwaiter';
import { expect } from '@jest/globals';
import ProjectConfig from '../../../src/core/project/ProjectConfig';

describe('Await till permissionsets groups are updated', () => {
    it('should return if all permsets groups are updated', async () => {
        const testData = new MockTestOrgData();

        await $$.stubConfig({ [OrgConfigProperties.TARGET_ORG]: testData.username });
        await $$.stubAuths(testData);
        $$.setConfigStubContents('AuthInfoConfig', {
            contents: await testData.getConfig(),
        });
        $$.stubAliases({});

        let records: AnyJson = {
            records: [],
        };
        $$.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
            return Promise.resolve(records);
        };

        const connection: Connection = await Connection.create({
            authInfo: await AuthInfo.create({ username: testData.username }),
        });

        // Stub the ProjectConfig.getSFDXProjectConfig method
        const projectConfig = {
            plugins: {
                sfp: {
                    permissionsetGroupStatusCheckInterval: 6000,
                    permissionsetGroupTimeout: 60000
                }
            }
        };
        $$.SANDBOX.stub(ProjectConfig, 'getSFDXProjectConfig').returns(projectConfig);

        let permissionSetGroupUpdateAwaiter: PermissionSetGroupUpdateAwaiter = new PermissionSetGroupUpdateAwaiter(
            connection,
            null,
            projectConfig.plugins.sfp.permissionsetGroupStatusCheckInterval,
            projectConfig.plugins.sfp.permissionsetGroupTimeout
        );
        await expect(permissionSetGroupUpdateAwaiter.waitTillAllPermissionSetGroupIsUpdated()).resolves.toBeUndefined();
    });
});
