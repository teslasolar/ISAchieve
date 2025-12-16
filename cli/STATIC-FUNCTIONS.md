# Konomi ISAchieve - Static Functions Guide

Complete reference for Konomi static functions as call sites.

## Quick Start

```javascript
import { Konomi } from './cli/konomi.js';

// Use static functions directly
Konomi.achievements.unlock('my-achievement');
Konomi.config.show();
Konomi.server.start(3000);
```

## Interactive REPL

```bash
npm run konomi:repl

# Or directly
node cli/repl.js
```

The REPL provides immediate access to all Konomi functions with autocomplete.

## Static Function Categories

### 1. Achievement Management

```javascript
// List all achievements
Konomi.achievements.list();

// Unlock achievement
Konomi.achievements.unlock('achievement-name', {
    timestamp: Date.now(),
    metadata: { user: 'agent-001' }
});

// Get specific achievement
Konomi.achievements.get('achievement-name');

// Reset all achievements
Konomi.achievements.reset();
```

### 2. Configuration

```javascript
// Load config from file
Konomi.config.load('config/server.yaml');

// Get config value
Konomi.config.get('server.port', 3000);

// Set config value
Konomi.config.set('server.port', 8080);

// Show all config
Konomi.config.show();
```

### 3. Server Management

```javascript
// Start API server
await Konomi.server.start(3000, 'config/server.yaml');

// Stop server
Konomi.server.stop();

// Check status
Konomi.server.status();

// Restart server
await Konomi.server.restart(3000);
```

### 4. MCP Protocol

```javascript
// Start MCP server
await Konomi.mcp.start(3001);

// List available tools
Konomi.mcp.listTools();

// Execute MCP tool
await Konomi.mcp.execute('konomi_version', {});
```

### 5. Command Execution

```javascript
// Run single command
await Konomi.exec.run('ls', ['-la']);

// Run multiple commands
await Konomi.exec.runMultiple([
    { command: 'echo', args: ['hello'] },
    { command: 'pwd', args: [] }
]);

// Spawn process
Konomi.exec.spawn('node', ['server.js']);
```

### 6. Tag Management

```javascript
// List all tags
Konomi.tags.list();

// Add new tag
Konomi.tags.add('custom-tag', {
    styles: { color: 'blue' },
    classes: ['custom-class']
});

// Remove tag
Konomi.tags.remove('old-tag');

// Apply tags to target
Konomi.tags.apply('component-id', ['primary', 'glow']);
```

### 7. Component Utilities

```javascript
// List components
Konomi.components.list();

// Create component
Konomi.components.create('ScreenName', 'ScreenContainer', {
    title: 'My Screen',
    tags: ['custom']
});

// Render component
Konomi.components.render('component-id');
```

### 8. Metrics & Analytics

```javascript
// Record metric
Konomi.metrics.record('api.requests', 100);

// Get metric value
Konomi.metrics.get('api.requests');

// Get summary
Konomi.metrics.summary();

// Export metrics
Konomi.metrics.export('json');
```

### 9. Utilities

```javascript
// Get version
Konomi.utils.version();

// Get app info
Konomi.utils.info();

// Validate data
Konomi.utils.validate(data, schema);

// Format data
Konomi.utils.format({ key: 'value' }, 'json');

// Hash data
Konomi.utils.hash('sensitive-data');
```

### 10. Help & Documentation

```javascript
// Show all commands
Konomi.help.commands();

// Get examples
Konomi.help.examples();
```

## Usage Examples

### Example 1: Achievement Workflow

```javascript
import { Konomi } from './cli/konomi.js';

// Unlock achievement and record metric
Konomi.achievements.unlock('first-build', {
    timestamp: Date.now()
});
Konomi.metrics.record('builds.completed', 1);

// Get summary
const summary = Konomi.metrics.summary();
console.log(summary);
```

### Example 2: Server Automation

```javascript
// Start both servers
await Konomi.server.start(3000);
await Konomi.mcp.start(3001);

// Check status
const status = Konomi.server.status();
console.log('Server status:', status);
```

### Example 3: Configuration Management

```javascript
// Load and modify config
const config = Konomi.config.load();
Konomi.config.set('server.port', 8080);
Konomi.config.set('mcp.enabled', true);

// Show updated config
Konomi.config.show();
```

### Example 4: Component Creation

```javascript
// Create new screen with tags
const screen = Konomi.components.create('Dashboard', 'ScreenContainer', {
    title: 'Main Dashboard',
    url: 'html/dashboard.html',
    tags: ['center', 'primary', 'glow', 'interactive']
});

// Apply additional tags
Konomi.tags.apply('Dashboard', ['live', 'metrics']);
```

### Example 5: Batch Operations

```javascript
// Execute multiple commands
const results = await Konomi.exec.runMultiple([
    { command: 'npm', args: ['install'] },
    { command: 'npm', args: ['test'] },
    { command: 'npm', args: ['run', 'build'] }
]);

results.forEach((result, i) => {
    console.log(`Command ${i + 1}:`, result.exitCode);
});
```

## Running Examples

```bash
# Run all examples
npm run konomi:examples

# Or directly
node cli/examples.js
```

## Interactive Development

```bash
# Start REPL
npm run konomi:repl

# Inside REPL
konomi> Konomi.achievements.list()
konomi> .help
konomi> .examples
konomi> .exit
```

## Use in Your Code

```javascript
import { Konomi } from './cli/konomi.js';

// In your application
class MyApp {
    async initialize() {
        // Start servers
        await Konomi.server.start(3000);
        
        // Record initialization
        Konomi.achievements.unlock('app-started');
        Konomi.metrics.record('app.starts', 1);
    }
    
    async shutdown() {
        // Cleanup
        Konomi.server.stop();
        Konomi.metrics.export('json');
    }
}
```

## API Surface

All functions are **static** and can be called without instantiation:

- ✅ No `new Konomi()` needed
- ✅ Direct function calls
- ✅ Tree-shakeable imports
- ✅ Type-safe (with JSDoc)
- ✅ Async/await support

## Best Practices

1. **Use async/await** for server operations
2. **Chain operations** for workflows
3. **Record metrics** for important events
4. **Validate config** before use
5. **Handle errors** appropriately

## Next Steps

- Explore the REPL: `npm run konomi:repl`
- Run examples: `npm run konomi:examples`
- Build your automation workflows
- Integrate with CI/CD pipelines
