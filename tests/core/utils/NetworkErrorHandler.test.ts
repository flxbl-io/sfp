import { jest, expect } from '@jest/globals';
import { NetworkErrorHandler, RetryConfig, DEFAULT_NETWORK_RETRY_CONFIG } from '../../../src/core/utils/NetworkErrorHandler';
import SFPLogger from '@flxbl-io/sfp-logger';

// Mock SFPLogger to prevent console output during tests
jest.mock('@flxbl-io/sfp-logger');

describe('NetworkErrorHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('isNetworkError', () => {
        // Table-driven test cases for network error codes
        test.each([
            [{ code: 'ECONNRESET' }, true],
            [{ code: 'ECONNREFUSED' }, true],
            [{ code: 'ETIMEDOUT' }, true],
            [{ code: 'ENOTFOUND' }, true],
            [{ code: 'EPIPE' }, true],
            [{ code: 'ECONNABORTED' }, true],
            [{ code: 'EAI_AGAIN' }, true],
            [{ code: 'ENETDOWN' }, true],
            [{ code: 'ENETUNREACH' }, true],
            [{ code: 'EHOSTDOWN' }, true],
            [{ code: 'EHOSTUNREACH' }, true],
            [{ code: 'INVALID_CODE' }, false],
            [{ code: 'VALIDATION_ERROR' }, false],
        ])('detects error code %p as %p', (error, expected) => {
            expect(NetworkErrorHandler.isNetworkError(error)).toBe(expected);
        });

        // Table-driven test cases for network error messages
        test.each([
            [{ message: 'socket hang up' }, true],
            [{ message: 'connect ECONNRESET' }, true],
            [{ message: 'connect ECONNREFUSED' }, true],
            [{ message: 'connect ETIMEDOUT' }, true],
            [{ message: 'network timeout' }, true],
            [{ message: 'connection timeout' }, true],
            [{ message: 'connection reset' }, true],
            [{ message: 'socket disconnected' }, true],
            [{ message: 'request timeout' }, true],
            [{ message: 'socket timeout' }, true],
            [{ message: 'connection closed' }, true],
            [{ message: 'network is unreachable' }, true],
            [{ message: 'host is unreachable' }, true],
            [{ message: 'host is down' }, true],
            [{ message: 'name resolution failure' }, true],
            [{ message: 'temporary failure in name resolution' }, true],
            [{ message: 'read ECONNRESET' }, true],
            [{ message: 'write ECONNRESET' }, true],
            [{ message: 'ENOTFOUND getaddrinfo' }, true],
            [{ message: 'Validation failed' }, false],
            [{ message: 'Authentication failed' }, false],
            [{ message: 'Permission denied' }, false],
            [{ message: 'random failure' }, false],
        ])('detects error message %p as %p', (error, expected) => {
            expect(NetworkErrorHandler.isNetworkError(error)).toBe(expected);
        });

        it('should handle different error object structures', () => {
            // String error
            expect(NetworkErrorHandler.isNetworkError('socket hang up')).toBe(true);
            
            // Error object
            expect(NetworkErrorHandler.isNetworkError(new Error('ECONNRESET'))).toBe(true);
            
            // Object with message
            expect(NetworkErrorHandler.isNetworkError({ message: 'connection timeout' })).toBe(true);
            
            // Object with code
            expect(NetworkErrorHandler.isNetworkError({ code: 'ETIMEDOUT' })).toBe(true);
            
            // Object with both code and message
            expect(NetworkErrorHandler.isNetworkError({ 
                code: 'ECONNRESET', 
                message: 'Connection was reset' 
            })).toBe(true);
        });

        it('should be case-insensitive for error messages', () => {
            expect(NetworkErrorHandler.isNetworkError('SOCKET HANG UP')).toBe(true);
            expect(NetworkErrorHandler.isNetworkError('Socket Hang Up')).toBe(true);
            expect(NetworkErrorHandler.isNetworkError('socket HANG up')).toBe(true);
        });

        it('should handle null and undefined errors', () => {
            expect(NetworkErrorHandler.isNetworkError(null)).toBe(false);
            expect(NetworkErrorHandler.isNetworkError(undefined)).toBe(false);
            expect(NetworkErrorHandler.isNetworkError('')).toBe(false);
        });
    });

    describe('calculateRetryDelay', () => {
        const baseConfig: RetryConfig = {
            maxRetries: 5,
            initialDelay: 5000,
            maxDelay: 300000,
            backoffMultiplier: 2,
            enableJitter: false,
        };

        it('should calculate exponential backoff correctly without jitter', () => {
            expect(NetworkErrorHandler.calculateRetryDelay(1, baseConfig)).toBe(5000);
            expect(NetworkErrorHandler.calculateRetryDelay(2, baseConfig)).toBe(10000);
            expect(NetworkErrorHandler.calculateRetryDelay(3, baseConfig)).toBe(20000);
            expect(NetworkErrorHandler.calculateRetryDelay(4, baseConfig)).toBe(40000);
            expect(NetworkErrorHandler.calculateRetryDelay(5, baseConfig)).toBe(80000);
        });

        it('should cap delay at maximum', () => {
            const smallMaxConfig = { ...baseConfig, maxDelay: 15000 };
            expect(NetworkErrorHandler.calculateRetryDelay(3, smallMaxConfig)).toBe(15000);
            expect(NetworkErrorHandler.calculateRetryDelay(10, smallMaxConfig)).toBe(15000);
        });

        it('should add jitter when enabled', () => {
            const jitterConfig = { ...baseConfig, enableJitter: true };
            
            // Run multiple times to check for variation
            const delays = [];
            for (let i = 0; i < 20; i++) {
                delays.push(NetworkErrorHandler.calculateRetryDelay(2, jitterConfig));
            }
            
            // Should have some variation (not all delays identical)
            const uniqueDelays = new Set(delays);
            expect(uniqueDelays.size).toBeGreaterThan(1);
            
            // All delays should be positive and within reasonable bounds
            // Jitter should be within ±25% of the base delay (10000ms for attempt 2)
            const baseDelay = 10000;
            const minExpected = baseDelay * 0.75;
            const maxExpected = baseDelay * 1.25;
            
            delays.forEach(delay => {
                expect(delay).toBeGreaterThanOrEqual(minExpected);
                expect(delay).toBeLessThanOrEqual(maxExpected);
            });
        });

        it('should not go below initial delay when jitter is enabled', () => {
            const jitterConfig = { ...baseConfig, enableJitter: true };
            
            // Run multiple times
            for (let i = 0; i < 20; i++) {
                const delay = NetworkErrorHandler.calculateRetryDelay(1, jitterConfig);
                expect(delay).toBeGreaterThanOrEqual(baseConfig.initialDelay);
            }
        });
    });

    describe('shouldRetryNetworkError', () => {
        const config: RetryConfig = {
            maxRetries: 3,
            initialDelay: 1000,
            maxDelay: 30000,
            backoffMultiplier: 2,
            enableJitter: false,
        };

        it('should return true for network errors within retry limit', () => {
            const networkError = new Error('ECONNRESET');
            
            expect(NetworkErrorHandler.shouldRetryNetworkError(networkError, 1, config)).toBe(true);
            expect(NetworkErrorHandler.shouldRetryNetworkError(networkError, 2, config)).toBe(true);
            expect(NetworkErrorHandler.shouldRetryNetworkError(networkError, 3, config)).toBe(true);
        });

        it('should return false for network errors exceeding retry limit', () => {
            const networkError = new Error('ECONNRESET');
            
            expect(NetworkErrorHandler.shouldRetryNetworkError(networkError, 4, config)).toBe(false);
            expect(NetworkErrorHandler.shouldRetryNetworkError(networkError, 5, config)).toBe(false);
        });

        it('should return false for non-network errors regardless of attempt', () => {
            const nonNetworkError = new Error('Validation failed');
            
            expect(NetworkErrorHandler.shouldRetryNetworkError(nonNetworkError, 1, config)).toBe(false);
            expect(NetworkErrorHandler.shouldRetryNetworkError(nonNetworkError, 2, config)).toBe(false);
            expect(NetworkErrorHandler.shouldRetryNetworkError(nonNetworkError, 3, config)).toBe(false);
        });
    });

    describe('logRetryAttempt', () => {
        const mockLogger = {
            log: jest.fn(),
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should log retry attempt with correct details', () => {
            const error = new Error('ECONNRESET');
            NetworkErrorHandler.logRetryAttempt(error, 2, 5, 10000, mockLogger as any);

            expect(SFPLogger.log).toHaveBeenCalledWith(
                'Network error detected (attempt 2/5): ECONNRESET',
                40, // LoggerLevel.WARN
                mockLogger
            );

            expect(SFPLogger.log).toHaveBeenCalledWith(
                'Retrying in 10s with exponential backoff...',
                30, // LoggerLevel.INFO
                mockLogger
            );
        });

        it('should log max retries reached when at limit', () => {
            const error = new Error('ETIMEDOUT');
            NetworkErrorHandler.logRetryAttempt(error, 5, 5, 0, mockLogger as any);

            expect(SFPLogger.log).toHaveBeenCalledWith(
                'Network error detected (attempt 5/5): ETIMEDOUT',
                40, // LoggerLevel.WARN
                mockLogger
            );

            expect(SFPLogger.log).toHaveBeenCalledWith(
                'Maximum retry attempts (5) reached. Failing deployment.',
                50, // LoggerLevel.ERROR
                mockLogger
            );
        });
    });

    describe('logRetrySuccess', () => {
        const mockLogger = {
            log: jest.fn(),
        };

        it('should log success when multiple attempts were made', () => {
            NetworkErrorHandler.logRetrySuccess(3, 15000, mockLogger as any);

            expect(SFPLogger.log).toHaveBeenCalledWith(
                '✓ Deployment succeeded after 3 attempts (15s total retry time)',
                30, // LoggerLevel.INFO
                mockLogger
            );
        });

        it('should not log for single attempt (no retries)', () => {
            NetworkErrorHandler.logRetrySuccess(1, 0, mockLogger as any);

            expect(SFPLogger.log).not.toHaveBeenCalled();
        });
    });

    describe('delay', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should resolve after the specified delay', async () => {
            const delayPromise = NetworkErrorHandler.delay(5000);
            
            // Fast forward time
            jest.advanceTimersByTime(5000);
            
            await expect(delayPromise).resolves.toBeUndefined();
        });

        it('should not resolve before the delay period', async () => {
            const delayPromise = NetworkErrorHandler.delay(5000);
            
            // Fast forward less than the delay
            jest.advanceTimersByTime(3000);
            
            // Promise should still be pending
            expect(jest.getTimerCount()).toBe(1);
            
            // Complete the delay
            jest.advanceTimersByTime(2000);
            await expect(delayPromise).resolves.toBeUndefined();
        });
    });

    describe('DEFAULT_NETWORK_RETRY_CONFIG', () => {
        it('should have sensible default values', () => {
            expect(DEFAULT_NETWORK_RETRY_CONFIG.maxRetries).toBe(5);
            expect(DEFAULT_NETWORK_RETRY_CONFIG.initialDelay).toBe(5000);
            expect(DEFAULT_NETWORK_RETRY_CONFIG.maxDelay).toBe(300000);
            expect(DEFAULT_NETWORK_RETRY_CONFIG.backoffMultiplier).toBe(2);
            expect(DEFAULT_NETWORK_RETRY_CONFIG.enableJitter).toBe(true);
        });
    });

    describe('Real-world Azure DevOps to Salesforce scenarios', () => {
        const realWorldErrors = [
            // Azure DevOps agent connection errors
            { 
                error: Object.assign(new Error('connect ECONNRESET 13.110.52.208:443'), { code: 'ECONNRESET' }),
                description: 'Azure agent connection reset by Salesforce'
            },
            {
                error: new Error('socket hang up'),
                description: 'Socket connection dropped during deployment'
            },
            {
                error: Object.assign(new Error('connect ETIMEDOUT 13.110.52.208:443'), { code: 'ETIMEDOUT' }),
                description: 'Connection timeout to Salesforce servers'
            },
            {
                error: Object.assign(new Error('getaddrinfo ENOTFOUND login.salesforce.com'), { code: 'ENOTFOUND' }),
                description: 'DNS resolution failure for Salesforce domains'
            },
            {
                error: new Error('RequestError: read ECONNRESET'),
                description: 'HTTP request interrupted by connection reset'
            },
        ];

        test.each(realWorldErrors)('should handle $description', ({ error }) => {
            expect(NetworkErrorHandler.isNetworkError(error)).toBe(true);
            expect(NetworkErrorHandler.shouldRetryNetworkError(error, 1, DEFAULT_NETWORK_RETRY_CONFIG)).toBe(true);
        });

        // Non-retryable deployment errors that should not be considered network errors
        const deploymentErrors = [
            'FIELD_CUSTOM_VALIDATION_EXCEPTION',
            'REQUIRED_FIELD_MISSING',
            'DUPLICATE_VALUE',
            'FIELD_FILTER_VALIDATION_EXCEPTION',
            'INVALID_FIELD_FOR_INSERT_UPDATE',
            'CANNOT_INSERT_UPDATE_ACTIVATE_ENTITY',
            'FIELD_INTEGRITY_EXCEPTION',
        ];

        test.each(deploymentErrors)('should not retry deployment error: %s', (errorMessage) => {
            const error = new Error(errorMessage);
            expect(NetworkErrorHandler.isNetworkError(error)).toBe(false);
            expect(NetworkErrorHandler.shouldRetryNetworkError(error, 1, DEFAULT_NETWORK_RETRY_CONFIG)).toBe(false);
        });
    });

    describe('Background job compatibility', () => {
        it('should not treat background job errors as network errors', () => {
            const backgroundJobError = 'ongoing background job detected';
            
            // Background job errors are not network errors
            expect(NetworkErrorHandler.isNetworkError(backgroundJobError)).toBe(false);
            
            // They should be handled by the existing retry logic in DeployImpl
            expect(NetworkErrorHandler.shouldRetryNetworkError(backgroundJobError, 1, DEFAULT_NETWORK_RETRY_CONFIG)).toBe(false);
        });
    });
});
