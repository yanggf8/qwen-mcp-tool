// Simple test to verify MCP SDK imports work
try {
  // Test imports from the MCP SDK
  const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp');
  const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');
  console.log('MCP SDK imports work correctly!');
  console.log('McpServer type:', typeof McpServer);
  console.log('StdioServerTransport type:', typeof StdioServerTransport);
} catch (error) {
  console.error('Error importing MCP SDK:', error.message);
}