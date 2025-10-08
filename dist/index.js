"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QwenMCPServer = void 0;
const mcp_js_1 = require("@modelcontextprotocol/sdk/dist/esm/server/mcp.js");
const zod_1 = require("zod");
const qwen_client_js_1 = require("./qwen-client.js");
const file_reference_handler_js_1 = require("./file-reference-handler.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/dist/esm/server/stdio.js");
// Define the Qwen MCP Server
class QwenMCPServer {
    constructor() { }
    async start() {
        // Create an MCP server
        const server = new mcp_js_1.McpServer({
            name: 'qwen-mcp-server',
            version: '0.1.0',
        });
        // Register tools with the server
        server.registerTool('ping', {
            description: 'Simple ping tool to test the connection'
        }, async () => {
            return {
                content: [{ type: 'text', text: 'pong' }]
            };
        });
        server.registerTool('help', {
            description: 'Get help information about available tools'
        }, async () => {
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify([
                            { name: 'ping', description: 'Simple ping tool to test the connection' },
                            { name: 'help', description: 'Get help information about available tools' },
                            { name: 'ask-qwen', description: 'Ask Qwen model a question or analyze a file/directory' },
                            { name: 'sandbox-test', description: 'Execute code in a safe sandbox environment' }
                        ])
                    }]
            };
        });
        server.registerTool('ask-qwen', {
            description: 'Ask Qwen model a question or analyze a file/directory',
            inputSchema: {
                prompt: zod_1.z.string(),
                context: zod_1.z.string().optional(),
            },
            outputSchema: {
                response: zod_1.z.string(),
            }
        }, async (input) => {
            try {
                // Resolve any file references in the prompt
                const resolvedPrompt = await file_reference_handler_js_1.FileReferenceHandler.resolveFileReferences(input.prompt);
                // Create a Qwen client instance
                const qwenClient = new qwen_client_js_1.QwenClient({
                    apiKey: process.env.QWEN_API_KEY, // Use API key from environment if available
                });
                // Get response from Qwen
                const response = await qwenClient.ask(resolvedPrompt, input.context);
                return {
                    content: [{ type: 'text', text: response.content }]
                };
            }
            catch (error) {
                console.error('Error in ask-qwen tool:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return {
                    content: [{ type: 'text', text: `Error communicating with Qwen: ${errorMessage}` }]
                };
            }
        });
        server.registerTool('sandbox-test', {
            description: 'Execute code in a safe sandbox environment',
            inputSchema: {
                code: zod_1.z.string(),
                language: zod_1.z.string().optional(),
            },
            outputSchema: {
                output: zod_1.z.string(),
                error: zod_1.z.string().optional(),
            }
        }, async (input) => {
            try {
                // In a real implementation, this would execute code in a secure sandbox
                // For this implementation, just return the code that would have been executed
                console.log(`Sandbox execution requested for ${input.language || 'unknown'} language`);
                // For demonstration purposes, just return the code that would have been executed
                return {
                    content: [{ type: 'text', text: `Code execution result:\n${input.code.substring(0, 200)}...` }]
                };
            }
            catch (error) {
                console.error('Error in sandbox-test tool:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return {
                    content: [{ type: 'text', text: `Sandbox execution error: ${errorMessage}` }]
                };
            }
        });
        // Create stdio transport and connect the server
        const transport = new stdio_js_1.StdioServerTransport();
        await server.connect(transport);
        console.log(`Qwen MCP Server started and listening via stdio`);
    }
}
exports.QwenMCPServer = QwenMCPServer;
// Start the server if this file is run directly
if (require.main === module) {
    const server = new QwenMCPServer();
    server.start().catch(console.error);
}
//# sourceMappingURL=index.js.map