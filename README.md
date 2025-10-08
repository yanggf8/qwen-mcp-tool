# Qwen MCP Tool

Qwen MCP Tool is an MCP (Model Context Protocol) server that allows AI assistants to interact with the Qwen model through a standardized protocol. This tool enables AI assistants to leverage Qwen's capabilities for file analysis, general queries, and safe code execution.

## Overview

The Qwen MCP Tool acts as a bridge between AI assistants (like Claude) and the Qwen model. It leverages Qwen's capabilities for analyzing large files and codebases, taking advantage of Qwen's large token window when dealing with extensive inputs.

## Features

- **Qwen Integration**: Direct integration with Qwen model for queries and analysis
- **File Reference Handling**: Support for @ syntax to reference files/directories in prompts
- **Sandbox Environment**: Safe code execution in isolated environment
- **MCP Compliance**: Full compliance with Model Context Protocol
- **Tool Interface**: Rich set of tools for AI assistants

## Installation

```bash
npm install -g qwen-mcp-tool
```

Or run directly with npx:

```bash
npx qwen-mcp-tool
```

## Usage

1. Set your Qwen API key as an environment variable (optional, for actual Qwen integration):
   ```bash
   export QWEN_API_KEY="your-api-key-here"
   ```

2. Start the server:
   ```bash
   qwen-mcp-server
   ```

3. The server uses stdio for MCP communication, so it's typically managed by an MCP client.

## Tools

The Qwen MCP Tool provides several tools for AI assistants:

- `ping`: Simple ping tool to test the connection
- `help`: Get help information about available tools
- `ask-qwen`: Ask Qwen model a question or analyze a file/directory
- `sandbox-test`: Execute code in a safe sandbox environment

### File References

The `ask-qwen` tool supports the @ syntax for including files or directories in your prompts. For example:

- `@src/main.js` - Include the contents of src/main.js
- `@package.json` - Include the contents of package.json
- `@src/` - Include all files in the src directory

## Configuration

To use the Qwen MCP Tool with an AI assistant, add the following to your configuration:

```json
{
  "mcpServers": {
    "qwen-mcp": {
      "command": "npx",
      "args": ["qwen-mcp-tool"],
      "env": {
        "QWEN_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run in development mode:
   ```bash
   npm run dev
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT