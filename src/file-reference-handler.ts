import * as fs from 'fs';
import * as path from 'path';

/**
 * File reference utility
 * Handles the @ syntax for referencing files and directories
 */
export class FileReferenceHandler {
  /**
   * Parse a prompt and extract file references marked with @ syntax
   * For example: "Analyze @src/main.js and @package.json"
   */
  static extractFileReferences(prompt: string): string[] {
    // Regex to match @ followed by a path (files or directories)
    // Matches @ followed by word characters, slashes, dots, hyphens, and underscores
    const regex = /@([\w/.-]+)/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(prompt)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  }

  /**
   * Resolve file references in a prompt by replacing @path with actual file content
   */
  static async resolveFileReferences(prompt: string, basePath: string = process.cwd()): Promise<string> {
    const references = this.extractFileReferences(prompt);
    
    let resolvedPrompt = prompt;
    
    for (const reference of references) {
      const resolvedPath = path.resolve(basePath, reference);
      
      try {
        if (fs.statSync(resolvedPath).isDirectory()) {
          // Handle directory reference - include content of all files in the directory
          const dirContent = await this.getDirectoryContent(resolvedPath);
          resolvedPrompt = resolvedPrompt.replace(`@${reference}`, `Contents of directory ${reference}:\n${dirContent}`);
        } else {
          // Handle file reference - read and include file content
          const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
          resolvedPrompt = resolvedPrompt.replace(`@${reference}`, `Content of ${reference}:\n\`\`\`\n${fileContent}\n\`\`\``);
        }
      } catch (error) {
        console.warn(`Could not read file/directory: ${resolvedPath}`, error);
        resolvedPrompt = resolvedPrompt.replace(`@${reference}`, `Error: Could not read ${reference} at ${resolvedPath}`);
      }
    }

    return resolvedPrompt;
  }

  /**
   * Get content of all files in a directory recursively
   */
  private static async getDirectoryContent(dirPath: string, depth: number = 0): Promise<string> {
    if (depth > 5) { // Prevent too deep recursion
      return '... [directory too deep, stopping recursion]';
    }

    const items = fs.readdirSync(dirPath);
    let content = '';

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        content += `\nDirectory: ${item}/\n`;
        content += await this.getDirectoryContent(fullPath, depth + 1);
      } else {
        // Only include text-based files
        if (this.isTextFile(item)) {
          try {
            const fileContent = fs.readFileSync(fullPath, 'utf-8');
            content += `\nFile: ${item}\n\`\`\`\n${fileContent}\n\`\`\`\n`;
          } catch (error) {
            console.warn(`Could not read file: ${fullPath}`, error);
            content += `File: ${item} (could not read)\n`;
          }
        } else {
          content += `File: ${item} (binary or non-text file)\n`;
        }
      }
    }

    return content;
  }

  /**
   * Check if a file is likely a text-based file that we can read
   */
  private static isTextFile(filename: string): boolean {
    const textExtensions = ['.txt', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.json', '.yaml', '.yml', '.md', '.html', '.css', '.scss', '.sql', '.sh', '.bash', '.rs', '.go', '.c', '.cpp', '.h', '.hpp', '.xml', '.toml', '.ini', '.cfg', '.log'];
    const ext = path.extname(filename).toLowerCase();
    return textExtensions.includes(ext) || ext === '';
  }
}