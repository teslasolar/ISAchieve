import express from 'express';
import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class KonomiServer {
    constructor(configPath) {
        this.app = express();
        this.config = yaml.load(readFileSync(configPath, 'utf8'));
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.json());
        
        // CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });

        // Logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', service: 'Konomi ISAchieve' });
        });

        // Execute CLI command via API
        this.app.post('/api/command/:name', async (req, res) => {
            const { name } = req.params;
            const { args = [], options = {} } = req.body;

            const commandConfig = this.config.commands.find(c => c.name === name);
            
            if (!commandConfig) {
                return res.status(404).json({ error: 'Command not found' });
            }

            if (!commandConfig.enabled) {
                return res.status(403).json({ error: 'Command disabled' });
            }

            try {
                const result = await this.executeCommand(commandConfig, args, options);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // List available commands
        this.app.get('/api/commands', (req, res) => {
            const commands = this.config.commands
                .filter(c => c.enabled)
                .map(c => ({
                    name: c.name,
                    description: c.description,
                    allowMultiple: c.allowMultiple,
                    tags: c.tags
                }));
            res.json({ commands });
        });

        // Achievement endpoints
        this.app.get('/api/achievements', (req, res) => {
            res.json({ achievements: [] }); // Implement actual storage
        });

        this.app.post('/api/achievements/:id/unlock', (req, res) => {
            const { id } = req.params;
            res.json({ success: true, id, unlocked: true });
        });
    }

    async executeCommand(commandConfig, args, options) {
        let cmd = commandConfig.command;
        
        // Replace placeholders
        args.forEach((arg, i) => {
            cmd = cmd.replace(`{${i}}`, arg);
        });

        Object.entries(options).forEach(([key, value]) => {
            cmd = cmd.replace(`{${key}}`, value);
        });

        const { stdout, stderr } = await execAsync(cmd, {
            timeout: commandConfig.timeout || 30000
        });

        return {
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            command: cmd
        };
    }

    start(port) {
        this.app.listen(port, () => {
            console.log(`🚀 Konomi ISAchieve API server running on port ${port}`);
            console.log(`📋 Available commands: ${this.config.commands.length}`);
        });
    }
}

export async function startServer(options) {
    const server = new KonomiServer(options.config);
    server.start(parseInt(options.port));
}
