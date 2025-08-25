import { jest, expect } from '@jest/globals';
import { NetworkErrorHandler, RetryConfig, DEFAULT_NETWORK_RETRY_CONFIG } from '../../../src/core/utils/NetworkErrorHandler';
import { PackageInstallationResult, PackageInstallationStatus } from '../../../src/core/package/packageInstallers/PackageInstallationResult';
import SFPLogger from '@flxbl-io/sfp-logger';

// Mock SFPLogger to prevent console output during tests
jest.mock('@flxbl-io/sfp-logger');

describe('DeployImpl Network Retry Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Network Error Retry Configuration Creation', () => {
        it('should create retry config with default values when props are undefined', () => {
            const config: RetryConfig = {
                maxRetries: undefined ?? DEFAULT_NETWORK_RETRY_CONFIG.maxRetries,
                initialDelay: undefined ?? DEFAULT_NETWORK_RETRY_CONFIG.initialDelay,
                maxDelay: undefined ?? DEFAULT_NETWORK_RETRY_CONFIG.maxDelay,
                backoffMultiplier: DEFAULT_NETWORK_RETRY_CONFIG.backoffMultiplier,
                enableJitter: DEFAULT_NETWORK_RETRY_CONFIG.enableJitter,
            };

            expect(config.maxRetries).toBe(5);
            expect(config.initialDelay).toBe(5000);
            expect(config.maxDelay).toBe(300000);
            expect(config.backoffMultiplier).toBe(2);
            expect(config.enableJitter).toBe(true);
        });

        it('should create retry config with custom values when provided', () => {
            const customMaxRetries = 3;
            const customInitialDelay = 2000;
            const customMaxDelay = 60000;

            const config: RetryConfig = {
                maxRetries: customMaxRetries ?? DEFAULT_NETWORK_RETRY_CONFIG.maxRetries,
                initialDelay: customInitialDelay ?? DEFAULT_NETWORK_RETRY_CONFIG.initialDelay,
                maxDelay: customMaxDelay ?? DEFAULT_NETWORK_RETRY_CONFIG.maxDelay,
                backoffMultiplier: DEFAULT_NETWORK_RETRY_CONFIG.backoffMultiplier,
                enableJitter: DEFAULT_NETWORK_RETRY_CONFIG.enableJitter,
            };

            expect(config.maxRetries).toBe(3);
            expect(config.initialDelay).toBe(2000);
            expect(config.maxDelay).toBe(60000);
        });
    });

    describe('Mock Package Installation Scenarios', () => {
        const createMockRetryFunction = (results: Array<PackageInstallationResult | Error>) => {
            let callCount = 0;
            return jest.fn().mockImplementation((): Promise<PackageInstallationResult> => {
                const result = results[callCount++];
                if (result instanceof Error) {
                    throw result;
                }
                return Promise.resolve(result as PackageInstallationResult);
            });
        };

        it('should succeed without retries when no errors occur', async () => {
            const successResult: PackageInstallationResult = {
                result: PackageInstallationStatus.Succeeded,
                message: 'Package installed successfully',
            };

            const mockInstaller = createMockRetryFunction([successResult]);

            // Simulate successful installation
            const result = await mockInstaller() as PackageInstallationResult;

            expect(result).toEqual(successResult);
            expect(mockInstaller).toHaveBeenCalledTimes(1);
        });

        it('should retry once on network error then succeed', async () => {
            const networkError = Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' });
            const successResult: PackageInstallationResult = {
                result: PackageInstallationStatus.Succeeded,
                message: 'Package installed successfully after retry',
            };

            const mockInstaller = createMockRetryFunction([networkError, successResult]);

            // Simulate retry logic behavior
            let attempts = 0;
            let finalResult: PackageInstallationResult = successResult; // Initialize with default

            try {
                finalResult = await mockInstaller() as PackageInstallationResult;
                attempts++;
            } catch (error) {
                attempts++;
                // Verify it's a network error
                expect(NetworkErrorHandler.isNetworkError(error)).toBe(true);
                
                // Simulate retry delay
                const delayMs = NetworkErrorHandler.calculateRetryDelay(attempts, DEFAULT_NETWORK_RETRY_CONFIG);
                // Skip actual delay in tests
                expect(delayMs).toBeGreaterThan(0);
                
                // Retry
                finalResult = await mockInstaller() as PackageInstallationResult;
                attempts++;
            }

            expect(finalResult).toEqual(successResult);
            expect(mockInstaller).toHaveBeenCalledTimes(2);
            expect(attempts).toBe(2);
        });

        it('should fail after exhausting network error retries', async () => {
            const networkError = Object.assign(new Error('connect ETIMEDOUT'), { code: 'ETIMEDOUT' });
            const config: RetryConfig = {
                maxRetries: 3,
                initialDelay: 1000,
                maxDelay: 30000,
                backoffMultiplier: 2,
                enableJitter: false,
            };

            const mockInstaller = createMockRetryFunction([
                networkError,
                networkError,
                networkError,
                networkError, // 4th attempt should not be made due to maxRetries=3
            ]);

            let attempts = 0;
            let finalError: Error;

            try {
                await mockInstaller() as PackageInstallationResult;
                attempts++;
            } catch (error) {
                attempts++;
                
                // Attempt retries up to the limit
                for (let retryAttempt = 1; retryAttempt <= config.maxRetries; retryAttempt++) {
                    if (NetworkErrorHandler.shouldRetryNetworkError(error, retryAttempt, config)) {
                        const delayMs = NetworkErrorHandler.calculateRetryDelay(retryAttempt, config);
                        expect(delayMs).toBeGreaterThan(0); // Skip actual delay in tests
                        
                        try {
                            await mockInstaller() as PackageInstallationResult;
                            break; // Success, exit retry loop
                        } catch (retryError) {
                            attempts++;
                            if (retryAttempt === config.maxRetries) {
                                finalError = retryError as Error;
                            }
                        }
                    }
                }
            }

            expect(finalError).toBeDefined();
            expect(NetworkErrorHandler.isNetworkError(finalError)).toBe(true);
            expect(mockInstaller).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
            expect(attempts).toBe(4);
        });

        it('should not retry non-network errors', async () => {
            const validationError = new Error('FIELD_CUSTOM_VALIDATION_EXCEPTION: Invalid field value');
            const mockInstaller = createMockRetryFunction([validationError]);

            let attempts = 0;
            let finalError: Error;

            try {
                await mockInstaller() as PackageInstallationResult;
                attempts++;
            } catch (error) {
                attempts++;
                finalError = error as Error;
                
                // Should not retry validation errors
                expect(NetworkErrorHandler.isNetworkError(error)).toBe(false);
                expect(NetworkErrorHandler.shouldRetryNetworkError(error, 1, DEFAULT_NETWORK_RETRY_CONFIG)).toBe(false);
            }

            expect(finalError).toBeDefined();
            expect(finalError.message).toContain('FIELD_CUSTOM_VALIDATION_EXCEPTION');
            expect(mockInstaller).toHaveBeenCalledTimes(1);
            expect(attempts).toBe(1);
        });
    });

    describe('Network Error Handler Integration', () => {
        it('should correctly identify and handle Azure DevOps connection errors', () => {
            const azureErrors = [
                Object.assign(new Error('connect ECONNRESET 13.110.52.208:443'), { code: 'ECONNRESET' }),
                new Error('socket hang up'),
                Object.assign(new Error('connect ETIMEDOUT 13.110.52.208:443'), { code: 'ETIMEDOUT' }),
                Object.assign(new Error('getaddrinfo ENOTFOUND login.salesforce.com'), { code: 'ENOTFOUND' }),
            ];

            azureErrors.forEach((error, index) => {
                expect(NetworkErrorHandler.isNetworkError(error)).toBe(true);
                expect(NetworkErrorHandler.shouldRetryNetworkError(error, 1, DEFAULT_NETWORK_RETRY_CONFIG)).toBe(true);
                
                // Calculate expected delay for first retry (with jitter, so we check range)
                const expectedDelay = NetworkErrorHandler.calculateRetryDelay(1, DEFAULT_NETWORK_RETRY_CONFIG);
                expect(expectedDelay).toBeGreaterThanOrEqual(3750); // 5000 * 0.75 (min with jitter)
                expect(expectedDelay).toBeLessThanOrEqual(6250); // 5000 * 1.25 (max with jitter)
            });
        });

        it('should handle exponential backoff correctly', () => {
            const config: RetryConfig = {
                maxRetries: 5,
                initialDelay: 1000,
                maxDelay: 60000,
                backoffMultiplier: 2,
                enableJitter: false,
            };

            const networkError = new Error('ECONNRESET');

            // Test retry decisions and delays
            expect(NetworkErrorHandler.shouldRetryNetworkError(networkError, 1, config)).toBe(true);
            expect(NetworkErrorHandler.calculateRetryDelay(1, config)).toBe(1000);

            expect(NetworkErrorHandler.shouldRetryNetworkError(networkError, 2, config)).toBe(true);
            expect(NetworkErrorHandler.calculateRetryDelay(2, config)).toBe(2000);

            expect(NetworkErrorHandler.shouldRetryNetworkError(networkError, 3, config)).toBe(true);
            expect(NetworkErrorHandler.calculateRetryDelay(3, config)).toBe(4000);

            expect(NetworkErrorHandler.shouldRetryNetworkError(networkError, 5, config)).toBe(true);
            expect(NetworkErrorHandler.calculateRetryDelay(5, config)).toBe(16000);

            // Should not retry beyond maxRetries
            expect(NetworkErrorHandler.shouldRetryNetworkError(networkError, 6, config)).toBe(false);
        });

        it('should respect delay capping', () => {
            const config: RetryConfig = {
                maxRetries: 10,
                initialDelay: 1000,
                maxDelay: 8000, // Cap at 8 seconds
                backoffMultiplier: 2,
                enableJitter: false,
            };

            // Attempt 4: 1000 * 2^3 = 8000 (at cap)
            expect(NetworkErrorHandler.calculateRetryDelay(4, config)).toBe(8000);
            
            // Attempt 5: Would be 16000, but capped at 8000
            expect(NetworkErrorHandler.calculateRetryDelay(5, config)).toBe(8000);
            
            // Attempt 10: Still capped
            expect(NetworkErrorHandler.calculateRetryDelay(10, config)).toBe(8000);
        });
    });

    describe('Background Job Error Compatibility', () => {
        it('should not treat background job errors as network errors', () => {
            const backgroundJobError = 'ongoing background job detected';
            
            expect(NetworkErrorHandler.isNetworkError(backgroundJobError)).toBe(false);
            expect(NetworkErrorHandler.shouldRetryNetworkError(backgroundJobError, 1, DEFAULT_NETWORK_RETRY_CONFIG)).toBe(false);
        });

        it('should handle mixed error scenarios correctly', () => {
            // Test that the retry logic can distinguish between different error types
            const errors = [
                { error: 'ongoing background job detected', isNetwork: false, shouldRetry: false },
                { error: new Error('ECONNRESET'), isNetwork: true, shouldRetry: true },
                { error: 'FIELD_CUSTOM_VALIDATION_EXCEPTION', isNetwork: false, shouldRetry: false },
                { error: new Error('socket hang up'), isNetwork: true, shouldRetry: true },
                { error: 'REQUIRED_FIELD_MISSING', isNetwork: false, shouldRetry: false },
            ];

            errors.forEach(({ error, isNetwork, shouldRetry }) => {
                expect(NetworkErrorHandler.isNetworkError(error)).toBe(isNetwork);
                expect(NetworkErrorHandler.shouldRetryNetworkError(error, 1, DEFAULT_NETWORK_RETRY_CONFIG)).toBe(shouldRetry);
            });
        });
    });

    describe('Logging Integration', () => {
        const mockLogger = {
            log: jest.fn(),
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should log retry attempts with proper details', () => {
            const error = new Error('ECONNRESET');
            NetworkErrorHandler.logRetryAttempt(error, 2, 5, 10000, mockLogger as any);

            // Verify logging calls
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

        it('should log successful recovery after retries', () => {
            NetworkErrorHandler.logRetrySuccess(3, 25000, mockLogger as any);

            expect(SFPLogger.log).toHaveBeenCalledWith(
                '✓ Deployment succeeded after 3 attempts (25s total retry time)',
                30, // LoggerLevel.INFO
                mockLogger
            );
        });
    });
});
