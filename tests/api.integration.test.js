/**
 * Konomi ISAchieve - API Integration Tests
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import fetch from 'node-fetch';

const API_URL = process.env.KONOMI_API_URL || 'http://localhost:3000';

describe('Konomi API Integration Tests', () => {
    let server;

    beforeAll(async () => {
        // Start server if not running
        // server = await startServer();
    });

    afterAll(async () => {
        // if (server) await server.close();
    });

    describe('Health Endpoints', () => {
        it('should return health status', async () => {
            const response = await fetch(`${API_URL}/api/health`);
            const data = await response.json();
            
            expect(response.status).toBe(200);
            expect(data.status).toBe('ok');
        });

        it('should return server info', async () => {
            const response = await fetch(`${API_URL}/api/info`);
            const data = await response.json();
            
            expect(data.name).toBe('Konomi ISAchieve');
            expect(data.version).toBeDefined();
        });
    });

    describe('Commands API', () => {
        it('should list all available commands', async () => {
            const response = await fetch(`${API_URL}/api/commands`);
            const data = await response.json();
            
            expect(Array.isArray(data.commands)).toBe(true);
            expect(data.commands.length).toBeGreaterThan(0);
        });

        it('should execute a command', async () => {
            const response = await fetch(`${API_URL}/api/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'version' })
            });
            const data = await response.json();
            
            expect(data.success).toBe(true);
            expect(data.output).toBeDefined();
        });

        it('should handle invalid commands', async () => {
            const response = await fetch(`${API_URL}/api/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'invalid-cmd' })
            });
            
            expect(response.status).toBe(400);
        });

        it('should execute command with args', async () => {
            const response = await fetch(`${API_URL}/api/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    command: 'config',
                    args: ['show']
                })
            });
            const data = await response.json();
            
            expect(data.success).toBe(true);
        });
    });

    describe('Configuration API', () => {
        it('should get current config', async () => {
            const response = await fetch(`${API_URL}/api/config`);
            const data = await response.json();
            
            expect(data.config).toBeDefined();
        });

        it('should validate config updates', async () => {
            const response = await fetch(`${API_URL}/api/config/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    server: { port: 3000 }
                })
            });
            
            expect(response.status).toBe(200);
        });
    });

    describe('Error Handling', () => {
        it('should handle 404 routes', async () => {
            const response = await fetch(`${API_URL}/api/nonexistent`);
            expect(response.status).toBe(404);
        });

        it('should handle malformed JSON', async () => {
            const response = await fetch(`${API_URL}/api/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'invalid json'
            });
            
            expect(response.status).toBe(400);
        });
    });
});
