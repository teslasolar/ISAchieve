#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

// Read package.json for version
const packageJson = JSON.parse(
    readFileSync(join(__dirname, '../package.json'), 'utf8')
);

program
    .name('konomi')
    .description('Konomi ISAchieve - CLI for achievement tracking and agent automation')
    .version(packageJson.version);

// Achievement commands
program
    .command('achieve')
    .description('Manage achievements')
    .argument('<action>', 'Action: list, add, unlock, reset')
    .argument('[name]', 'Achievement name')
    .option('-t, --tags <tags>', 'Tags (comma-separated)')
    .option('-m, --metadata <json>', 'Metadata as JSON')
    .action((action, name, options) => {
        console.log(`Achievement ${action}:`, name, options);
        // Implementation handled by achievement module
    });

// Server commands
program
    .command('serve')
    .description('Start Konomi API server')
    .option('-p, --port <port>', 'Port number', '3000')
    .option('-c, --config <file>', 'Config file', 'config/server.yaml')
    .action(async (options) => {
        const { startServer } = await import('../api/server.js');
        startServer(options);
    });

// MCP Server commands
program
    .command('mcp')
    .description('Start MCP protocol server')
    .option('-c, --config <file>', 'MCP config file', 'config/mcp.yaml')
    .action(async (options) => {
        const { startMCPServer } = await import('../api/mcp-server.js');
        startMCPServer(options);
    });

// Dashboard commands
program
    .command('dashboard')
    .description('Manage dashboard')
    .argument('<action>', 'Action: start, build, deploy')
    .option('-p, --port <port>', 'Port number', '8080')
    .action((action, options) => {
        console.log(`Dashboard ${action}:`, options);
    });

// Config commands
program
    .command('config')
    .description('Manage configuration')
    .argument('<action>', 'Action: show, edit, validate')
    .argument('[key]', 'Config key')
    .action((action, key) => {
        console.log(`Config ${action}:`, key);
    });

program.parse();
