import SFPLogger, { Logger, LoggerLevel } from '@flxbl-io/sfp-logger';
import * as fs from 'fs-extra';
import path = require('path');
import lodash = require('lodash');
import gitUrlParse = require('git-url-parse');
import SfpPackage from './SfpPackage';

/**
 * Methods for getting information about artifacts
 */
export default class SfpPackageInquirer {
    private _latestPackageManifestFromArtifacts: any;
    private _pathToLatestPackageManifestFromArtifacts: string;
    private _prunedLatestPackageManifestFromArtifacts: any;

    get pathToLatestPackageManifestFromArtifacts() {
        return this._pathToLatestPackageManifestFromArtifacts;
    }
    get prunedLatestPackageManifestFromArtifacts() {
        return this._prunedLatestPackageManifestFromArtifacts;
    }

    constructor(private readonly sfpPackages: SfpPackage[], private packageLogger?: Logger) {}

    public getLatestProjectConfig() {
        let latestPackageManifest = this.getLatestPackageManifestFromArtifacts(this.sfpPackages);

        if (latestPackageManifest) {
            this._latestPackageManifestFromArtifacts = latestPackageManifest.latestPackageManifest;
            this._pathToLatestPackageManifestFromArtifacts = latestPackageManifest.pathToLatestPackageManifest;

            this._prunedLatestPackageManifestFromArtifacts = this.pruneLatestPackageManifest(
                latestPackageManifest.latestPackageManifest,
                this.sfpPackages
            );
        }
        return this._latestPackageManifestFromArtifacts;
    }

    /**
     * Gets latest package manifest from artifacts
     * Returns null if unable to find latest package manifest
     */
    private getLatestPackageManifestFromArtifacts(
        sfpPackages: SfpPackage[]
    ): {
        latestPackageManifest: any;
        pathToLatestPackageManifest: string;
    } {
        let latestPackageManifest: any;
        let pathToLatestPackageManifest: string;

        this.validateArtifactsSourceRepository();

        let latestSfpPackage: SfpPackage;
        for (let sfpPackage of sfpPackages) {
            if (
                latestSfpPackage == null ||
                latestSfpPackage.creation_details.timestamp < sfpPackage.creation_details.timestamp
            ) {
                latestSfpPackage = sfpPackage;

                let pathToPackageManifest = path.join(sfpPackage.sourceDir, 'manifests', 'sfdx-project.json.ori');
                if (fs.existsSync(pathToPackageManifest)) {
                    latestPackageManifest = JSON.parse(fs.readFileSync(pathToPackageManifest, 'utf8'));

                    pathToLatestPackageManifest = pathToPackageManifest;
                }
            }
        }

        if (latestPackageManifest) {
            SFPLogger.log(
                `Found latest package manifest in ${latestSfpPackage.packageName} artifact`,
                LoggerLevel.INFO,
                this.packageLogger
            );

            return { latestPackageManifest, pathToLatestPackageManifest };
        } else return null;
    }

    /**
     * Verify that artifacts are from the same source repository
     */
    public validateArtifactsSourceRepository(): void {
        let remoteURL: gitUrlParse.GitUrl;

        for (let sfpPackage of this.sfpPackages) {
            let currentRemoteURL: gitUrlParse.GitUrl;

            try {
                currentRemoteURL = gitUrlParse(sfpPackage.repository_url);
            } catch (ex) {
                if (ex instanceof Error && ex.message === 'URL parsing failed.') {
                    throw new Error(
                        `Invalid repository URL for package '${sfpPackage.package_name}': ${sfpPackage.repository_url}`
                    );
                } else {
                    throw ex;
                }
            }

            if (remoteURL == null) {
                remoteURL = currentRemoteURL;
                continue;
            }

            const propertiesToVerify: string[] = [
                'source', 'full_name'
            ];

            for (let property of propertiesToVerify) {
                if (currentRemoteURL[property] !== remoteURL[property]) {
                    SFPLogger.log(
                        `remoteURL: ${JSON.stringify(remoteURL)}`,
                        LoggerLevel.DEBUG,
                        this.packageLogger
                    );
                    SFPLogger.log(
                        `currentRemoteURL: ${JSON.stringify(currentRemoteURL)}`,
                        LoggerLevel.DEBUG,
                        this.packageLogger
                    );
                    throw new Error(
                        `Artifacts must originate from the same source repository, for deployment to work. The artifact ${sfpPackage.packageName} has repository URL that doesn't meet the current repository URL ${JSON.stringify(currentRemoteURL)} not equal ${JSON.stringify(remoteURL)}`
                    );
                }
            }
        }
    }

    /**
     * Remove packages that do not have an artifact from the package manifest
     * @param latestPackageManifest
     * @param artifacts
     */
    private pruneLatestPackageManifest(latestPackageManifest: any, sfpPackages: SfpPackage[]) {
        let prunedLatestPackageManifest = lodash.cloneDeep(latestPackageManifest);

        let packagesWithArtifacts: string[] = [];
        sfpPackages.forEach((sfpPackage) => {
            packagesWithArtifacts.push(sfpPackage.packageName);
        });

        let i = prunedLatestPackageManifest.packageDirectories.length;
        while (i--) {
            if (!packagesWithArtifacts.includes(prunedLatestPackageManifest.packageDirectories[i].package)) {
                let removedPackageDirectory = prunedLatestPackageManifest.packageDirectories.splice(i, 1);

                // Also remove references to the package as a dependency
                prunedLatestPackageManifest.packageDirectories.forEach((pkg) => {
                    let indexOfDependency = pkg.dependencies?.findIndex(
                        (dependency) => dependency.package === removedPackageDirectory[0].package
                    );

                    if (indexOfDependency >= 0) pkg.dependencies.splice(indexOfDependency, 1);
                });
            }
        }

        return prunedLatestPackageManifest;
    }
}

interface RemoteURL {
    ref: string;
    hostName: string;
    pathName: string;
}
