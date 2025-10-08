/**
 * File reference utility
 * Handles the @ syntax for referencing files and directories
 */
export declare class FileReferenceHandler {
    /**
     * Parse a prompt and extract file references marked with @ syntax
     * For example: "Analyze @src/main.js and @package.json"
     */
    static extractFileReferences(prompt: string): string[];
    /**
     * Resolve file references in a prompt by replacing @path with actual file content
     */
    static resolveFileReferences(prompt: string, basePath?: string): Promise<string>;
    /**
     * Get content of all files in a directory recursively
     */
    private static getDirectoryContent;
    /**
     * Check if a file is likely a text-based file that we can read
     */
    private static isTextFile;
}
//# sourceMappingURL=file-reference-handler.d.ts.map