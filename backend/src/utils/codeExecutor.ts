// Simple code execution utility
// In production, this should use Docker or a secure sandbox

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
  // Import execution functions
  const { executePythonCode, executeCCode } = await import('../services/codeExecutionService');
  
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

    return {
      success: !result.error,
      output: result.output,
      error: result.error,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Execution failed',
    };
  }
};

export const validateLanguage = (courseName: string, language: string): boolean => {
  const courseLanguageMap: Record<string, string> = {
    'Python': 'python',
    'C Programming': 'c',
    'Machine Learning': 'python', // ML uses Python
  };

  const expectedLanguage = courseLanguageMap[courseName];
  return expectedLanguage ? language.toLowerCase() === expectedLanguage.toLowerCase() : false;
};

