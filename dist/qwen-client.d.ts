/**
 * Qwen API Client
 * This module provides an interface to interact with the Qwen model
 * It can be implemented using Qwen's official API or CLI when available
 */
interface QwenConfig {
    apiKey?: string;
    endpoint?: string;
    model?: string;
}
interface QwenResponse {
    content: string;
    model: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export declare class QwenClient {
    private config;
    constructor(config?: QwenConfig);
    /**
     * Send a prompt to the Qwen model and get a response
     */
    ask(prompt: string, context?: string): Promise<QwenResponse>;
    /**
     * Analyze a file or directory content with Qwen
     */
    analyzeContent(content: string, prompt?: string): Promise<QwenResponse>;
    /**
     * Set or update the API key
     */
    setApiKey(apiKey: string): void;
}
export {};
//# sourceMappingURL=qwen-client.d.ts.map