// Example: Advanced metrics tracking

import { ISAchieve } from '../src/index.js';
import { MetricsCollector } from '../src/metrics.js';
import { Logger } from '../src/utils/logger.js';

const achiever = new ISAchieve({ agentId: 'advanced-agent' });
const metrics = new MetricsCollector();
const logger = new Logger('AdvancedExample');

logger.info('Starting advanced agent simulation');

// Simulate agent tasks
for (let i = 0; i < 5; i++) {
    const startTime = Date.now();
    
    // Simulate task execution
    setTimeout(() => {
        const duration = Date.now() - startTime;
        
        metrics.recordExecution({
            taskId: `task-${i}`,
            duration,
            success: true
        });
        
        metrics.recordPerformance({
            value: Math.random() * 100,
            unit: 'score'
        });
        
        achiever.unlock(`task-${i}-complete`, {
            description: `Completed task ${i}`,
            metadata: { duration }
        });
        
        logger.info(`Task ${i} completed`, { duration });
    }, Math.random() * 1000);
}

// After simulation
setTimeout(() => {
    const stats = metrics.getStats();
    logger.info('Simulation complete', stats);
    
    console.log('\n📈 Final Statistics:');
    console.log(stats);
}, 2000);
