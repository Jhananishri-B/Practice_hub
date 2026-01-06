import { executeCode, validateLanguage } from '../utils/codeExecutor';
import logger from '../config/logger';

export interface TestCaseResult {
  test_case_id: string;
  passed: boolean;
  expected_output: string;
  actual_output: string;
  error_message?: string;
  execution_time?: number;
}

export const evaluateCode = async (
  code: string,
  language: string,
  testCases: Array<{ id: string; input_data: string; expected_output: string }>,
  courseName: string
): Promise<TestCaseResult[]> => {
  // Validate language
  if (!validateLanguage(courseName, language)) {
    throw new Error(`Invalid language for ${courseName} course. Expected: ${courseName === 'Python' ? 'python' : 'c'}`);
  }

  const results: TestCaseResult[] = [];

  for (const testCase of testCases) {
    try {
      const startTime = Date.now();
      
      // Execute code with test case input
      const executionResult = await executeCode(code, language, testCase.input_data);
      const executionTime = Date.now() - startTime;

      // If there's an error, test case fails
      if (executionResult.error) {
        results.push({
          test_case_id: testCase.id,
          passed: false,
          expected_output: testCase.expected_output,
          actual_output: executionResult.output || '',
          error_message: executionResult.error,
          execution_time: executionTime,
        });
        continue;
      }

      // Normalize outputs for comparison
      const expectedOutput = normalizeOutput(testCase.expected_output);
      const actualOutput = normalizeOutput(executionResult.output || '');

      // Strict comparison - must match exactly after normalization
      const passed = expectedOutput === actualOutput;

      results.push({
        test_case_id: testCase.id,
        passed,
        expected_output: testCase.expected_output,
        actual_output: executionResult.output || '',
        error_message: undefined,
        execution_time: executionTime,
      });
    } catch (error: any) {
      results.push({
        test_case_id: testCase.id,
        passed: false,
        expected_output: testCase.expected_output,
        actual_output: '',
        error_message: error.message || 'Execution error',
      });
    }
  }

  return results;
};

const normalizeOutput = (output: string): string => {
  if (!output) return '';
  // Normalize line endings and trim, but preserve structure
  return output
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd()) // Only trim trailing spaces, preserve leading
    .join('\n')
    .trim(); // Final trim of entire string
};

// Python code execution using child_process
export const executePythonCode = async (
  code: string,
  input: string
): Promise<{ output: string; error?: string }> => {
  const { spawn } = await import('child_process');
  const { promisify } = await import('util');
  
  if (!code || code.trim().length === 0) {
    return { output: '', error: 'Empty code' };
  }

  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', ['-c', code], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000, // 5 second timeout
    });

    let stdout = '';
    let stderr = '';

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

    pythonProcess.on('close', (code) => {
      if (code !== 0 || stderr) {
        resolve({ output: stdout, error: stderr || `Process exited with code ${code}` });
      } else {
        resolve({ output: stdout, error: undefined });
      }
    });

    pythonProcess.on('error', (error) => {
      // Try python if python3 is not available
      if (error.message.includes('python3')) {
        const pythonProcess2 = spawn('python', ['-c', code], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 5000,
        });

        let stdout2 = '';
        let stderr2 = '';

        if (input) {
          pythonProcess2.stdin.write(input);
          pythonProcess2.stdin.end();
        }

        pythonProcess2.stdout.on('data', (data) => {
          stdout2 += data.toString();
        });

        pythonProcess2.stderr.on('data', (data) => {
          stderr2 += data.toString();
        });

        pythonProcess2.on('close', (code2) => {
          if (code2 !== 0 || stderr2) {
            resolve({ output: stdout2, error: stderr2 || `Process exited with code ${code2}` });
          } else {
            resolve({ output: stdout2, error: undefined });
          }
        });

        pythonProcess2.on('error', (error2) => {
          resolve({ output: '', error: `Python not available: ${error2.message}` });
        });
      } else {
        resolve({ output: '', error: error.message });
      }
    });
  });
};

// C code execution using gcc
export const executeCCode = async (
  code: string,
  input: string
): Promise<{ output: string; error?: string }> => {
  const { spawn } = await import('child_process');
  const fs = await import('fs/promises');
  const path = await import('path');
  const os = await import('os');
  
  if (!code || code.trim().length === 0) {
    return { output: '', error: 'Empty code' };
  }

  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `code_${Date.now()}.c`);
  const execFile = path.join(tempDir, `code_${Date.now()}`);

  try {
    // Write code to temp file
    await fs.writeFile(tempFile, code);

    // Compile
    return new Promise((resolve) => {
      const compileProcess = spawn('gcc', [tempFile, '-o', execFile, '-lm'], {
        timeout: 5000,
      });

      let compileError = '';

      compileProcess.stderr.on('data', (data) => {
        compileError += data.toString();
      });

      compileProcess.on('close', (compileCode) => {
        if (compileCode !== 0) {
          // Cleanup
          fs.unlink(tempFile).catch(() => {});
          resolve({ output: '', error: `Compilation error: ${compileError}` });
          return;
        }

        // Execute
        const execProcess = spawn(execFile, [], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 5000,
        });

        let stdout = '';
        let stderr = '';

        if (input) {
          execProcess.stdin.write(input);
          execProcess.stdin.end();
        }

        execProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        execProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        execProcess.on('close', (execCode) => {
          // Cleanup
          fs.unlink(tempFile).catch(() => {});
          fs.unlink(execFile).catch(() => {});

          if (execCode !== 0 || stderr) {
            resolve({ output: stdout, error: stderr || `Process exited with code ${execCode}` });
          } else {
            resolve({ output: stdout, error: undefined });
          }
        });

        execProcess.on('error', (error) => {
          // Cleanup
          fs.unlink(tempFile).catch(() => {});
          fs.unlink(execFile).catch(() => {});
          resolve({ output: '', error: error.message });
        });
      });

      compileProcess.on('error', (error) => {
        // Cleanup
        fs.unlink(tempFile).catch(() => {});
        resolve({ output: '', error: `GCC not available: ${error.message}` });
      });
    });
  } catch (error: any) {
    return { output: '', error: error.message };
  }
};

