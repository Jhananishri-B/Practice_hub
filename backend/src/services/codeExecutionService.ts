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

      // Normalize outputs for comparison
      const expectedOutput = normalizeOutput(testCase.expected_output);
      const actualOutput = normalizeOutput(executionResult.output || '');

      const passed = expectedOutput === actualOutput;

      results.push({
        test_case_id: testCase.id,
        passed,
        expected_output: testCase.expected_output,
        actual_output: executionResult.output || '',
        error_message: executionResult.error,
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
  return output
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
};

// Simple Python code execution (for development)
export const executePythonCode = async (
  code: string,
  input: string
): Promise<{ output: string; error?: string }> => {
  // This is a placeholder - in production, use Docker or Judge0
  // For now, return a mock result
  logger.warn('Using mock code execution - implement proper execution in production');
  
  // Basic validation
  if (!code || code.trim().length === 0) {
    return { output: '', error: 'Empty code' };
  }

  // Mock execution - replace with actual Python execution
  return {
    output: 'Mock output - implement actual execution',
    error: undefined,
  };
};

// Simple C code execution (for development)
export const executeCCode = async (
  code: string,
  input: string
): Promise<{ output: string; error?: string }> => {
  // This is a placeholder - in production, use Docker or Judge0
  logger.warn('Using mock code execution - implement proper execution in production');
  
  if (!code || code.trim().length === 0) {
    return { output: '', error: 'Empty code' };
  }

  return {
    output: 'Mock output - implement actual execution',
    error: undefined,
  };
};

