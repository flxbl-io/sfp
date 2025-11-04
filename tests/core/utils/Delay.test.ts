import { expect } from '@jest/globals';
import { delay } from '../../../src/core/utils/Delay';

describe('Delay utility function', () => {
    // Store original setTimeout for cleanup
    const originalSetTimeout = global.setTimeout;
    
    afterEach(() => {
        // Restore original setTimeout after each test
        global.setTimeout = originalSetTimeout;
        jest.clearAllMocks();
    });

    describe('Valid delay values', () => {
        it('should resolve after specified milliseconds', async () => {
            const startTime = Date.now();
            await delay(100);
            const endTime = Date.now();
            
            // Allow some tolerance for timing
            expect(endTime - startTime).toBeGreaterThanOrEqual(90);
            expect(endTime - startTime).toBeLessThan(150);
        });

        it('should handle zero delay', async () => {
            const startTime = Date.now();
            await delay(0);
            const endTime = Date.now();
            
            // Should resolve almost immediately
            expect(endTime - startTime).toBeLessThan(50);
        });

        it('should use default value when no parameter is provided', async () => {
            const startTime = Date.now();
            await delay();
            const endTime = Date.now();
            
            // Should resolve almost immediately (default is 0)
            expect(endTime - startTime).toBeLessThan(50);
        });

        it('should handle large delay values', async () => {
            // Mock setTimeout to avoid actual long delays in tests
            let timeoutCallback: Function;
            let timeoutDelay: number;
            
            global.setTimeout = jest.fn((callback, ms) => {
                timeoutCallback = callback;
                timeoutDelay = ms;
                // Immediately invoke callback for testing
                callback();
                return {} as NodeJS.Timeout;
            }) as any;

            await delay(999999);
            
            expect(global.setTimeout).toHaveBeenCalledTimes(1);
            expect(timeoutDelay).toBe(999999);
        });
    });

    describe('Invalid and edge case delay values', () => {
        it('should handle NaN by defaulting to 0', async () => {
            const startTime = Date.now();
            await delay(NaN);
            const endTime = Date.now();
            
            // Should resolve almost immediately
            expect(endTime - startTime).toBeLessThan(50);
        });

        it('should handle null by defaulting to 0', async () => {
            const startTime = Date.now();
            await delay(null as any);
            const endTime = Date.now();
            
            // Should resolve almost immediately
            expect(endTime - startTime).toBeLessThan(50);
        });

        it('should handle undefined by defaulting to 0', async () => {
            const startTime = Date.now();
            await delay(undefined as any);
            const endTime = Date.now();
            
            // Should resolve almost immediately
            expect(endTime - startTime).toBeLessThan(50);
        });

        it('should handle negative values', async () => {
            const startTime = Date.now();
            await delay(-100);
            const endTime = Date.now();
            
            // Negative values in setTimeout are treated as 0
            expect(endTime - startTime).toBeLessThan(50);
        });

        it('should handle Infinity', async () => {
            // Mock setTimeout to avoid actual infinite delays
            let timeoutDelay: number;
            
            global.setTimeout = jest.fn((callback, ms) => {
                timeoutDelay = ms;
                callback();
                return {} as NodeJS.Timeout;
            }) as any;

            await delay(Infinity);
            
            expect(global.setTimeout).toHaveBeenCalledTimes(1);
            expect(timeoutDelay).toBe(Infinity);
        });

        it('should handle string that converts to NaN', async () => {
            const startTime = Date.now();
            await delay('not a number' as any);
            const endTime = Date.now();
            
            // Should resolve almost immediately due to NaN check
            expect(endTime - startTime).toBeLessThan(50);
        });

        it('should handle string that converts to a valid number', async () => {
            // Mock setTimeout to check the actual value passed
            let timeoutDelay: number;
            
            global.setTimeout = jest.fn((callback, ms) => {
                timeoutDelay = ms;
                callback();
                return {} as NodeJS.Timeout;
            }) as any;

            await delay('100' as any);
            
            expect(global.setTimeout).toHaveBeenCalledTimes(1);
            // String '100' is passed through as is (TypeScript coercion)
            expect(timeoutDelay).toBe('100');
        });
    });

    describe('Promise behavior', () => {
        it('should return a Promise', () => {
            const result = delay(10);
            expect(result).toBeInstanceOf(Promise);
        });

        it('should be thenable', async () => {
            const result = await delay(10).then(() => 'resolved');
            expect(result).toBe('resolved');
        });

        it('should work with async/await', async () => {
            let executed = false;
            await delay(10);
            executed = true;
            expect(executed).toBe(true);
        });

        it('should work in Promise chains', async () => {
            const result = await Promise.resolve()
                .then(() => delay(10))
                .then(() => 'done');
            
            expect(result).toBe('done');
        });
    });

    describe('Concurrent delays', () => {
        it('should handle multiple concurrent delays', async () => {
            const startTime = Date.now();
            
            // Run multiple delays concurrently
            await Promise.all([
                delay(50),
                delay(100),
                delay(75)
            ]);
            
            const endTime = Date.now();
            
            // Should take approximately as long as the longest delay
            expect(endTime - startTime).toBeGreaterThanOrEqual(90);
            expect(endTime - startTime).toBeLessThan(150);
        });

        it('should handle sequential delays', async () => {
            const startTime = Date.now();
            
            await delay(50);
            await delay(50);
            await delay(50);
            
            const endTime = Date.now();
            
            // Should take approximately the sum of all delays
            expect(endTime - startTime).toBeGreaterThanOrEqual(140);
            expect(endTime - startTime).toBeLessThan(200);
        });
    });
});