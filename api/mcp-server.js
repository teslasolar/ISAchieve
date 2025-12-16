import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class KonomiMCPServer {
    constructor(configPath) {
        this.config = yaml.load(readFileSync(configPath, 'utf8'));
        this.server = new Server(
            {
                name: 'konomi-isachieve',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupHandlers();
    }

    setupHandlers() {
        // List available tools
        this.server.setRequestHandler('tools/list', async () => {
            const tools = this.config.tools.map(tool => ({
                name: tool.name,
                description: tool.description,
                inputSchema: {
                    type: 'object',
                    properties: tool.parameters || {},
                    required: tool.required || []
                }
            }));

            return { tools };
        });

        // Execute tool
        this.server.setRequestHandler('tools/call', async (request) => {
            const { name, arguments: args } = request.params;
            
            const tool = this.config.tools.find(t => t.name === name);
            if (!tool) {
                throw new Error(`Tool not found: ${name}`);
            }

            if (!tool.enabled) {
                throw new Error(`Tool disabled: ${name}`);
            }

            try {
                const result = await this.executeTool(tool, args);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            } catch (error) {
                throw new Error(`Tool execution failed: ${error.message}`);
            }
        });
    }

    async executeTool(tool, args) {
        let cmd = tool.command;

        // Replace arguments in command
        Object.entries(args || {}).forEach(([key, value]) => {
            cmd = cmd.replace(`{${key}}`, value);
        });

        const { stdout, stderr } = await execAsync(cmd, {
            timeout: tool.timeout || 30000
        });

        return {
            success: true,
            output: stdout.trim(),
            error: stderr.trim(),
            tool: tool.name
        };
    }

    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('🔌 Konomi MCP Server started');
    }
}

export async function startMCPServer(options) {
    const mcpServer = new KonomiMCPServer(options.config);
    await mcpServer.start();
}
