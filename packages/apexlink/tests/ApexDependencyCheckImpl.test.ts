import { jest, expect } from '@jest/globals';
import { ConsoleLogger } from '@flxblio/sfp-logger';
import ApexDepedencyCheckImpl from '../src/ApexDepedencyCheckImpl';
import path from 'path';

describe('Given a directory with apex classes, ',  () => {
    it('it should provide the dependendencies of apex class', async () => {

        const apexLinkImpl = new ApexDepedencyCheckImpl(new ConsoleLogger(), path.join(__dirname,`/resources/feature-mgmt`));
        const result = await apexLinkImpl.execute();
        expect(result.dependencies).toContainEqual({ "name": "AlwaysEnabledFeature", "dependencies": ["Feature"]});
        
    },30000);
});

describe('Given a directory with no apex classes, ',  () => {
    it('it should provide an empty array', async () => {

        const apexLinkImpl = new ApexDepedencyCheckImpl(new ConsoleLogger(), path.join(__dirname,`/resources/core-crm`));
        const result = await apexLinkImpl.execute();
        expect(result.dependencies.length).toEqual(0);
        
    },50000);
});