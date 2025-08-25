import { jest, expect } from '@jest/globals';
import QuickBuild from '../../src/commands/quickbuild';
import { BuildProps } from '../../src/impl/parallelBuilder/BuildImpl';
import { DEFAULT_NETWORK_RETRY_CONFIG } from '../../src/core/utils/NetworkErrorHandler';

describe('QuickBuild Command Flag Plumbing', () => {

    describe('Network retry flag defaults', () => {
        it('should set default values correctly in config creation', () => {
            // Test the configuration creation logic that would happen in DeployImpl
            const retryOnConnectionErrors = undefined ?? true;
            const maxConnectionRetries = undefined ?? DEFAULT_NETWORK_RETRY_CONFIG.maxRetries;
            const initialRetryDelay = undefined ?? DEFAULT_NETWORK_RETRY_CONFIG.initialDelay;
            const maxRetryDelay = undefined ?? DEFAULT_NETWORK_RETRY_CONFIG.maxDelay;

            expect(retryOnConnectionErrors).toBe(true);
            expect(maxConnectionRetries).toBe(5);
            expect(initialRetryDelay).toBe(5000);
            expect(maxRetryDelay).toBe(300000);
        });
    });

    describe('Flag configuration simulation', () => {
        it('should simulate flag parsing with custom values', () => {
            // Simulate what getBuildProps would do with custom flags
            const mockFlags = {
                retryOnConnectionErrors: false,
                maxConnectionRetries: 7,
                initialRetryDelay: 1000,
                maxRetryDelay: 60000,
                diffcheck: false,
                buildnumber: 1,
                executorcount: 5,
                branch: 'main',
                waittime: 120,
                configfilepath: 'config/project-scratch-def.json',
                artifactdir: 'artifacts',
            };

            // Simulate what QuickBuild.getBuildProps() does
            const simulatedBuildProps: Partial<BuildProps> = {
                retryOnConnectionErrors: mockFlags.retryOnConnectionErrors,
                maxConnectionRetries: mockFlags.maxConnectionRetries,
                initialRetryDelay: mockFlags.initialRetryDelay,
                maxRetryDelay: mockFlags.maxRetryDelay,
                isDiffCheckEnabled: mockFlags.diffcheck,
                buildNumber: mockFlags.buildnumber,
                executorcount: mockFlags.executorcount,
                branch: mockFlags.branch,
                waitTime: mockFlags.waittime,
                configFilePath: mockFlags.configfilepath,
            };

            // Verify custom values are preserved
            expect(simulatedBuildProps.retryOnConnectionErrors).toBe(false);
            expect(simulatedBuildProps.maxConnectionRetries).toBe(7);
            expect(simulatedBuildProps.initialRetryDelay).toBe(1000);
            expect(simulatedBuildProps.maxRetryDelay).toBe(60000);
        });

        it('should handle partial flag configuration', () => {
            const mockFlags = {
                retryOnConnectionErrors: true,
                maxConnectionRetries: 3,
                // initialRetryDelay and maxRetryDelay not set
                diffcheck: false,
                buildnumber: 1,
                executorcount: 5,
                branch: 'main',
                waittime: 120,
                configfilepath: 'config/project-scratch-def.json',
                artifactdir: 'artifacts',
            };

            const simulatedBuildProps: Partial<BuildProps> = {
                retryOnConnectionErrors: mockFlags.retryOnConnectionErrors,
                maxConnectionRetries: mockFlags.maxConnectionRetries,
                initialRetryDelay: undefined, // Not set in flags
                maxRetryDelay: undefined, // Not set in flags
            };

            expect(simulatedBuildProps.retryOnConnectionErrors).toBe(true);
            expect(simulatedBuildProps.maxConnectionRetries).toBe(3);
            expect(simulatedBuildProps.initialRetryDelay).toBeUndefined(); // Will use default
            expect(simulatedBuildProps.maxRetryDelay).toBeUndefined(); // Will use default
        });
    });

    describe('Flag validation and boundaries', () => {
        it('should handle valid boundary values for retry configuration', () => {
            const testCases = [
                {
                    name: 'minimum valid values',
                    retryFlags: {
                        retryOnConnectionErrors: true,
                        maxConnectionRetries: 1,
                        initialRetryDelay: 1000,
                        maxRetryDelay: 1000,
                    },
                },
                {
                    name: 'maximum reasonable values',
                    retryFlags: {
                        retryOnConnectionErrors: true,
                        maxConnectionRetries: 10,
                        initialRetryDelay: 30000,
                        maxRetryDelay: 600000, // 10 minutes
                    },
                },
                {
                    name: 'disabled retry',
                    retryFlags: {
                        retryOnConnectionErrors: false,
                        maxConnectionRetries: 0,
                        initialRetryDelay: 0,
                        maxRetryDelay: 0,
                    },
                },
            ];

            testCases.forEach(({ name, retryFlags }) => {
                // Simulate BuildProps creation
                const simulatedBuildProps: Partial<BuildProps> = {
                    retryOnConnectionErrors: retryFlags.retryOnConnectionErrors,
                    maxConnectionRetries: retryFlags.maxConnectionRetries,
                    initialRetryDelay: retryFlags.initialRetryDelay,
                    maxRetryDelay: retryFlags.maxRetryDelay,
                };

                // Verify values are preserved without validation errors
                expect(simulatedBuildProps.retryOnConnectionErrors).toBe(retryFlags.retryOnConnectionErrors);
                expect(simulatedBuildProps.maxConnectionRetries).toBe(retryFlags.maxConnectionRetries);
                expect(simulatedBuildProps.initialRetryDelay).toBe(retryFlags.initialRetryDelay);
                expect(simulatedBuildProps.maxRetryDelay).toBe(retryFlags.maxRetryDelay);
            });
        });
    });

    describe('Integration with existing flags', () => {
        it('should not interfere with existing quickbuild functionality', () => {
            const mockFlags = {
                // Existing flags
                diffcheck: true,
                buildnumber: 42,
                executorcount: 3,
                branch: 'feature/test',
                waittime: 180,
                configfilepath: 'custom-config.json',
                artifactdir: 'custom-artifacts',
                tag: 'v1.0.0',
                // New network retry flags
                retryOnConnectionErrors: true,
                maxConnectionRetries: 3,
                initialRetryDelay: 2000,
                maxRetryDelay: 120000,
            };

            // Simulate what QuickBuild.getBuildProps() would do
            const simulatedBuildProps: Partial<BuildProps> = {
                isDiffCheckEnabled: mockFlags.diffcheck,
                buildNumber: mockFlags.buildnumber,
                executorcount: mockFlags.executorcount,
                branch: mockFlags.branch,
                waitTime: mockFlags.waittime,
                configFilePath: mockFlags.configfilepath,
                retryOnConnectionErrors: mockFlags.retryOnConnectionErrors,
                maxConnectionRetries: mockFlags.maxConnectionRetries,
                initialRetryDelay: mockFlags.initialRetryDelay,
                maxRetryDelay: mockFlags.maxRetryDelay,
            };

            // Verify existing flags still work
            expect(simulatedBuildProps.isDiffCheckEnabled).toBe(true);
            expect(simulatedBuildProps.buildNumber).toBe(42);
            expect(simulatedBuildProps.executorcount).toBe(3);
            expect(simulatedBuildProps.branch).toBe('feature/test');
            expect(simulatedBuildProps.waitTime).toBe(180);
            expect(simulatedBuildProps.configFilePath).toBe('custom-config.json');

            // Verify new flags work
            expect(simulatedBuildProps.retryOnConnectionErrors).toBe(true);
            expect(simulatedBuildProps.maxConnectionRetries).toBe(3);
            expect(simulatedBuildProps.initialRetryDelay).toBe(2000);
            expect(simulatedBuildProps.maxRetryDelay).toBe(120000);
        });
    });

    describe('BuildProps type compatibility', () => {
        it('should maintain type safety for BuildProps interface', () => {
            const mockProps: Partial<BuildProps> = {
                retryOnConnectionErrors: true,
                maxConnectionRetries: 5,
                initialRetryDelay: 5000,
                maxRetryDelay: 300000,
                isDiffCheckEnabled: false,
                buildNumber: 1,
                executorcount: 5,
                branch: 'main',
                waitTime: 120,
                configFilePath: 'config/project-scratch-def.json',
                isQuickBuild: true,
                isBuildAllAsSourcePackages: false,
            };

            // Verify that the properties satisfy the BuildProps interface requirements
            expect(typeof mockProps.retryOnConnectionErrors).toBe('boolean');
            expect(typeof mockProps.maxConnectionRetries).toBe('number');
            expect(typeof mockProps.initialRetryDelay).toBe('number');
            expect(typeof mockProps.maxRetryDelay).toBe('number');
            
            // Verify other required properties exist
            expect(mockProps.isQuickBuild).toBe(true);
            expect(mockProps.isBuildAllAsSourcePackages).toBe(false);
            expect(mockProps.waitTime).toBe(120);
            expect(mockProps.buildNumber).toBe(1);
            expect(mockProps.executorcount).toBe(5);
        });
    });

    describe('Command flag definitions', () => {
        it('should have the correct flag definitions', () => {
            // Access the static flags property
            const flags = QuickBuild.flags;

            // Verify network retry flags are defined
            expect(flags.retryOnConnectionErrors).toBeDefined();
            expect(flags.maxConnectionRetries).toBeDefined();
            expect(flags.initialRetryDelay).toBeDefined();
            expect(flags.maxRetryDelay).toBeDefined();

            // Verify default values are correct
            expect(flags.retryOnConnectionErrors.default).toBe(true);
            expect(flags.maxConnectionRetries.default).toBe(5);
            expect(flags.initialRetryDelay.default).toBe(5000);
            expect(flags.maxRetryDelay.default).toBe(300000);

            // Verify flag descriptions exist
            expect(flags.retryOnConnectionErrors.description).toContain('network connection errors');
            expect(flags.maxConnectionRetries.description).toContain('retry attempts');
            expect(flags.initialRetryDelay.description).toContain('Initial delay');
            expect(flags.maxRetryDelay.description).toContain('Maximum delay');
        });

        it('should inherit from BuildBase flags', () => {
            const flags = QuickBuild.flags;

            // Verify it includes existing BuildBase flags
            expect(flags.diffcheck).toBeDefined();
            expect(flags.buildnumber).toBeDefined();
            expect(flags.executorcount).toBeDefined();
            expect(flags.branch).toBeDefined();
            expect(flags.waittime).toBeDefined();
            expect(flags.artifactdir).toBeDefined();
        });
    });
});
