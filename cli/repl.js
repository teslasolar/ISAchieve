#!/usr/bin/env node

/**
 * Konomi ISAchieve - Interactive REPL
 * Call site for testing static functions
 */

import repl from 'repl';
import { Konomi } from './konomi.js';

console.log(`
╔═══════════════════════════════════════════╗
║   🎯 Konomi ISAchieve Interactive REPL   ║
╚═══════════════════════════════════════════╝

Available Functions:
  Konomi.achievements.*  - Manage achievements
  Konomi.config.*        - Configuration
  Konomi.server.*        - Server control
  Konomi.mcp.*           - MCP protocol
  Konomi.exec.*          - Execute commands
  Konomi.tags.*          - Tag management
  Konomi.components.*    - Components
  Konomi.metrics.*       - Metrics
  Konomi.utils.*         - Utilities
  Konomi.help.*          - Help & docs

Quick Start:
  > Konomi.help.commands()
  > Konomi.achievements.list()
  > Konomi.config.show()
  > Konomi.server.start(3000)

Type .exit to quit
`);

// Start REPL with Konomi context
const replServer = repl.start({
    prompt: 'konomi> ',
    useColors: true
});

// Add Konomi to context
replServer.context.Konomi = Konomi;

// Add convenience aliases
replServer.context.achievements = Konomi.achievements;
replServer.context.config = Konomi.config;
replServer.context.server = Konomi.server;
replServer.context.mcp = Konomi.mcp;
replServer.context.exec = Konomi.exec;
replServer.context.tags = Konomi.tags;
replServer.context.components = Konomi.components;
replServer.context.metrics = Konomi.metrics;
replServer.context.utils = Konomi.utils;
replServer.context.help = Konomi.help;

// Custom commands
replServer.defineCommand('help', {
    help: 'Show available Konomi functions',
    action() {
        Konomi.help.commands();
        this.displayPrompt();
    }
});

replServer.defineCommand('examples', {
    help: 'Show usage examples',
    action() {
        const examples = Konomi.help.examples();
        console.log('\n📚 Examples:\n');
        examples.forEach((ex, i) => console.log(`  ${i + 1}. ${ex}`));
        console.log('');
        this.displayPrompt();
    }
});

replServer.defineCommand('version', {
    help: 'Show Konomi version',
    action() {
        console.log(`Konomi ISAchieve v${Konomi.utils.version()}`);
        this.displayPrompt();
    }
});

replServer.on('exit', () => {
    console.log('\n👋 Goodbye!\n');
    process.exit(0);
});
