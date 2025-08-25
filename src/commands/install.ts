import SfpCommand from '../SfpCommand';
import { Messages } from '@salesforce/core';
import SFPStatsSender from '../core/stats/SFPStatsSender';
import DeployImpl, { DeploymentMode, DeployProps, DeploymentResult } from '../impl/deploy/DeployImpl';
import { Stage } from '../impl/Stage';
import SFPLogger, {
    COLOR_ERROR,
    COLOR_HEADER,
    COLOR_KEY_MESSAGE,
    COLOR_SUCCESS,
} from '@flxbl-io/sfp-logger';
import { COLOR_TIME } from '@flxbl-io/sfp-logger';
import getFormattedTime from '../core/utils/GetFormattedTime';
import { Flags } from '@oclif/core';
import { arrayFlagSfdxStyle, loglevel, logsgroupsymbol, requiredUserNameFlag } from '../flags/sfdxflags';
import { LoggerLevel } from '@flxbl-io/sfp-logger';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@flxbl-io/sfp', 'install');

export default class Install extends SfpCommand {
    public static description = messages.getMessage('commandDescription');
    static aliases = ['orchestrator:deploy','deploy']

    public static examples = [`$ sfp install -o <username>`];

    protected static requiresUsername = false;
    protected static requiresDevhubUsername = false;
    protected static requiresProject = false;

    public static flags = {
        targetorg: requiredUserNameFlag,
        artifactdir: Flags.directory({
            description: messages.getMessage('artifactDirectoryFlagDescription'),
            default: 'artifacts',
        }),
        waittime: Flags.integer({
            description: messages.getMessage('waitTimeFlagDescription'),
            default: 120,
        }),
        tag: Flags.string({
            char: 't',
            description: messages.getMessage('tagFlagDescription'),
        }),
        skipifalreadyinstalled: Flags.boolean({
            required: false,
            default: false,
            description: messages.getMessage('skipIfAlreadyInstalled'),
        }),
        baselineorg: Flags.string({
            char: 'b',
            description: messages.getMessage('baselineorgFlagDescription'),
            required: false,
            dependsOn: ['skipifalreadyinstalled'],
        }),
        allowunpromotedpackages: Flags.boolean({
            description: messages.getMessage('allowUnpromotedPackagesFlagDescription'),
            deprecated: { 
                message: '--allowunpromotedpackages is deprecated, All packages are allowed'
            },
            hidden: true,
        }),
        artifacts: arrayFlagSfdxStyle({
            char: 'p',
            description: messages.getMessage('artifactsOnlyFlagDescription'),
        }),
        retryonfailure: Flags.boolean({
            description: messages.getMessage('retryOnFailureFlagDescription'),
            hidden: true,
        }),
        releaseconfig: Flags.string({
            description: messages.getMessage('configFileFlagDescription'),
        }),
        enablesourcetracking: Flags.boolean({
            description: messages.getMessage('enableSourceTrackingFlagDescription'),
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
        logsgroupsymbol,
        loglevel
    };

    public async execute() {
        let executionStartTime = Date.now();

        SFPLogger.log(COLOR_HEADER(`command: ${COLOR_KEY_MESSAGE(`install`)}`));
        SFPLogger.log(COLOR_HEADER(`Skip artifacts if already installed: ${this.flags.skipifalreadyinstalled}`));
        SFPLogger.log(COLOR_HEADER(`Artifact Directory: ${this.flags.artifactdir}`));
        if(this.flags.artifacts)
        SFPLogger.log(COLOR_HEADER(`Artifacts to be installed: ${this.flags.artifacts }`));
        SFPLogger.log(COLOR_HEADER(`Target Environment: ${this.flags.targetorg}`));
        if(this.flags.releaseconfig) SFPLogger.log(COLOR_HEADER(`Filter according to: ${this.flags.releaseconfig}`));
        if (this.flags.baselineorg) SFPLogger.log(COLOR_HEADER(`Baselined Against Org: ${this.flags.baselineorg}`));
        SFPLogger.printHeaderLine('',COLOR_HEADER,LoggerLevel.INFO);

        let deploymentResult: DeploymentResult;

        let tags = {
            targetOrg: this.flags.targetorg,
        };

        if (this.flags.tag != null) {
            tags['tag'] = this.flags.tag;
        }

        let deployProps: DeployProps = {
            targetUsername: this.flags.targetorg,
            artifactDir: this.flags.artifactdir,
            waitTime: this.flags.waittime,
            tags: tags,
            isTestsToBeTriggered: false,
            deploymentMode: this.flags.enablesourcetracking? DeploymentMode.SOURCEPACKAGES_PUSH: DeploymentMode.NORMAL,
            skipIfPackageInstalled: this.flags.skipifalreadyinstalled,
            logsGroupSymbol: this.flags.logsgroupsymbol,
            currentStage: Stage.DEPLOY,
            baselineOrg: this.flags.baselineorg,
            isRetryOnFailure: this.flags.retryonfailure,
            releaseConfigPath: this.flags.releaseconfig,
            filterByProvidedArtifacts: this.flags.artifacts,
            retryOnConnectionErrors: this.flags.retryOnConnectionErrors,
            maxConnectionRetries: this.flags.maxConnectionRetries,
            initialRetryDelay: this.flags.initialRetryDelay,
            maxRetryDelay: this.flags.maxRetryDelay,
        };

        try {
            let deployImpl: DeployImpl = new DeployImpl(deployProps);

            deploymentResult = await deployImpl.exec();

            if (deploymentResult.failed.length > 0 || deploymentResult.error) {
                process.exitCode = 1;
            }
        } catch (error) {
            SFPLogger.log(COLOR_ERROR(error));
            process.exitCode = 1;
        } finally {
            let totalElapsedTime: number = Date.now() - executionStartTime;

        
            SFPLogger.printHeaderLine('',COLOR_HEADER,LoggerLevel.INFO);
            SFPLogger.log(
                COLOR_SUCCESS(
                    `${deploymentResult.deployed.length} artifacts installed in ${COLOR_TIME(
                        getFormattedTime(totalElapsedTime)
                    )} with {${deploymentResult.failed.length}} errors`
                )
            );

            if (deploymentResult.failed.length > 0) {
                SFPLogger.log(
                    COLOR_ERROR(
                        `\nArtifacts failed to install:`,
                        deploymentResult.failed.map((packageInfo) => packageInfo.sfpPackage.packageName)
                    )
                );
            }
            SFPLogger.printHeaderLine('',COLOR_HEADER,LoggerLevel.INFO);

          
            SFPStatsSender.logCount('deploy.scheduled', tags);
            SFPStatsSender.logCount('install.scheduled', tags);

            SFPStatsSender.logGauge('deploy.packages.scheduled', deploymentResult.scheduled, tags);
            SFPStatsSender.logGauge('install.packages.scheduled', deploymentResult.scheduled, tags);

            SFPStatsSender.logGauge('deploy.duration', totalElapsedTime, tags);
            SFPStatsSender.logGauge('install.duration', totalElapsedTime, tags);

            SFPStatsSender.logGauge('deploy.succeeded.packages', deploymentResult.deployed.length, tags);
            SFPStatsSender.logGauge('install.succeeded.packages', deploymentResult.deployed.length, tags);


            SFPStatsSender.logGauge('deploy.failed.packages', deploymentResult.failed.length, tags);
            SFPStatsSender.logGauge('install.failed.packages', deploymentResult.failed.length, tags);


            if (deploymentResult.failed.length > 0) {
                SFPStatsSender.logCount('deploy.failed', tags);
                SFPStatsSender.logCount('install.failed', tags);
            } else {
                SFPStatsSender.logCount('deploy.succeeded', tags);
                SFPStatsSender.logCount('install.succeeded', tags);
            }
        }
    }
}
