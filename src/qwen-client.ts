import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

interface QwenConfig {
  timeout?: number;
  model?: string;
}

interface QwenResponse {
  content: string;
  model: string;
  error?: string;
}

export class QwenClient {
  private config: QwenConfig;
  private cliAvailable: boolean | null = null;

  constructor(config: QwenConfig = {}) {
    this.config = {
      timeout: 45000, // Increase to 45s to be safe
      model: 'qwen-max',
      ...config,
    };
  }

  async checkCliAvailability(): Promise<boolean> {
    if (this.cliAvailable !== null) return this.cliAvailable;
    
    try {
      await execAsync('qwen --version', { timeout: 5000 });
      this.cliAvailable = true;
      return true;
    } catch {
      this.cliAvailable = false;
      return false;
    }
  }

  async ask(prompt: string, context?: string): Promise<QwenResponse> {
    if (!(await this.checkCliAvailability())) {
      return {
        content: '',
        model: this.config.model || 'qwen-max',
        error: 'Qwen CLI not available. Please install qwen CLI tool.'
      };
    }

    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    console.log(`[QwenClient] Starting qwen process for prompt: "${fullPrompt.substring(0, 50)}..."`);
    console.log(`[QwenClient] Command: qwen -p "${fullPrompt}"`);
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      // Use -p flag for non-interactive mode
      const qwen = spawn('qwen', ['-p', fullPrompt], {
        stdio: ['ignore', 'pipe', 'pipe'] // ignore stdin since we're not using it
      });

      let stdout = '';
      let stderr = '';
      let timeoutId: NodeJS.Timeout;
      let resolved = false;

      const resolveOnce = (result: QwenResponse) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          const elapsed = Date.now() - startTime;
          console.log(`[QwenClient] Resolved after ${elapsed}ms`);
          resolve(result);
        }
      };

      qwen.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        console.log(`[QwenClient] Stdout chunk (${chunk.length} chars): ${chunk.substring(0, 100)}...`);
      });

      qwen.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        console.log(`[QwenClient] Stderr chunk: ${chunk}`);
      });

      qwen.on('close', (code) => {
        console.log(`[QwenClient] Process closed with code: ${code}, stdout length: ${stdout.length}`);
        if (code === 0 && stdout.trim()) {
          resolveOnce({
            content: stdout.trim(),
            model: this.config.model || 'qwen-max'
          });
        } else {
          resolveOnce({
            content: '',
            model: this.config.model || 'qwen-max',
            error: stderr || `Process exited with code ${code}`
          });
        }
      });

      qwen.on('error', (error) => {
        console.log(`[QwenClient] Process error: ${error.message}`);
        resolveOnce({
          content: '',
          model: this.config.model || 'qwen-max',
          error: `Failed to start qwen process: ${error.message}`
        });
      });

      // Set timeout
      timeoutId = setTimeout(() => {
        console.log(`[QwenClient] Timeout after ${this.config.timeout}ms, killing process`);
        qwen.kill('SIGKILL'); // Use SIGKILL to force termination
        resolveOnce({
          content: '',
          model: this.config.model || 'qwen-max',
          error: `Request timeout after ${this.config.timeout}ms`
        });
      }, this.config.timeout);

      console.log(`[QwenClient] Started qwen process with PID: ${qwen.pid}`);
    });
  }

  async analyzeContent(content: string, prompt: string = 'Analyze this content'): Promise<QwenResponse> {
    return await this.ask(prompt, content);
  }
}
