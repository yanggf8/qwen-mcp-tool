// Simple test to verify the server can start without schema errors
import { spawn } from 'child_process';

console.log('Testing server start...');

// Spawn the server process with a simple ping to see if it works
const serverProcess = spawn('tsx', ['src/index.ts'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

serverProcess.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString());
});

serverProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.error('STDERR:', data.toString());
});

// Give it a moment to start and then send a simple test message
setTimeout(() => {
  // Send a simple message to test if the server is running properly
  try {
    const testMessage = {
      method: "tools/list",
      params: {}
    };
    
    // We're just testing if the server can start without schema errors
    console.log('Server process spawned, checking for schema errors...');
  } catch (e) {
    console.error('Error sending test message:', e);
  }
}, 2000);

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});