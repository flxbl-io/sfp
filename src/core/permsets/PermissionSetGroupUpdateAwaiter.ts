import { Connection } from '@salesforce/core';
import SFPLogger, { Logger, LoggerLevel } from '@flxbl-io/sfp-logger';
import QueryHelper from '../queryHelper/QueryHelper';
import { delay } from '../utils/Delay';

const psGroupQuery = `SELECT Id,MasterLabel,Status FROM PermissionSetGroup WHERE Status = 'Updating'`;

export default class PermissionSetGroupUpdateAwaiter {
    constructor(
        private connection: Connection,
        private logger: Logger,
        private intervalBetweenRepeats = 30000
    ) {}

    private getMaxWaitingTimeMilliseconds(): number  {
        const maxWaitingTimeInMinutes = process.env.PSG_AWAITER_TIMEOUT_MINUTES ?? undefined;
        if (maxWaitingTimeInMinutes) {
            const maxWaitingTimeInMinutesParsed = Number(maxWaitingTimeInMinutes);
            if (isNaN(maxWaitingTimeInMinutesParsed) || maxWaitingTimeInMinutesParsed <= 0) {
              SFPLogger.log(`PSG_AWAITER_TIMEOUT_MINUTES env variable must be a positive number [${maxWaitingTimeInMinutes}]`, LoggerLevel.ERROR, this.logger);
            }
            return maxWaitingTimeInMinutesParsed * 60 * 1000; // Convert minutes to milliseconds
        }
    }

    async waitTillAllPermissionSetGroupIsUpdated() {
        const maxWaitingTime = this.getMaxWaitingTimeMilliseconds();

        SFPLogger.log(`Checking status of permission sets group..`, LoggerLevel.INFO, this.logger);
        let totalTimeWaited = 0;
        while (true) {
            try {
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
                    totalTimeWaited += this.intervalBetweenRepeats;
                    if (maxWaitingTime && (totalTimeWaited > maxWaitingTime)) {
                        SFPLogger.log(
                            `Max waiting time of ${
                                maxWaitingTime / 1000
                            } seconds exceeded. Proceeding with deployment`,
                            LoggerLevel.WARN,
                            this.logger
                        );
                        break;
                    }
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
 