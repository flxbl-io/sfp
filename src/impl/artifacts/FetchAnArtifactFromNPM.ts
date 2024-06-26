import * as fs from 'fs-extra';
import child_process = require('child_process');
import path = require('path');
import FetchAnArtifact from './FetchAnArtifact';
import SFPLogger, { COLOR_WARNING, LoggerLevel } from '@flxbl-io/sfp-logger';

export class FetchAnArtifactFromNPM implements FetchAnArtifact {
    constructor(private scope: string, private npmrcPath: string) {
        //Check whether the user has already passed in @, and remove it
        this.scope = this.scope.replace(/@/g, '').toLowerCase();

        if (this.npmrcPath) {
            try {
                fs.copyFileSync(this.npmrcPath, path.resolve('.npmrc'));
            } catch (error) {
                throw new Error('We were unable to find or copy the .npmrc file as provided due to ' + error.message);
            }

            if (!fs.existsSync('package.json')) {
                // package json is required in the same directory as .npmrc
                fs.writeFileSync('package.json', '{}');
            }
        } else {
            if (fs.existsSync('.npmrc') && !fs.existsSync('package.json')) {
                fs.writeFileSync('package.json', '{}');
            }
        }
    }

    public fetchArtifact(
        packageName: string,
        artifactDirectory: string,
        version: string,
        isToContinueOnMissingArtifact: boolean
    ) {
        try {
            // NPM package names must be lowercase
            packageName = packageName.toLowerCase();

            let cmd: string;
            if (this.scope) cmd = `npm pack @${this.scope.toLowerCase()}/${packageName}_sfpowerscripts_artifact`;
            else cmd = `npm pack ${packageName}_sfpowerscripts_artifact`;

            cmd += `@${version}`;

            SFPLogger.log(`Fetching ${packageName} using ${cmd}`,LoggerLevel.INFO);

            child_process.execSync(cmd, {
                cwd: artifactDirectory,
                stdio: 'pipe',
            });
        } catch (error) {
            SFPLogger.log(
                COLOR_WARNING(
                    `Artifact  for ${packageName} not found in the  NPM Registry provided, This might result in deployment failures, Try running with trace log level for more information`
                ),
                LoggerLevel.INFO
            );

            SFPLogger.log(
                error,
                LoggerLevel.TRACE
            );


            if (!isToContinueOnMissingArtifact) throw error;
        }
    }
}
