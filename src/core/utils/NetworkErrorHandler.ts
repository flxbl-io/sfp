import SFPLogger, { LoggerLevel, Logger } from '@flxbl-io/sfp-logger';

export interface RetryConfig {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    enableJitter: boolean;
}

export const DEFAULT_NETWORK_RETRY_CONFIG: RetryConfig = {
    maxRetries: 5,
    initialDelay: 5000, // 5 seconds
    maxDelay: 300000, // 5 minutes
    backoffMultiplier: 2,
    enableJitter: true,
};

// Type guard for error objects with code property
interface ErrorWithCode extends Error {
    code?: string;
}

// Type guard for error-like objects
interface ErrorLike {
    message?: string;
    code?: string;
    toString?: () => string;
}

export class NetworkErrorHandler {
    /**
     * Type guard to check if value is an Error object with optional code property
     */
    private static isErrorWithCode(error: unknown): error is ErrorWithCode {
        return error instanceof Error;
    }

    /**
     * Type guard to check if value is an error-like object
     */
    private static isErrorLike(error: unknown): error is ErrorLike {
        return error !== null && typeof error === 'object';
    }

    /**
     * Checks if an error is a network-related error that should be retried
     * @param error - The error to check (can be string, Error object, or unknown)
     * @returns true if it's a retryable network error
     */
    static isNetworkError(error: unknown): boolean {
        const networkErrorCodes = [
            'ECONNRESET',
            'ECONNREFUSED', 
            'ETIMEDOUT',
            'ENOTFOUND',
            'EPIPE',
            'ECONNABORTED',
            'EAI_AGAIN',
            'ENETDOWN',
            'ENETUNREACH',
            'EHOSTDOWN',
            'EHOSTUNREACH',
        ];

        const networkErrorMessages = [
            'socket hang up',
            'connect ECONNRESET',
            'connect ECONNREFUSED',
            'connect ETIMEDOUT',
            'network timeout',
            'connection timeout',
            'connection reset',
            'socket disconnected',
            'request timeout',
            'socket timeout',
            'connection closed',
            'network is unreachable',
            'host is unreachable',
            'host is down',
            'name resolution failure',
            'temporary failure in name resolution',
            'read ECONNRESET',
            'write ECONNRESET',
            'ENOTFOUND getaddrinfo',
        ];

        if (!error) {
            return false;
        }

        let errorString: string = '';
        let errorCode: string = '';

        // Handle different error types with proper type guards
        if (typeof error === 'string') {
            errorString = error.toLowerCase();
        } else if (this.isErrorWithCode(error)) {
            errorString = error.message.toLowerCase();
            errorCode = error.code || '';
        } else if (this.isErrorLike(error)) {
            // Handle structured error objects
            const message = error.message || '';
            const toString = error.toString ? error.toString() : '';
            errorString = (message || toString).toLowerCase();
            errorCode = error.code || '';
        } else {
            // For any other type, try to convert to string
            try {
                errorString = String(error).toLowerCase();
            } catch {
                return false;
            }
        }

        // Check error codes
        if (errorCode && networkErrorCodes.includes(errorCode)) {
            return true;
        }

        // Check error messages
        for (const networkMessage of networkErrorMessages) {
            if (errorString.includes(networkMessage.toLowerCase())) {
                return true;
            }
        }

        // Check if error message contains any network error codes
        for (const networkCode of networkErrorCodes) {
            if (errorString.includes(networkCode.toLowerCase())) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculates the retry delay with exponential backoff and optional jitter
     * @param attemptNumber - Current attempt number (1-based)
     * @param config - Retry configuration
     * @returns delay in milliseconds
     */
    static calculateRetryDelay(attemptNumber: number, config: RetryConfig): number {
        // Calculate exponential backoff delay
        const baseDelay = config.initialDelay * Math.pow(config.backoffMultiplier, attemptNumber - 1);
        
        // Cap at maximum delay
        let delay = Math.min(baseDelay, config.maxDelay);
        
        // Add jitter if enabled (±25% random variation)
        if (config.enableJitter) {
            const jitterRange = delay * 0.25;
            const jitter = (Math.random() - 0.5) * 2 * jitterRange;
            delay = Math.max(config.initialDelay, delay + jitter);
        }

        return Math.round(delay);
    }

    /**
     * Determines if a network error should be retried based on attempt count and configuration
     * @param error - The error that occurred
     * @param attemptNumber - Current attempt number (1-based)
     * @param config - Retry configuration
     * @returns true if the error should be retried
     */
    static shouldRetryNetworkError(
        error: unknown,
        attemptNumber: number,
        config: RetryConfig
    ): boolean {
        // Check if it's a network error
        if (!this.isNetworkError(error)) {
            return false;
        }

        // Check if we haven't exceeded max retries
        return attemptNumber <= config.maxRetries;
    }

    /**
     * Logs a retry attempt with appropriate details
     * @param error - The error that triggered the retry
     * @param attemptNumber - Current attempt number
     * @param maxRetries - Maximum number of retries
     * @param delayMs - Delay before next attempt in milliseconds
     * @param logger - Logger instance
     */
    static logRetryAttempt(
        error: unknown,
        attemptNumber: number,
        maxRetries: number,
        delayMs: number,
        logger?: Logger
    ): void {
        const errorMessage = this.extractErrorMessage(error);
        
        SFPLogger.log(
            `Network error detected (attempt ${attemptNumber}/${maxRetries}): ${errorMessage}`,
            LoggerLevel.WARN,
            logger
        );

        if (attemptNumber < maxRetries) {
            SFPLogger.log(
                `Retrying in ${Math.round(delayMs / 1000)}s with exponential backoff...`,
                LoggerLevel.INFO,
                logger
            );
        } else {
            SFPLogger.log(
                `Maximum retry attempts (${maxRetries}) reached. Failing deployment.`,
                LoggerLevel.ERROR,
                logger
            );
        }
    }

    /**
     * Logs successful retry recovery
     * @param totalAttempts - Total number of attempts made
     * @param totalTimeMs - Total time spent retrying in milliseconds
     * @param logger - Logger instance
     */
    static logRetrySuccess(
        totalAttempts: number,
        totalTimeMs: number,
        logger?: Logger
    ): void {
        if (totalAttempts > 1) {
            SFPLogger.log(
                `✓ Deployment succeeded after ${totalAttempts} attempts (${Math.round(totalTimeMs / 1000)}s total retry time)`,
                LoggerLevel.INFO,
                logger
            );
        }
    }

    /**
     * Extracts a readable error message from various error types
     * @param error - The error to extract message from
     * @returns human-readable error message
     */
    private static extractErrorMessage(error: unknown): string {
        if (typeof error === 'string') {
            return error;
        } else if (this.isErrorWithCode(error)) {
            return error.message;
        } else if (this.isErrorLike(error)) {
            const message = error.message;
            if (typeof message === 'string') {
                return message;
            }
            if (error.toString) {
                return error.toString();
            }
        }
        
        // Fallback: try to convert to string
        try {
            return String(error);
        } catch {
            return 'Unknown error';
        }
    }

    /**
     * Creates a delay promise for retry timing
     * @param delayMs - Delay in milliseconds
     * @returns Promise that resolves after the delay
     */
    static delay(delayMs: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, delayMs));
    }
}
