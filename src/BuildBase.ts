import ArtifactGenerator from './core/artifacts/generators/ArtifactGenerator';

import { EOL } from 'os';
import SfpCommand from './SfpCommand';
import { Messages } from '@salesforce/core';
import fs = require('fs');
import SFPStatsSender from './core/stats/SFPStatsSender';
import BuildImpl, { BuildProps } from './impl/parallelBuilder/BuildImpl';
import ProjectConfig from './core/project/ProjectConfig';
import { Stage } from './impl/Stage';
import SFPLogger, {
    COLOR_ERROR,
    COLOR_HEADER,
    COLOR_INFO,
    COLOR_TIME,
    COLOR_SUCCESS,
    COLOR_KEY_MESSAGE,
    Logger,
    ConsoleLogger,
    LoggerLevel,
    COLOR_KEY_VALUE,
} from '@flxbl-io/sfp-logger';
import getFormattedTime from './core/utils/GetFormattedTime';
import SfpPackage from './core/package/SfpPackage';
import ReleaseConfigLoader from './impl/release/ReleaseConfigLoader';
import { Flags } from '@oclif/core';
import { arrayFlagSfdxStyle, loglevel, orgApiVersionFlagSfdxStyle, targetdevhubusername } from './flags/sfdxflags';
import { ReleaseConfigAggregator } from './impl/release/ReleaseConfigAggregator';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@flxbl-io/sfp', 'build');

export default abstract class BuildBase extends SfpCommand {
    protected static requiresUsername = false;
    protected static requiresDevhubUsername = false;
    protected static requiresProject = true;
    protected releaseConfigMap: { [key: string]: string[] } = {}; 

    public static flags = {
        loglevel,
        apiversion: orgApiVersionFlagSfdxStyle,
        devhubalias: targetdevhubusername,
        diffcheck: Flags.boolean({
            description: messages.getMessage('diffCheckFlagDescription'),
            default: false,
        }),
        buildOnly: arrayFlagSfdxStyle({
            char: 'p',
            description: messages.getMessage('buildOnlyFlagDescription'),
        }),
        repourl: Flags.string({
            char: 'r',
            description: messages.getMessage('repoUrlFlagDescription'),
        }),
        configfilepath: Flags.file({
            char: 'f',
            description: messages.getMessage('configFilePathFlagDescription'),
            default: 'config/project-scratch-def.json',
        }),
        artifactdir: Flags.directory({
            description: messages.getMessage('artifactDirectoryFlagDescription'),
            default: 'artifacts',
        }),
        waittime: Flags.integer({
            description: messages.getMessage('waitTimeFlagDescription'),
            default: 120,
        }),
        buildnumber: Flags.integer({
            description: messages.getMessage('buildNumberFlagDescription'),
            default: 1,
        }),
        executorcount: Flags.integer({
            description: messages.getMessage('executorCountFlagDescription'),
            default: 5,
        }),
        branch: Flags.string({
            description: messages.getMessage('branchFlagDescription'),
            default: 'main',
            required: true,
        }),
        tag: Flags.string({
            description: messages.getMessage('tagFlagDescription'),
        }),
        releaseconfig: arrayFlagSfdxStyle({
            aliases: ['domain'],
            description: messages.getMessage('releaseConfigFileFlagDescription'),
        }),
        retryOnConnectionErrors: Flags.boolean({
            description: 'Retry package installations on network connection errors with exponential backoff',
            default: true,
        }),
        maxConnectionRetries: Flags.integer({
            description: 'Maximum number of retry attempts for connection errors',
            default: 5,
        }),
        initialRetryDelay: Flags.integer({
            description: 'Initial delay in milliseconds before retrying connection errors',
            default: 5000,
        }),
        maxRetryDelay: Flags.integer({
            description: 'Maximum delay in milliseconds between connection error retries',
            default: 300000,
        }),
    };

    public async execute() {
        const { flags } = await this.parse();
        let buildExecResult: {
            generatedPackages: SfpPackage[];
            failedPackages: string[];
        };
        let totalElapsedTime: number;
        let artifactCreationErrors: string[] = [];

        let tags = {
            is_diffcheck_enabled: String(flags.diffcheck),
            stage: this.getStage(),
            branch: flags.branch,
        };

        try {
            const artifactDirectory: string = flags.artifactdir;
            const diffcheck: boolean = flags.diffcheck;
            const branch: string = flags.branch;
            const buildOnlyPackages: string[] = flags.buildOnly;

            // Read Manifest
            let projectConfig = ProjectConfig.getSFDXProjectConfig(process.cwd());

            SFPLogger.log(COLOR_HEADER(`command: ${COLOR_KEY_MESSAGE(this.getStage())}`));
            SFPLogger.log(COLOR_HEADER(`Build Packages Only Changed: ${flags.diffcheck}`));
            if (projectConfig?.plugins?.sfp?.scratchOrgDefFilePaths?.enableMultiDefinitionFiles) {
                SFPLogger.log(COLOR_HEADER(`Multiple Config Files Mode: enabled`));
            } else {
                SFPLogger.log(COLOR_HEADER(`Config File Path: ${flags.configfilepath}`));
            }
            if(flags.releaseconfig?.length>0)
            {
                SFPLogger.log(COLOR_HEADER(`Release Config Files: ${flags.releaseconfig}`));
            }
            SFPLogger.log(COLOR_HEADER(`Artifact Directory: ${flags.artifactdir}`));
            SFPLogger.printHeaderLine('', COLOR_HEADER, LoggerLevel.INFO);
            let executionStartTime = Date.now();

            if (!(flags.tag == null || flags.tag == undefined)) {
                tags['tag'] = flags.tag;
            }

            SFPStatsSender.logCount('build.scheduled', tags);

            let buildProps = this.getBuildProps();

            //Filter Build Props by ReleaseConfig
            if (buildOnlyPackages?.length > 0) {
                buildProps = this.includeOnlyPackagesAsProvided(buildOnlyPackages, buildProps, new ConsoleLogger());
            } else {
                buildProps = this.includeOnlyPackagesAsPerReleaseConfig(
                    flags.releaseconfig,
                    buildProps,
                    new ConsoleLogger()
                );
            }
            buildExecResult = await this.getBuildImplementer(buildProps).exec();

            if (
                diffcheck &&
                buildExecResult.generatedPackages.length === 0 &&
                buildExecResult.failedPackages.length === 0
            ) {
                SFPLogger.log(`${EOL}${EOL}`);
                SFPLogger.log(COLOR_INFO('No packages found to be built.. Exiting.. '));
                SFPLogger.printHeaderLine('', COLOR_HEADER, LoggerLevel.INFO);
                return;
            }

            SFPLogger.log(`${EOL}${EOL}`);
            SFPLogger.log('Generating Artifacts and Tags....');

            for (let generatedPackage of buildExecResult.generatedPackages) {
                try {
                    await ArtifactGenerator.generateArtifact(generatedPackage, process.cwd(), artifactDirectory);
                } catch (error) {
                    SFPLogger.log(error.message);
                    artifactCreationErrors.push(generatedPackage.packageName);
                }
            }

            totalElapsedTime = Date.now() - executionStartTime;

            if (artifactCreationErrors.length > 0 || buildExecResult.failedPackages.length > 0)
                throw new Error('Build Failed');

            SFPStatsSender.logGauge('build.duration', Date.now() - executionStartTime, tags);

            SFPStatsSender.logCount('build.succeeded', tags);
        } catch (error) {
            SFPStatsSender.logCount('build.failed', tags);
            SFPLogger.log(COLOR_ERROR(error));
            process.exitCode = 1;
        } finally {
            if (buildExecResult?.generatedPackages?.length > 0 || buildExecResult?.failedPackages?.length > 0) {
                SFPLogger.printHeaderLine('', COLOR_HEADER, LoggerLevel.INFO);
                SFPLogger.log(
                    COLOR_SUCCESS(
                        `${buildExecResult.generatedPackages.length} artifacts created in ${COLOR_TIME(
                            getFormattedTime(totalElapsedTime)
                        )} minutes with ${COLOR_ERROR(buildExecResult.failedPackages.length)} errors`
                    )
                );

                if (buildExecResult.failedPackages.length > 0)
                    SFPLogger.log(COLOR_ERROR(`Packages Failed To Build`, buildExecResult.failedPackages));

                if (artifactCreationErrors.length > 0)
                    SFPLogger.log(COLOR_ERROR(`Failed To Create Artifacts`, artifactCreationErrors));

                SFPLogger.printHeaderLine('', COLOR_HEADER, LoggerLevel.INFO);

                const buildResult: BuildResult = {
                    packages: [],
                    summary: {
                        scheduled_packages: null,
                        elapsed_time: null,
                        succeeded: null,
                        failed: null,
                        sucessfullReleaseConfigs: [],
                        failedReleaseConfigs:[]
                    },
                };

                for (let generatedPackage of buildExecResult.generatedPackages) {
                    buildResult.packages.push({
                        name: generatedPackage.packageName,
                        version: generatedPackage.package_version_number,
                        elapsed_time: generatedPackage.creation_details?.creation_time,
                        versionId: generatedPackage.package_version_id,
                        status: 'succeeded',
                    });
                    
                }

                for (let failedPackage of buildExecResult.failedPackages) {
                    buildResult.packages.push({
                        name: failedPackage,
                        version: null,
                        elapsed_time: null,
                        status: 'failed',
                    });
                }
               
                //try to understad which release configs was successfull
                buildResult.summary.sucessfullReleaseConfigs=[];
                for (const releaseConfig in this.releaseConfigMap) {
                    let packages = this.releaseConfigMap[releaseConfig];
                    let failedPackages = packages.filter((x) => buildExecResult.failedPackages.includes(x));
                    if (failedPackages.length === 0) {
                        buildResult.summary.sucessfullReleaseConfigs.push(releaseConfig);
                    }
                    else {
                        buildResult.summary.failedReleaseConfigs.push(releaseConfig);
                    }
                }


                buildResult.summary.scheduled_packages =
                    buildExecResult.generatedPackages.length + buildExecResult.failedPackages.length;
                buildResult.summary.elapsed_time = totalElapsedTime;
                buildResult.summary.succeeded = buildExecResult.generatedPackages.length;
                buildResult.summary.failed = buildExecResult.failedPackages.length;

                fs.writeFileSync(`buildResult.json`, JSON.stringify(buildResult, null, 4));
            }
        }
    }

    private includeOnlyPackagesAsProvided(
        buildOnlyPackages: string[],
        buildProps: BuildProps,
        logger?: Logger
    ): BuildProps {
        buildProps.includeOnlyPackages = buildOnlyPackages;
        printIncludeOnlyPackages(buildProps.includeOnlyPackages);
        return buildProps;
        function printIncludeOnlyPackages(includeOnlyPackages: string[]) {
            SFPLogger.log(
                COLOR_KEY_MESSAGE(`Build will include the below packages as per the given release configs domain(s)`),
                LoggerLevel.INFO
            );
            SFPLogger.log(COLOR_KEY_VALUE(`${includeOnlyPackages.toString()}`), LoggerLevel.INFO);
        }
    }

    private includeOnlyPackagesAsPerReleaseConfig(
        releaseConfigFilePaths: string[],
        buildProps: BuildProps,
        logger?: Logger
    ): BuildProps {
       

        if (releaseConfigFilePaths?.length > 0) {
            buildProps.includeOnlyPackages = [];
            let releaseConfigAggregatedLoader = new ReleaseConfigAggregator(logger);
			releaseConfigAggregatedLoader.addReleaseConfigs(releaseConfigFilePaths); 
			buildProps.includeOnlyPackages = releaseConfigAggregatedLoader.getAllPackages();
            printIncludeOnlyPackages(buildProps.includeOnlyPackages);
        }
        return buildProps;

        function printIncludeOnlyPackages(includeOnlyPackages: string[]) {
            SFPLogger.log(
                COLOR_KEY_MESSAGE(`Build will include the below packages as per the given release configs(domain(s))`),
                LoggerLevel.INFO
            );
            SFPLogger.log(COLOR_KEY_VALUE(`${includeOnlyPackages.toString()}`), LoggerLevel.INFO);
        }
    }

    abstract getBuildProps(): BuildProps;

    abstract getStage(): Stage;

    abstract getBuildImplementer(buildProps: BuildProps): BuildImpl;
}

interface BuildResult {
    packages: {
        name: string;
        version: string;
        elapsed_time: number;
        versionId?:string
        status: string;
    }[];
    summary: {
        scheduled_packages: number;
        elapsed_time: number;
        succeeded: number;
        failed: number;
        sucessfullReleaseConfigs: string[];
        failedReleaseConfigs:string[]
    };
}
