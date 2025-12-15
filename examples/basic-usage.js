// Example: Basic achievement tracking

import { ISAchieve } from '../src/index.js';

// Create an achievement tracker
const achiever = new ISAchieve({
    agentId: 'example-agent-001',
    trackingEnabled: true
});

// Unlock achievements as the agent progresses
console.log('Starting agent training...');

achiever.unlock('first-initialization', {
    description: 'Agent successfully initialized',
    metadata: { version: '1.0.0' }
});

achiever.unlock('first-task-completion', {
    description: 'Completed first autonomous task',
    metadata: { taskType: 'data-processing', duration: 1500 }
});

achiever.unlock('self-improvement', {
    description: 'Agent identified and implemented self-improvement',
    metadata: { improvement: 'optimized-algorithm', gain: '15%' }
});

// Get metrics
const metrics = achiever.getMetrics();
console.log('\n📊 Agent Metrics:');
console.log(`Total Achievements: ${metrics.totalAchievements}`);
console.log(`Agent ID: ${metrics.agentId}`);

// List all achievements
console.log('\n🎯 Achievements Unlocked:');
achiever.getAllAchievements().forEach(achievement => {
    console.log(`- ${achievement.id}: ${achievement.description}`);
});
