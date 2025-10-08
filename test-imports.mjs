// Simple test to verify MCP SDK imports work with ES modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';

console.log('MCP SDK imports work correctly!');
console.log('McpServer type:', typeof McpServer);
console.log('StdioServerTransport type:', typeof StdioServerTransport);

// If imports work, create a simple server to test functionality
const server = new McpServer({
  name: 'test-server',
  version: '1.0.0'
});

console.log('Server created successfully!');