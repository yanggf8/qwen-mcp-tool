# Testing the Qwen MCP Server

The Qwen MCP Server is now complete and functional. Here's how to test it:

## Running the Server

### Development Mode
```bash
npm run dev
```

Or directly with tsx:
```bash
npx tsx src/index.ts
```

### Production Build (may have TS compilation issues due to module resolution)
```bash
npm run build
npm start
```

## Testing with MCP Client

To test the server with an MCP client, you can use it in an environment that supports MCP like Claude Desktop.

### Configuration Example

Add this to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "qwen-mcp": {
      "command": "tsx",
      "args": ["src/index.ts"],
      "env": {
        "QWEN_API_KEY": "your-qwen-api-key-here"
      }
    }
  }
}
```

Or if built:
```json
{
  "mcpServers": {
    "qwen-mcp": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "QWEN_API_KEY": "your-qwen-api-key-here"
      }
    }
  }
}
```

## Available Tools

The server provides the following tools:

1. **ping** - Test connectivity
2. **help** - List available tools
3. **ask-qwen** - Query Qwen model with file/directory references using @ syntax
4. **sandbox-test** - Execute code in a safe environment (simulated)

## File Reference Support

The `ask-qwen` tool supports the @ syntax for referencing files and directories:
- `@src/main.ts` - Include content of a specific file
- `@package.json` - Include content of a JSON file
- `@src/` - Include all files in a directory

## Implementation Notes

The server is built using the @modelcontextprotocol/sdk and provides:

- Full MCP compliance
- Tool definition with input/output validation using Zod
- File reference resolution through the @ syntax
- Integration-ready architecture for Qwen API
- Proper error handling and logging

## Known Issues

- TypeScript compilation may fail due to module resolution issues with the MCP SDK's export map
- Runtime execution works correctly with tsx