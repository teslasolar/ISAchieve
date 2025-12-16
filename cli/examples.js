/**
 * Konomi ISAchieve - Static API Examples
 * Demonstrates usage of static functions as call sites
 */

import { Konomi } from './konomi.js';

console.log('🎯 Konomi ISAchieve - Static Function Examples\n');

// ===== Achievement Management =====
console.log('1️⃣  Achievement Management');
console.log('--------------------------------');

// Unlock an achievement
const unlocked = Konomi.achievements.unlock('first-build', {
    timestamp: Date.now(),
    user: 'agent-001'
});
console.log('Result:', unlocked);

// List achievements
const achievements = Konomi.achievements.list();
console.log('Total achievements:', achievements.length);

console.log('\n');

// ===== Configuration =====
console.log('2️⃣  Configuration Management');
console.log('--------------------------------');

// Show current config
Konomi.config.show();

// Get specific value
const port = Konomi.config.get('server.port', 3000);
console.log('Server port:', port);

console.log('\n');

// ===== Tag Management =====
console.log('3️⃣  Tag Management');
console.log('--------------------------------');

// List tags
const tags = Konomi.tags.list();
console.log('Available tags:', tags.length);

// Add new tag
Konomi.tags.add('custom-tag', {
    styles: { color: 'blue' }
});

// Apply tags
Konomi.tags.apply('my-component', ['primary', 'glow']);

console.log('\n');

// ===== Component Management =====
console.log('4️⃣  Component Management');
console.log('--------------------------------');

// Create component
const component = Konomi.components.create('MyScreen', 'ScreenContainer', {
    title: 'New Screen',
    tags: ['custom', 'interactive']
});
console.log('Created:', component);

// List components
const components = Konomi.components.list();
console.log('Total components:', components.length);

console.log('\n');

// ===== Metrics =====
console.log('5️⃣  Metrics & Analytics');
console.log('--------------------------------');

// Record metrics
Konomi.metrics.record('api.requests', 100);
Konomi.metrics.record('achievements.unlocked', 5);

// Get summary
const summary = Konomi.metrics.summary();
console.log('Summary:', summary);

console.log('\n');

// ===== Utilities =====
console.log('6️⃣  Utility Functions');
console.log('--------------------------------');

// Get version
console.log('Version:', Konomi.utils.version());

// Get info
const info = Konomi.utils.info();
console.log('Info:', info);

// Format data
const formatted = Konomi.utils.format({ key: 'value' }, 'json');
console.log('Formatted:', formatted);

console.log('\n');

// ===== MCP Functions =====
console.log('7️⃣  MCP Protocol');
console.log('--------------------------------');

// List tools
const tools = Konomi.mcp.listTools();
console.log('Available MCP tools:', tools);

// Execute tool (async)
(async () => {
    const result = await Konomi.mcp.execute('konomi_version', {});
    console.log('MCP result:', result);
})();

console.log('\n');

// ===== Chaining Examples =====
console.log('8️⃣  Chaining & Advanced Usage');
console.log('--------------------------------');

// Chain multiple operations
const workflow = () => {
    console.log('Starting workflow...');
    Konomi.achievements.unlock('workflow-start');
    Konomi.metrics.record('workflows.executed', 1);
    const config = Konomi.config.show();
    Konomi.achievements.unlock('workflow-complete');
    return { success: true, config };
};

const workflowResult = workflow();
console.log('Workflow complete:', workflowResult.success);

console.log('\n');

// ===== Help =====
console.log('9️⃣  Help & Documentation');
console.log('--------------------------------');

Konomi.help.commands();

console.log('\n✅ All examples completed!\n');

// Export examples for use in other files
export {
    unlocked,
    achievements,
    component,
    summary,
    tools
};
