// Metrics and analytics for agent performance

export class MetricsCollector {
    constructor() {
        this.metrics = {
            performance: [],
            errors: [],
            executions: []
        };
    }

    recordPerformance(metric) {
        this.metrics.performance.push({
            ...metric,
            timestamp: Date.now()
        });
    }

    recordError(error) {
        this.metrics.errors.push({
            message: error.message,
            stack: error.stack,
            timestamp: Date.now()
        });
    }

    recordExecution(executionData) {
        this.metrics.executions.push({
            ...executionData,
            timestamp: Date.now()
        });
    }

    getStats() {
        return {
            totalExecutions: this.metrics.executions.length,
            totalErrors: this.metrics.errors.length,
            averagePerformance: this._calculateAverage(),
            errorRate: this._calculateErrorRate()
        };
    }

    _calculateAverage() {
        if (this.metrics.performance.length === 0) return 0;
        const sum = this.metrics.performance.reduce((acc, m) => acc + (m.value || 0), 0);
        return sum / this.metrics.performance.length;
    }

    _calculateErrorRate() {
        const total = this.metrics.executions.length;
        if (total === 0) return 0;
        return this.metrics.errors.length / total;
    }
}

export default MetricsCollector;
