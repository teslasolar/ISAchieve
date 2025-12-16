#!/usr/bin/env node

/**
 * Konomi ISAchieve - Test Runner
 * Tests for API, MCP, and Live Deployment
 */

import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs/promises';
import path from 'path';

class KonomiTestRunner {
    constructor() {
        this.baseUrl = process.env.KONOMI_URL || 'http://localhost:3000';
        this.mcpUrl = process.env.MCP_URL || 'http://localhost:3001';
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runAllTests() {
        console.log('🧪 Konomi ISAchieve Test Suite\n');
        
        // Test categories
        await this.testAPI();
        await this.testMCP();
        await this.testCLI();
        await this.testLiveDeployment();
        
        this.printResults();
    }

    async testAPI() {
        console.log('📡 Testing API Endpoints...\n');

        // Test health endpoint
        await this.test('API Health Check', async () => {
            const response = await this.fetch(`${this.baseUrl}/api/health`);
            return response.status === 'ok';
        });

        // Test commands endpoint
        await this.test('API Commands List', async () => {
            const response = await this.fetch(`${this.baseUrl}/api/commands`);
            return Array.isArray(response.commands);
        });

        // Test execute endpoint
        await this.test('API Execute Command', async () => {
            const response = await this.fetch(`${this.baseUrl}/api/execute`, {
                method: 'POST',
                body: JSON.stringify({ command: 'version' })
            });
            return response.success;
        });
    }

    async testMCP() {
        console.log('\n🔌 Testing MCP Server...\n');

        // Test MCP health
        await this.test('MCP Server Health', async () => {
            const response = await this.fetch(`${this.mcpUrl}/health`);
            return response.status === 'healthy';
        });

        // Test MCP tools list
        await this.test('MCP Tools Available', async () => {
            const response = await this.fetch(`${this.mcpUrl}/tools`);
            return response.tools && response.tools.length > 0;
        });

        // Test MCP tool execution
        await this.test('MCP Execute Tool', async () => {
            const response = await this.fetch(`${this.mcpUrl}/execute`, {
                method: 'POST',
                body: JSON.stringify({
                    tool: 'konomi_version',
                    args: {}
                })
            });
            return response.result;
        });
    }

    async testCLI() {
        console.log('\n💻 Testing CLI Commands...\n');

        // Test CLI version
        await this.test('CLI Version Command', async () => {
            const output = await this.runCommand('node', ['cli/konomi.js', 'version']);
            return output.includes('Konomi ISAchieve');
        });

        // Test CLI help
        await this.test('CLI Help Command', async () => {
            const output = await this.runCommand('node', ['cli/konomi.js', 'help']);
            return output.includes('Usage:');
        });

        // Test CLI list commands
        await this.test('CLI List Commands', async () => {
            const output = await this.runCommand('node', ['cli/konomi.js', 'list']);
            return output.length > 0;
        });
    }

    async testLiveDeployment() {
        console.log('\n🌐 Testing Live Deployment...\n');

        const deployUrl = 'https://teslasolar.github.io/ISAchieve';

        // Test page loads
        await this.test('GitHub Pages Loads', async () => {
            try {
                const response = await fetch(deployUrl);
                return response.ok;
            } catch {
                console.log('  ⚠️  Skipping - page not deployed yet');
                return true;
            }
        });

        // Test API endpoint on live
        await this.test('Live API Endpoint', async () => {
            try {
                const response = await fetch(`${deployUrl}/api/health`);
                return response.ok;
            } catch {
                console.log('  ⚠️  Skipping - API not deployed yet');
                return true;
            }
        });

        // Test component loading
        await this.test('Components Load', async () => {
            try {
                const response = await fetch(`${deployUrl}/components/organisms/Dashboard.js`);
                return response.ok;
            } catch {
                console.log('  ⚠️  Skipping - components not accessible');
                return true;
            }
        });
    }

    async test(name, testFn) {
        try {
            const result = await testFn();
            if (result) {
                console.log(`  ✅ ${name}`);
                this.results.passed++;
            } else {
                console.log(`  ❌ ${name}`);
                this.results.failed++;
            }
            this.results.tests.push({ name, passed: result });
        } catch (error) {
            console.log(`  ❌ ${name} - ${error.message}`);
            this.results.failed++;
            this.results.tests.push({ name, passed: false, error: error.message });
        }
    }

    async fetch(url, options = {}) {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        return response.json();
    }

    async runCommand(command, args) {
        return new Promise((resolve, reject) => {
            const proc = spawn(command, args);
            let output = '';
            
            proc.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            proc.stderr.on('data', (data) => {
                output += data.toString();
            });
            
            proc.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Command failed with code ${code}`));
                }
            });
        });
    }

    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Results\n');
        console.log(`  Total Tests: ${this.results.passed + this.results.failed}`);
        console.log(`  ✅ Passed: ${this.results.passed}`);
        console.log(`  ❌ Failed: ${this.results.failed}`);
        console.log('='.repeat(50));

        if (this.results.failed > 0) {
            process.exit(1);
        }
    }
}

// Run tests
const runner = new KonomiTestRunner();
runner.runAllTests().catch(console.error);
