import { Messages } from '@salesforce/core';
import BuildImpl, { BuildProps } from '../impl/parallelBuilder/BuildImpl';
import { Stage } from '../impl/Stage';
import BuildBase from '../BuildBase';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@flxbl-io/sfp', 'quickbuild');

export default class QuickBuild extends BuildBase {
    public static description = messages.getMessage('commandDescription');
    static aliases = ['orchestrator:quickbuild']

    getStage() {
        return Stage.QUICKBUILD;
    }

    getBuildProps(): BuildProps {
        let buildProps: BuildProps = {
            configFilePath: this.flags.configfilepath,
            devhubAlias: this.flags.devhubalias,
            repourl: this.flags.repourl,
            waitTime: this.flags.waittime,
            isQuickBuild: true,
            isDiffCheckEnabled: this.flags.diffcheck,
            buildNumber: this.flags.buildnumber,
            executorcount: this.flags.executorcount,
            branch: this.flags.branch,
            currentStage: Stage.QUICKBUILD,
            isBuildAllAsSourcePackages: false,
            diffOptions: {
                useLatestGitTags: true,
                skipPackageDescriptorChange: false,
            },
        };
        return buildProps;
    }
    getBuildImplementer(buildProps: BuildProps): BuildImpl {
        let buildImpl = new BuildImpl(buildProps);
        return buildImpl;
    }
}
