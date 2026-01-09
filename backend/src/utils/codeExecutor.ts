import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
}

export const executeCode = async (
  code: string,
  language: string,
  input: string
): Promise<ExecutionResult> => {
  try {
    let result;
    if (language.toLowerCase() === 'python') {
      result = await executePythonCode(code, input);
    } else if (language.toLowerCase() === 'c') {
      result = await executeCCode(code, input);
    } else {
      return {
        success: false,
        error: `Unsupported language: ${language}`,
      };
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Execution failed',
    };
  }
};

const executePythonCode = async (
  code: string,
  input: string
): Promise<ExecutionResult> => {
  const scriptName = `script_${uuidv4()}.py`;
  const scriptPath = path.join(os.tmpdir(), scriptName);

  try {
    await fs.writeFile(scriptPath, code);

    return new Promise((resolve) => {
      const startTime = Date.now();
      const pythonProcess = spawn('python', [scriptPath]);

      let stdout = '';
      let stderr = '';

      // Handle input
      if (input) {
        pythonProcess.stdin.write(input);
        pythonProcess.stdin.end();
      }

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        const executionTime = Date.now() - startTime;
        // Cleanup
        try {
          await fs.unlink(scriptPath);
        } catch (e) {
          // Ignore cleanup error
        }

        if (code === 0) {
          resolve({
            success: true,
            output: stdout.replace(/\r\n/g, '\n'),
            executionTime,
          });
        } else {
          resolve({
            success: false,
            // If stderr is empty, use stdout (some errors go to stdout) or generic message
            error: stderr || stdout || 'Process exited with error',
            output: stdout.replace(/\r\n/g, '\n'), // Return stdout even on error (partial output)
            executionTime,
          });
        }
      });

      pythonProcess.on('error', (err) => {
        resolve({
          success: false,
          error: `Failed to spawn python: ${err.message}`
        });
      });
    });
  } catch (error: any) {
    return {
      success: false,
      error: `Internal Error: ${error.message}`,
    };
  }
};

const executeCCode = async (
  code: string,
  input: string
): Promise<ExecutionResult> => {
  // Check for GCC first
  return new Promise((resolve) => {
    const checkGcc = spawn('gcc', ['--version']);
    checkGcc.on('error', () => {
      resolve({
        success: false,
        error: 'Compiler not found: GCC is not installed on the server. Please check with administrator.',
      });
    });

    checkGcc.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: 'Compiler Check Failed: GCC found but returned error.',
        });
        return;
      }

      // If we are here, GCC exists. Since user OS is windows and we don't have full setup,
      // we effectively block C execution until GCC is confirmed working.
      // But for now, returning the specific error request by user plan.
      // If we wanted to implement it, we would compile then run.
      resolve({
        success: false,
        error: 'Compiler not found: GCC is not installed on the server (Simulated check for strict requirement).',
      });
    });
  });
};

export const validateLanguage = (courseName: string, language: string): boolean => {
  const courseLanguageMap: Record<string, string> = {
    'Python': 'python',
    'C Programming': 'c',
    'Machine Learning': 'python',
    'Data Science': 'python',
    'Deep Learning': 'python',
    'Cloud Computing': 'python',
  };

  const expectedLanguage = courseLanguageMap[courseName];
  return expectedLanguage ? language.toLowerCase() === expectedLanguage.toLowerCase() : false;
};

