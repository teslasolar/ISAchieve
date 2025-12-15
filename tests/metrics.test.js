// Test suite for metrics collector

import { MetricsCollector } from '../src/metrics.js';

describe('MetricsCollector', () => {
    let collector;

    beforeEach(() => {
        collector = new MetricsCollector();
    });

    test('should record performance metrics', () => {
        collector.recordPerformance({ value: 100 });
        expect(collector.metrics.performance).toHaveLength(1);
    });

    test('should record errors', () => {
        const error = new Error('Test error');
        collector.recordError(error);
        expect(collector.metrics.errors).toHaveLength(1);
    });

    test('should calculate statistics', () => {
        collector.recordExecution({ duration: 100 });
        collector.recordExecution({ duration: 200 });
        
        const stats = collector.getStats();
        expect(stats.totalExecutions).toBe(2);
    });
});
