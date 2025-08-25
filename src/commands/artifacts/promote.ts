import SfpCommand from '../../SfpCommand';
import { Messages } from '@salesforce/core';
import PromoteUnlockedPackageImpl from '../../core/package/promote/PromoteUnlockedPackageImpl'
import ArtifactFetcher from '../../core/artifacts/ArtifactFetcher';
import { ConsoleLogger } from '@flxbl-io/sfp-logger';
import SfpPackageBuilder from '../../core/package/SfpPackageBuilder';
import { PackageType } from '../../core/package/SfpPackage';
import { Flags, ux } from '@oclif/core';
const Table = require('cli-table');
import { loglevel, targetdevhubusername } from '../../flags/sfdxflags';
import { LoggerLevel } from '@flxbl-io/sfp-logger';
import { COLOR_HEADER } from '@flxbl-io/sfp-logger';
import SFPLogger from '@flxbl-io/sfp-logger';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@flxbl-io/sfp', 'promote');

export default class Promote extends SfpCommand {
    public static description = messages.getMessage('commandDescription');
    static aliases = ['orchestrator:promote']
    

    public static examples = [`$ sfp promote -d path/to/artifacts -v <org>`];

    protected static requiresDevhubUsername = true;

    public static flags = {
        targetdevhubusername,
        artifactdir: Flags.directory({
            required: true,
            char: 'd',
            description: messages.getMessage('artifactDirectoryFlagDescription'),
            default: 'artifacts',
        }),
       loglevel
    };

    public async execute() {
        SFPLogger.log(COLOR_HEADER('command: promote'));
        SFPLogger.log(COLOR_HEADER(`Artifact Directory: ${this.flags.artifactdir}`));
        SFPLogger.printHeaderLine('',COLOR_HEADER,LoggerLevel.INFO);

        //Refresh HubOrg Authentication
        await this.hubOrg.refreshAuth();

        let unpromotedPackages: { name: string; error: string }[] = [];
        try {
            let artifacts = ArtifactFetcher.fetchArtifacts(this.flags.artifactdir);

            if (artifacts.length === 0) {
                throw new Error(`No artifacts found at ${this.flags.artifactdir}`);
            }

            let result: boolean = true;
            let promotedPackages: string[] = [];
            for (let artifact of artifacts) {
                let sfpPackage = await SfpPackageBuilder.buildPackageFromArtifact(artifact, new ConsoleLogger());
                try {
                    if (sfpPackage.package_type === PackageType.Unlocked) {
                        let promoteUnlockedPackageImpl = new PromoteUnlockedPackageImpl(
                            artifact.sourceDirectoryPath,
                            sfpPackage.package_version_id,
                            this.hubOrg.getUsername()
                        );
                        await promoteUnlockedPackageImpl.promote();
                    }

                    promotedPackages.push(sfpPackage.packageName);
                } catch (err) {
                    result = false;

                    unpromotedPackages.push({
                        name: sfpPackage.packageName,
                        error: err.message,
                    });
                }
            }
            console.log(`Promoted packages:`, promotedPackages);

            // Overall exit status is 1 if a package failed to promote
            if (!result) {
                throw new Error();
            }
        } catch (err) {
            console.log(err.message);

            // Print unpromoted packages with reason for failure
            if (unpromotedPackages.length > 0) {
                const table = new Table({
                    head: ['Name', 'Error']
                });
                unpromotedPackages.forEach((pkg) => {
                    table.push([pkg.name, pkg.error]);
                });
                ux.stdout(table.toString());
            }

            // Fail the task when an error occurs
            process.exitCode = 1;
        }
    }

    private substituteBuildNumberWithPreRelease(packageVersionNumber: string) {
        let segments = packageVersionNumber.split('.');

        if (segments.length === 4) {
            packageVersionNumber = segments.reduce((version, segment, segmentsIdx) => {
                if (segmentsIdx === 3) return version + '-' + segment;
                else return version + '.' + segment;
            });
        }

        return packageVersionNumber;
    }
}
