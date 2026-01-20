import { MockTestOrgData, TestContext } from '../../../node_modules/@salesforce/core/lib/testSetup';
import { AuthInfo, Connection, OrgConfigProperties } from '@salesforce/core';
import { ConsoleLogger } from '@flxbl-io/sfp-logger';
import { AnyJson } from '@salesforce/ts-types';
const $$ = new TestContext();
import PermissionSetGroupUpdateAwaiter from '../../../src/core/permsets/PermissionSetGroupUpdateAwaiter';
import { expect } from '@jest/globals';

describe('Await till permissionsets groups are updated', () => {
    const noUpdatingPsgRecords: AnyJson = {
        records: [],
    };
    const someUpdatingPsgRecords: AnyJson = {
        records: [
            {
                attributes: {
                    type: 'PermissionSetGroup',
                    url: '/services/data/v64.0/sobjects/PermissionSetGroup/0PG250000008nhNGAQ',
                },
                Id: '0PG250000008nhNGAQ',
                MasterLabel: 'PSG1',
                Status: 'Updating',
            },
            {
                attributes: {
                    type: 'PermissionSetGroup',
                    url: '/services/data/v64.0/sobjects/PermissionSetGroup/0PG250000008nnVGAQ',
                },
                Id: '0PG250000008nnVGAQ',
                MasterLabel: 'PSG2',
                Status: 'Updating',
            },
        ],
    };

    jest.spyOn(require('../../../src/core/utils/Delay'), 'delay').mockImplementation(() => Promise.resolve());

    it('should return if all permsets groups are updated', async () => {
        const testData = new MockTestOrgData();

        await $$.stubConfig({ [OrgConfigProperties.TARGET_ORG]: testData.username });
        await $$.stubAuths(testData);
        $$.setConfigStubContents('AuthInfoConfig', {
            contents: await testData.getConfig(),
        });

        $$.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
            return Promise.resolve(noUpdatingPsgRecords);
        };

        const connection: Connection = await Connection.create({
            authInfo: await AuthInfo.create({ username: testData.username }),
        });

        let permissionSetGroupUpdateAwaiter: PermissionSetGroupUpdateAwaiter = new PermissionSetGroupUpdateAwaiter(
            connection, new ConsoleLogger()
        );
        await expect(permissionSetGroupUpdateAwaiter.waitTillAllPermissionSetGroupIsUpdated()).resolves.toBeUndefined();
    });

    it('should return if all permsets groups are updated after waiting for some time', async () => {
        const testData = new MockTestOrgData();

        await $$.stubConfig({ [OrgConfigProperties.TARGET_ORG]: testData.username });
        await $$.stubAuths(testData);
        $$.setConfigStubContents('AuthInfoConfig', {
            contents: await testData.getConfig(),
        });

        let tryCount = 0;
        $$.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
            if (tryCount === 0) {
                tryCount++;
                return Promise.resolve(someUpdatingPsgRecords);
            }
            return Promise.resolve(noUpdatingPsgRecords);
        };

        const connection: Connection = await Connection.create({
            authInfo: await AuthInfo.create({ username: testData.username }),
        });

        let permissionSetGroupUpdateAwaiter: PermissionSetGroupUpdateAwaiter = new PermissionSetGroupUpdateAwaiter(
            connection,
            new ConsoleLogger()
        );
        await expect(permissionSetGroupUpdateAwaiter.waitTillAllPermissionSetGroupIsUpdated()).resolves.toBeUndefined();
    });

    it('should keep trying until all permsets groups are updated if there is no maximum wait time', async () => {
        const testData = new MockTestOrgData();

        await $$.stubConfig({ [OrgConfigProperties.TARGET_ORG]: testData.username });
        await $$.stubAuths(testData);
        $$.setConfigStubContents('AuthInfoConfig', {
            contents: await testData.getConfig(),
        });

        let tryCount = 0;
        $$.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
            if (tryCount < 5) {
                // 5th try
                tryCount++;
                return Promise.resolve(someUpdatingPsgRecords);
            }
            return Promise.resolve(noUpdatingPsgRecords);
        };

        const connection: Connection = await Connection.create({
            authInfo: await AuthInfo.create({ username: testData.username }),
        });

        let permissionSetGroupUpdateAwaiter: PermissionSetGroupUpdateAwaiter = new PermissionSetGroupUpdateAwaiter(
            connection,
            new ConsoleLogger()
        );
        await expect(permissionSetGroupUpdateAwaiter.waitTillAllPermissionSetGroupIsUpdated()).resolves.toBeUndefined();
        expect(tryCount).toBe(5);
    });

    it('should keep trying until until max wait time is reached', async () => {
        const testData = new MockTestOrgData();

        await $$.stubConfig({ [OrgConfigProperties.TARGET_ORG]: testData.username });
        await $$.stubAuths(testData);
        $$.setConfigStubContents('AuthInfoConfig', {
            contents: await testData.getConfig(),
        });

        $$.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
            return Promise.resolve(someUpdatingPsgRecords);
        };

        const connection: Connection = await Connection.create({
            authInfo: await AuthInfo.create({ username: testData.username }),
        });

        process.env.PSG_AWAITER_TIMEOUT_MINUTES = '0.25'; // 15 seconds
        let permissionSetGroupUpdateAwaiter: PermissionSetGroupUpdateAwaiter = new PermissionSetGroupUpdateAwaiter(
            connection,
            new ConsoleLogger(),
            100, // try every 100ms
        );
        await expect(permissionSetGroupUpdateAwaiter.waitTillAllPermissionSetGroupIsUpdated()).resolves.toBeUndefined();
    });

    it('should not reach maximum time if all permsets groups udpated', async () => {
        const testData = new MockTestOrgData();

        await $$.stubConfig({ [OrgConfigProperties.TARGET_ORG]: testData.username });
        await $$.stubAuths(testData);
        $$.setConfigStubContents('AuthInfoConfig', {
            contents: await testData.getConfig(),
        });

        let tryCount = 0;
        $$.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
            if (tryCount < 3) {
                // 3rd try in 300ms
                tryCount++;
                return Promise.resolve(someUpdatingPsgRecords);
            }
            return Promise.resolve(noUpdatingPsgRecords);
        };

        

        const connection: Connection = await Connection.create({
            authInfo: await AuthInfo.create({ username: testData.username }),
        });

        process.env.PSG_AWAITER_TIMEOUT_MINUTES = '0.5'; // 30 seconds
        let permissionSetGroupUpdateAwaiter: PermissionSetGroupUpdateAwaiter = new PermissionSetGroupUpdateAwaiter(
            connection,
            new ConsoleLogger(),
            100, // try every 100ms
        );
        await expect(permissionSetGroupUpdateAwaiter.waitTillAllPermissionSetGroupIsUpdated()).resolves.toBeUndefined();
        expect(tryCount).toBe(3); // 4 tries in total, first and then waiting 3 times
    });
});

 