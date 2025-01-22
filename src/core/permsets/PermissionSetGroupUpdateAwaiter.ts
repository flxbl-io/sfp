import { Connection } from '@salesforce/core';
import SFPLogger, { Logger, LoggerLevel } from '@flxbl-io/sfp-logger';
import QueryHelper from '../queryHelper/QueryHelper';
import { delay } from '../utils/Delay';

const psGroupQuery = `SELECT Id,MasterLabel,Status FROM PermissionSetGroup WHERE Status IN ('Updating', 'Outdated')`;

export default class PermissionSetGroupUpdateAwaiter {
    private startTime: number;

    constructor(
        private connection: Connection,
        private logger: Logger,
        private intervalBetweenRepeats = 60000,
        private timeoutInMs = 30 * 60 * 1000 // Default timeout of 30 minutes
    ) {
        this.startTime = Date.now();
    }

    async waitTillAllPermissionSetGroupIsUpdated() {
        SFPLogger.log(
            `Checking status of permission sets group..`,
            LoggerLevel.INFO,
            this.logger
        );

        while (true) {
            try {
                // Check if timeout has been reached
                if (Date.now() - this.startTime >= this.timeoutInMs) {
                    SFPLogger.log(
                        `Timeout of ${this.timeoutInMs/1000} seconds reached. Proceeding with deployment regardless of PermissionSetGroup status`,
                        LoggerLevel.WARN,
                        this.logger
                    );
                    break;
                }

                let records = await QueryHelper.query(psGroupQuery, this.connection, false);
                if (records.length > 0) {
                    SFPLogger.log(
                        `Pausing deployment as ${records.length} PermissionSetGroups are being updated`,
                        LoggerLevel.INFO,
                        this.logger
                    );
                    SFPLogger.log(
                        `Retrying for status in next ${this.intervalBetweenRepeats / 1000} seconds`,
                        LoggerLevel.INFO,
                        this.logger
                    );
                    await delay(this.intervalBetweenRepeats);
                } else {
                    SFPLogger.log(
                        `Proceeding with deployment, as no PermissionSetGroups are being updated`,
                        LoggerLevel.INFO,
                        this.logger
                    );
                    break;
                }
            } catch (error) {
                SFPLogger.log(`Unable to fetch permission group status ${error}`, LoggerLevel.TRACE, this.logger);
                throw error;
            }
        }
    }
}
