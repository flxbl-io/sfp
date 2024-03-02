import findJavaHome from 'find-java-home';
import ExecuteCommand from '@flxblio/sfdx-process-wrapper/lib/commandExecutor/ExecuteCommand';
import { Logger, LoggerLevel } from '@flxblio/sfp-logger';
import SFPLogger from '@flxblio/sfp-logger';
import { ConsoleLogger } from '@flxblio/sfp-logger';
import * as fs from 'fs-extra';
import path from 'path';

const jarFile = path.join(__dirname,  '..', 'jars', 'apexlink-2.3.7.jar');
export default class ApexDepedencyCheckImpl {
    public constructor(private logger: Logger, private projectDirectory: string) {}

    public async execute() {

        const apexLinkProcessExecutor = new ExecuteCommand(this.logger, LoggerLevel.INFO, false);
        const generatedCommand =  await this.getGeneratedCommandWithParams();
       
        await apexLinkProcessExecutor.execCommand(
           generatedCommand,
            process.cwd()
        );
        const result = fs.readJSONSync(`${this.projectDirectory}/apexlink.json`)
        return result;
    }

    private async getGeneratedCommandWithParams() {
        let javaHome:string = await this.getJavaHome();
        //Replace Program Files with Progra~1 in Windows
        javaHome = javaHome.replace(/Program Files/, "Progra~1");
        const command = `${path.join(javaHome, 'bin', 'java')}  -jar  ${jarFile} -depends  -json ${
            this.projectDirectory } > ${this.projectDirectory}/apexlink.json`;
        return command;
    }

    /**
     *Finds java home
     *
     * @return the Java home path
     */
    private async getJavaHome(): Promise<string> {
        return new Promise<string>((resolve, reject): void => {
            findJavaHome({ allowJre: true }, (err, res) => {
                if (err) {
                    return reject(err);
                }
                SFPLogger.log(`Java HOME ${res}`,LoggerLevel.TRACE, new ConsoleLogger())
                resolve(res);
            });
        });
    }
}
