# Qwen MCP Tool

This is a Model Context Protocol (MCP) server that allows AI assistants to interact with the Qwen model through a standardized protocol.

## Setup Instructions

1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it "qwen-mcp-tool"
   - Make it public or private as you prefer
   - Don't initialize with a README

2. Push the code to GitHub:
   ```bash
   cd /home/yanggf/a/qwen-mcp-tool
   git remote set-url origin https://github.com/YOUR_USERNAME/qwen-mcp-tool.git
   git push -u origin master
   ```

## Usage

After setting up the repository, you can use this MCP server with compatible AI tools like Claude Desktop.

## Development

To run the server locally:
```bash
npm install
npm start
```

## Fixes

- **Real Qwen CLI Integration**: Implemented actual qwen CLI subprocess calls replacing placeholder responses
- **CLI Availability Validation**: Added automatic detection and validation of qwen CLI installation
- **Robust Error Handling**: Comprehensive subprocess error handling with timeouts and cleanup
- **Non-Interactive Mode**: Fixed timeout issues by using qwen -p flag for non-interactive mode instead of stdin
- Fixed MCP error -32602: Resolved output schema mismatch in `ask-qwen` and `sandbox-test` tools by removing custom output schemas and using standard MCP content format
- Cleaned up git repository: Removed node_modules from tracking and ensured proper .gitignore configuration

## Usage

No reinstallation needed - changes take effect on server restart using `npm start`.

## License

MIT