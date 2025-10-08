import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { z } from 'zod';
import { QwenClient } from './qwen-client.js';
import { FileReferenceHandler } from './file-reference-handler.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';

// Define the Qwen MCP Server
class QwenMCPServer {
  constructor() {}

  public async start() {
    // Create an MCP server
    const server = new McpServer({
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
        prompt: z.string(),
        context: z.string().optional(),
      }
    }, async (input: { prompt: string; context?: string }) => {
      try {
        // Resolve any file references in the prompt
        const resolvedPrompt = await FileReferenceHandler.resolveFileReferences(input.prompt);
        
        // Create a Qwen client instance
        const qwenClient = new QwenClient({
          apiKey: process.env.QWEN_API_KEY, // Use API key from environment if available
        });
        
        // Get response from Qwen
        const response = await qwenClient.ask(resolvedPrompt, input.context);
        
        return { 
          content: [{ type: 'text', text: response.content }]
        };
      } catch (error: unknown) {
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
        code: z.string(),
        language: z.string().optional(),
      }
    }, async (input: { code: string; language?: string }) => {
      try {
        // In a real implementation, this would execute code in a secure sandbox
        // For this implementation, just return the code that would have been executed
        console.log(`Sandbox execution requested for ${input.language || 'unknown'} language`);
        
        // For demonstration purposes, just return the code that would have been executed
        const output = `Code execution result:\n${input.code.substring(0, 200)}...`;
        return { 
          content: [{ type: 'text', text: output }]
        };
      } catch (error: unknown) {
        console.error('Error in sandbox-test tool:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { 
          content: [{ type: 'text', text: `Sandbox execution error: ${errorMessage}` }]
        };
      }
    });

    // Create stdio transport and connect the server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log(`Qwen MCP Server started and listening via stdio`);
  }
}

// Import process to use it in ES modules
import process from 'process';

// Start the server if this file is run directly
import { pathToFileURL } from 'url';

// Check if this file is being executed directly (equivalent to require.main === module in CommonJS)
if (pathToFileURL(process.argv[1]).href === import.meta.url) {
  const server = new QwenMCPServer();
  server.start().catch(console.error);
}

export { QwenMCPServer };