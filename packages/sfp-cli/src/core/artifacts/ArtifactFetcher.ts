import path = require('path');
import * as fs from 'fs-extra';
import SFPLogger, { Logger, LoggerLevel } from '@flxblio/sfp-logger';
import { globSync } from 'glob';
import AdmZip = require('adm-zip');
import semver = require('semver');
import tar = require('tar');

export default class ArtifactFetcher {
    /**
     * Decider for which artifact retrieval method to use
     * Returns empty array if no artifacts are found
     * @param artifactDirectory
     * @param sfdx_package
     */
    public static fetchArtifacts(artifactDirectory: string, sfdx_package?: string, logger?: Logger): Artifact[] {
        const result: Artifact[] = [];

        if (!fs.existsSync(artifactDirectory)) {
            throw new Error(`Artifact directory ${path.resolve(artifactDirectory)} does not exist`);
        }

        const artifacts: string[] = this.findArtifacts(artifactDirectory, sfdx_package);

        SFPLogger.log(`Artifacts: ${JSON.stringify(artifacts)}`, LoggerLevel.TRACE, logger);

        for (const artifact of artifacts) {
            let artifactFilePaths: Artifact;
            if (path.extname(artifact) === '.zip') {
                artifactFilePaths = ArtifactFetcher.fetchArtifactFilePathsFromZipFile(artifact);
            } else if (path.extname(artifact) === '.tgz') {
                artifactFilePaths = ArtifactFetcher.fetchArtifactFilePathsFromTarball(artifact);
            } else {
                throw new Error(`Unhandled artifact format ${artifact}, neither tar or zip file`);
            }
            result.push(artifactFilePaths);
        }

        return result;
    }

    /**
     * Helper method for retrieving the ArtifactFilePaths of an artifact folder
     * @param packageMetadataFilePath
     */
    private static fetchArtifactFilePathsFromFolder(packageMetadataFilePath: string): Artifact {
        const sourceDirectory = path.join(path.dirname(packageMetadataFilePath), `source`);

        const changelogFilePath = path.join(path.dirname(packageMetadataFilePath), `changelog.json`);

        const artifactFilePaths: Artifact = {
            packageMetadataFilePath: packageMetadataFilePath,
            sourceDirectoryPath: sourceDirectory,
            changelogFilePath: changelogFilePath,
        };

        ArtifactFetcher.existsArtifactFilepaths(artifactFilePaths);

        return artifactFilePaths;
    }

    /**
     * Helper method for retrieving ArtifactFilePaths of an artifact zip
     * @param artifact
     */
    private static fetchArtifactFilePathsFromZipFile(artifact: string): Artifact {
        const unzippedArtifactsDirectory: string = `.sfpowerscripts/unzippedArtifacts/${this.makefolderid(8)}`;

        fs.mkdirpSync(unzippedArtifactsDirectory);
        const zip = new AdmZip(artifact);

        // Overwrite existing files
        zip.extractAllTo(unzippedArtifactsDirectory, true);

        const artifactName: string = path.basename(artifact).match(/.*sfpowerscripts_artifact/)?.[0];
        if (artifactName == null) {
            throw new Error(`Failed to fetch artifact file paths for ${artifact}`);
        }

        const packageMetadataFilePath = path.join(unzippedArtifactsDirectory, artifactName, 'artifact_metadata.json');

        const sourceDirectory = path.join(unzippedArtifactsDirectory, artifactName, `source`);

        const changelogFilePath = path.join(unzippedArtifactsDirectory, artifactName, `changelog.json`);

        const artifactFilePaths: Artifact = {
            packageMetadataFilePath: packageMetadataFilePath,
            sourceDirectoryPath: sourceDirectory,
            changelogFilePath: changelogFilePath,
        };

        ArtifactFetcher.existsArtifactFilepaths(artifactFilePaths);

        return artifactFilePaths;
    }

    /**
     * Helper method for retrieving ArtifactFilePaths of a tarball
     * @param artifact
     */
    private static fetchArtifactFilePathsFromTarball(artifact: string): Artifact {
        const unzippedArtifactsDirectory: string = `.sfpowerscripts/unzippedArtifacts/${this.makefolderid(8)}`;
        fs.mkdirpSync(unzippedArtifactsDirectory);

        tar.x({
            file: artifact,
            cwd: unzippedArtifactsDirectory,
            sync: true,
        });

        const packageMetadataFilePath = path.join(unzippedArtifactsDirectory, 'package', 'artifact_metadata.json');

        const sourceDirectory = path.join(unzippedArtifactsDirectory, 'package', `source`);

        const changelogFilePath = path.join(unzippedArtifactsDirectory, 'package', `changelog.json`);

        const artifactFilePaths: Artifact = {
            packageMetadataFilePath: packageMetadataFilePath,
            sourceDirectoryPath: sourceDirectory,
            changelogFilePath: changelogFilePath,
        };

        ArtifactFetcher.existsArtifactFilepaths(artifactFilePaths);

        return artifactFilePaths;
    }

    /**
     * Find zip and tarball artifacts
     * Artifact format/s:
     * sfpowerscripts_artifact_<version>.zip,
     * [sfdx_package]_sfpowerscripts_artifact_[version].zip,
     * [sfdx_package]_sfpowerscripts_artifact_[version].tgz
     */
    public static findArtifacts(artifactDirectory: string, sfdx_package?: string): string[] {
        let pattern: string;
        if (sfdx_package) {
            pattern = `**/*${sfdx_package}_sfpowerscripts_artifact*.@(zip|tgz)`;
        } else {
            pattern = `**/*sfpowerscripts_artifact*.@(zip|tgz)`;
        }

        const artifacts: string[] = globSync(pattern, {
            cwd: artifactDirectory,
            absolute: true,
        });

        if (sfdx_package && artifacts.length > 1) {
            SFPLogger.log(`Found more than one artifact for ${sfdx_package}`, LoggerLevel.INFO);
            const latestArtifact: string = ArtifactFetcher.getLatestArtifact(artifacts);
            SFPLogger.log(`Using latest artifact ${latestArtifact}`, LoggerLevel.INFO);
            return [latestArtifact];
        } else return artifacts;
    }

    /**
     * Get the artifact with the latest semantic version
     * @param artifacts
     */
    private static getLatestArtifact(artifacts: string[]) {
        // Consider zip & tarball artifacts only
        artifacts = artifacts.filter((artifact) => {
            const ext: string = path.extname(artifact);
            return ext === '.zip' || ext === '.tgz';
        });

        const pattern = new RegExp('(?:^.*)(?:_sfpowerscripts_artifact[_-])(?<version>.*)(?:\\.zip|\\.tgz)$');
        const versions: string[] = artifacts.map((artifact) => {
            const match: RegExpMatchArray = path.basename(artifact).match(pattern);
            const version = match?.groups.version;

            if (version) return version;
            else throw new Error('Corrupted artifact detected with no version number');
        });

        // Pick artifact with latest semantic version
        const sortedVersions: string[] = semver.sort(versions);
        const latestVersion: string = sortedVersions.pop();

        return artifacts.find((artifact) => artifact.includes(latestVersion));
    }

    /**
     * Verify that artifact filepaths exist on the file system
     * @param artifactFilePaths
     */
    private static existsArtifactFilepaths(artifactFilePaths: Artifact): void {
        Object.values(artifactFilePaths).forEach((filepath) => {
            if (!fs.existsSync(filepath)) throw new Error(`Artifact filepath ${filepath} does not exist`);
        });
    }

    /**
     * Decider for task outcome if the artifact cannot be found
     * @param artifacts_filepaths
     * @param isToSkipOnMissingArtifact
     */
    public static missingArtifactDecider(artifacts: Artifact[], isToSkipOnMissingArtifact: boolean): boolean {
        if (artifacts.length === 0 && !isToSkipOnMissingArtifact) {
            throw new Error(`Artifact not found, Please check the inputs`);
        } else if (artifacts.length === 0 && isToSkipOnMissingArtifact) {
            SFPLogger.log(
                `Skipping task as artifact is missing, and 'Skip If no artifact is found' ${isToSkipOnMissingArtifact}`
            );
            return true;
        }
    }

    private static makefolderid(length): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

export interface Artifact {
    packageMetadataFilePath: string;
    sourceDirectoryPath?: string;
    changelogFilePath?: string;
}
