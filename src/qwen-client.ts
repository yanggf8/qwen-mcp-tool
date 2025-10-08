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
      timeout: 30000,
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
    
    return new Promise((resolve) => {
      const qwen = spawn('qwen', [], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let timeoutId: NodeJS.Timeout;

      qwen.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      qwen.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      qwen.on('close', (code) => {
        clearTimeout(timeoutId);
        if (code === 0 && stdout.trim()) {
          resolve({
            content: stdout.trim(),
            model: this.config.model || 'qwen-max'
          });
        } else {
          resolve({
            content: '',
            model: this.config.model || 'qwen-max',
            error: stderr || `Process exited with code ${code}`
          });
        }
      });

      qwen.on('error', (error) => {
        clearTimeout(timeoutId);
        resolve({
          content: '',
          model: this.config.model || 'qwen-max',
          error: `Failed to start qwen process: ${error.message}`
        });
      });

      // Set timeout
      timeoutId = setTimeout(() => {
        qwen.kill('SIGTERM');
        resolve({
          content: '',
          model: this.config.model || 'qwen-max',
          error: 'Request timeout'
        });
      }, this.config.timeout);

      // Send prompt to stdin
      qwen.stdin.write(fullPrompt);
      qwen.stdin.end();
    });
  }

  async analyzeContent(content: string, prompt: string = 'Analyze this content'): Promise<QwenResponse> {
    return await this.ask(prompt, content);
  }
}
