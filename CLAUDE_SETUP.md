# Configuring Qwen MCP Server with Claude Desktop

## Prerequisites
- Claude Desktop app installed (https://claude.ai/download)
- Node.js and npm installed
- The qwen-mcp-tool project files

## Configuration Steps

1. **Install the server dependencies:**
   ```bash
   cd /home/yanggf/a/qwen-mcp-tool
   npm install
   ```

2. **Set up your Qwen API key (if you have one):**
   ```bash
   export QWEN_API_KEY="your-api-key-here"
   ```

3. **Open Claude Desktop preferences:**
   - Open Claude Desktop app
   - Go to Settings/Preferences
   - Look for "Model Context Protocol" or "MCP Servers" section

4. **Add the MCP server configuration:**
   In the Claude Desktop configuration (usually found in preferences), add:

   ```json
   {
     "experimental": {
       "mcpServers": {
         "qwen-mcp": {
           "command": "npx",
           "args": ["tsx", "/home/yanggf/a/qwen-mcp-tool/src/index.ts"],
           "env": {
             "QWEN_API_KEY": "your-api-key-here"
           }
         }
       }
     }
   }
   ```

   Or if you build the project:
   ```json
   {
     "experimental": {
       "mcpServers": {
         "qwen-mcp": {
           "command": "node",
           "args": ["/home/yanggf/a/qwen-mcp-tool/dist/index.js"],
           "env": {
             "QWEN_API_KEY": "your-api-key-here"
           }
         }
       }
     }
   }
   ```

5. **Alternative - Global Installation:**
   You can also install the package globally:
   ```bash
   cd /home/yanggf/a/qwen-mcp-tool
   npm install -g
   ```

   Then in Claude Desktop settings:
   ```json
   {
     "experimental": {
       "mcpServers": {
         "qwen-mcp": {
           "command": "qwen-mcp-server",
           "env": {
             "QWEN_API_KEY": "your-api-key-here"
           }
         }
       }
     }
   }
   ```

6. **Restart Claude Desktop** after making configuration changes.

7. **Verify the connection** by looking for the tools in Claude's UI.

## Using the Tools in Claude

Once configured, you should be able to use:
- `ask-qwen` tool to query Qwen
- Reference files with @ syntax like `@package.json` or `@src/`
- Use `ping` and `help` tools to test connectivity

Note: The exact configuration path in Claude Desktop may vary depending on the version. Look for "Tools" or "MCP" settings in the preferences.