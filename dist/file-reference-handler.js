"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileReferenceHandler = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * File reference utility
 * Handles the @ syntax for referencing files and directories
 */
class FileReferenceHandler {
    /**
     * Parse a prompt and extract file references marked with @ syntax
     * For example: "Analyze @src/main.js and @package.json"
     */
    static extractFileReferences(prompt) {
        // Regex to match @ followed by a path (files or directories)
        // Matches @ followed by word characters, slashes, dots, hyphens, and underscores
        const regex = /@([\w/.-]+)/g;
        const matches = [];
        let match;
        while ((match = regex.exec(prompt)) !== null) {
            matches.push(match[1]);
        }
        return matches;
    }
    /**
     * Resolve file references in a prompt by replacing @path with actual file content
     */
    static async resolveFileReferences(prompt, basePath = process.cwd()) {
        const references = this.extractFileReferences(prompt);
        let resolvedPrompt = prompt;
        for (const reference of references) {
            const resolvedPath = path.resolve(basePath, reference);
            try {
                if (fs.statSync(resolvedPath).isDirectory()) {
                    // Handle directory reference - include content of all files in the directory
                    const dirContent = await this.getDirectoryContent(resolvedPath);
                    resolvedPrompt = resolvedPrompt.replace(`@${reference}`, `Contents of directory ${reference}:\n${dirContent}`);
                }
                else {
                    // Handle file reference - read and include file content
                    const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
                    resolvedPrompt = resolvedPrompt.replace(`@${reference}`, `Content of ${reference}:\n\`\`\`\n${fileContent}\n\`\`\``);
                }
            }
            catch (error) {
                console.warn(`Could not read file/directory: ${resolvedPath}`, error);
                resolvedPrompt = resolvedPrompt.replace(`@${reference}`, `Error: Could not read ${reference} at ${resolvedPath}`);
            }
        }
        return resolvedPrompt;
    }
    /**
     * Get content of all files in a directory recursively
     */
    static async getDirectoryContent(dirPath, depth = 0) {
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
            }
            else {
                // Only include text-based files
                if (this.isTextFile(item)) {
                    try {
                        const fileContent = fs.readFileSync(fullPath, 'utf-8');
                        content += `\nFile: ${item}\n\`\`\`\n${fileContent}\n\`\`\`\n`;
                    }
                    catch (error) {
                        console.warn(`Could not read file: ${fullPath}`, error);
                        content += `File: ${item} (could not read)\n`;
                    }
                }
                else {
                    content += `File: ${item} (binary or non-text file)\n`;
                }
            }
        }
        return content;
    }
    /**
     * Check if a file is likely a text-based file that we can read
     */
    static isTextFile(filename) {
        const textExtensions = ['.txt', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.json', '.yaml', '.yml', '.md', '.html', '.css', '.scss', '.sql', '.sh', '.bash', '.rs', '.go', '.c', '.cpp', '.h', '.hpp', '.xml', '.toml', '.ini', '.cfg', '.log'];
        const ext = path.extname(filename).toLowerCase();
        return textExtensions.includes(ext) || ext === '';
    }
}
exports.FileReferenceHandler = FileReferenceHandler;
//# sourceMappingURL=file-reference-handler.js.map