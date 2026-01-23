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

  // Execute test cases sequentially (parallel could cause resource issues)
  // Each execution has a 10-second timeout, so total time is bounded
  for (const testCase of testCases) {
    try {
      const startTime = Date.now();

      // Execute code with test case input (with 10s timeout per test case)
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



