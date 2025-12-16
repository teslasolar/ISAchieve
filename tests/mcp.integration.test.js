/**
 * Konomi ISAchieve - MCP Integration Tests
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import fetch from 'node-fetch';

const MCP_URL = process.env.KONOMI_MCP_URL || 'http://localhost:3001';

describe('Konomi MCP Integration Tests', () => {
    describe('MCP Server Health', () => {
        it('should respond to health check', async () => {
            const response = await fetch(`${MCP_URL}/health`);
            const data = await response.json();
            
            expect(data.status).toBe('healthy');
            expect(data.server).toBe('konomi-mcp');
        });

        it('should return capabilities', async () => {
            const response = await fetch(`${MCP_URL}/capabilities`);
            const data = await response.json();
            
            expect(data.tools).toBeDefined();
            expect(data.version).toBeDefined();
        });
    });

    describe('MCP Tools', () => {
        it('should list available tools', async () => {
            const response = await fetch(`${MCP_URL}/tools`);
            const data = await response.json();
            
            expect(Array.isArray(data.tools)).toBe(true);
            expect(data.tools.length).toBeGreaterThan(0);
        });

        it('should execute konomi_version tool', async () => {
            const response = await fetch(`${MCP_URL}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'konomi_version',
                    args: {}
                })
            });
            const data = await response.json();
            
            expect(data.result).toBeDefined();
            expect(data.result.version).toBeDefined();
        });

        it('should execute konomi_execute tool', async () => {
            const response = await fetch(`${MCP_URL}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'konomi_execute',
                    args: { command: 'help' }
                })
            });
            const data = await response.json();
            
            expect(data.result).toBeDefined();
            expect(data.success).toBe(true);
        });

        it('should list commands via MCP', async () => {
            const response = await fetch(`${MCP_URL}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'konomi_list_commands',
                    args: {}
                })
            });
            const data = await response.json();
            
            expect(Array.isArray(data.result.commands)).toBe(true);
        });
    });

    describe('MCP Error Handling', () => {
        it('should handle invalid tool names', async () => {
            const response = await fetch(`${MCP_URL}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'invalid_tool',
                    args: {}
                })
            });
            
            expect(response.status).toBe(400);
        });

        it('should handle missing arguments', async () => {
            const response = await fetch(`${MCP_URL}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'konomi_execute'
                    // missing args
                })
            });
            
            expect(response.status).toBe(400);
        });
    });

    describe('MCP Tool Schemas', () => {
        it('should provide schema for each tool', async () => {
            const response = await fetch(`${MCP_URL}/tools/konomi_version/schema`);
            const data = await response.json();
            
            expect(data.schema).toBeDefined();
            expect(data.schema.parameters).toBeDefined();
        });

        it('should validate tool arguments', async () => {
            const response = await fetch(`${MCP_URL}/tools/konomi_execute/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    args: { command: 'version' }
                })
            });
            
            expect(response.status).toBe(200);
        });
    });
});
