import { expect } from '@jest/globals';
import SfpPackage from '../../../lib/core/package/SfpPackage';
import SfpPackageInquirer from '../../../src/core/package/SfpPackageInquirer';

describe('validateArtifactsSourceRepository', () => {
    describe('Given a bad repository URL, display', () => {
        it('should accept a good repository SSH URL', async () => {
            const repositoryUrl = 'git@github.com:flxbl-io/sfp-test.git';

            let sfpPackage: SfpPackage = new SfpPackage();
            sfpPackage.package_name = 'testPackageName';
            sfpPackage.repository_url = repositoryUrl;

            let sfpPackageInquirer = new SfpPackageInquirer([sfpPackage]);
            sfpPackageInquirer.validateArtifactsSourceRepository();
        });

        it('should accept a good repository SSH URL with a URL-encoded space', async () => {
            const repositoryUrl = 'git@github.com:flxbl-io/sfp%20test.git';

            let sfpPackage: SfpPackage = new SfpPackage();
            sfpPackage.package_name = 'testPackageName';
            sfpPackage.repository_url = repositoryUrl;

            let sfpPackageInquirer = new SfpPackageInquirer([sfpPackage]);
            sfpPackageInquirer.validateArtifactsSourceRepository();
        });

        it('should reject a bad repository SSH URL with a helpful error message', async () => {
            const repositoryUrl = 'git';

            const t = () => {
                let sfpPackage: SfpPackage = new SfpPackage();
                sfpPackage.package_name = 'testPackageName';
                sfpPackage.repository_url = repositoryUrl;

                let sfpPackageInquirer = new SfpPackageInquirer([sfpPackage]);
                sfpPackageInquirer.validateArtifactsSourceRepository();
            };

            expect(t).toThrow(Error);
            expect(t).toThrow("Invalid repository URL for package 'testPackageName': git");
        });
    });
});
