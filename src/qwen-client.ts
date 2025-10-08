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
      timeout: 30000, // Reduced back to 30s for non-interactive mode
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
    console.log(`[QwenClient] Starting qwen process for prompt: ${fullPrompt.substring(0, 100)}...`);
    
    return new Promise((resolve) => {
      // Use -p flag for non-interactive mode
      const qwen = spawn('qwen', ['-p', fullPrompt], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let timeoutId: NodeJS.Timeout;
      let resolved = false;

      const resolveOnce = (result: QwenResponse) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve(result);
        }
      };

      qwen.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(`[QwenClient] Received stdout: ${data.toString().substring(0, 100)}...`);
      });

      qwen.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log(`[QwenClient] Received stderr: ${data.toString()}`);
      });

      qwen.on('close', (code) => {
        console.log(`[QwenClient] Process closed with code: ${code}`);
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
        console.log(`[QwenClient] Timeout after ${this.config.timeout}ms`);
        qwen.kill('SIGTERM');
        resolveOnce({
          content: '',
          model: this.config.model || 'qwen-max',
          error: `Request timeout after ${this.config.timeout}ms`
        });
      }, this.config.timeout);

      console.log(`[QwenClient] Started qwen process with -p flag`);
    });
  }

  async analyzeContent(content: string, prompt: string = 'Analyze this content'): Promise<QwenResponse> {
    return await this.ask(prompt, content);
  }
}
