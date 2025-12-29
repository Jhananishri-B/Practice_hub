// AI Tutor Service
// In production, integrate with TinyLlama or similar AI model

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TutorContext {
  questionTitle: string;
  questionDescription: string;
  userCode?: string;
  correctCode?: string;
  failedTestCases?: Array<{
    input: string;
    expected: string;
    actual: string;
    error?: string;
  }>;
  questionType: 'coding' | 'mcq';
  selectedAnswer?: string;
  correctAnswer?: string;
}

export const getTutorResponse = async (
  userMessage: string,
  context: TutorContext
): Promise<string> => {
  // This is a placeholder - in production, integrate with AI model
  // For now, return contextual hints based on the question and errors

  const { questionType, failedTestCases, userCode } = context;

  if (questionType === 'coding' && failedTestCases && failedTestCases.length > 0) {
    // Provide hints for coding questions with failed test cases
    const firstFailure = failedTestCases[0];
    
    if (firstFailure.error) {
      return `I see you're encountering an error: "${firstFailure.error}". This usually happens when ${getErrorHint(firstFailure.error)}. Try checking your code logic around the input handling.`;
    }

    if (firstFailure.expected !== firstFailure.actual) {
      return `Your code is producing "${firstFailure.actual}" but expected "${firstFailure.expected}". This suggests the logic might need adjustment. Consider reviewing the problem constraints and your approach.`;
    }
  }

  if (questionType === 'mcq') {
    return `For this MCQ question, think about the key concepts involved. Review the question description carefully and consider what each option represents.`;
  }

  // Generic helpful response
  return `I'm here to help! Based on your question about "${context.questionTitle}", I'd suggest reviewing the problem constraints and breaking it down into smaller steps. Would you like me to explain any specific concept?`;
};

const getErrorHint = (error: string): string => {
  if (error.includes('NoneType') || error.includes('null')) {
    return 'you might be accessing a property on a null/None value';
  }
  if (error.includes('IndexError') || error.includes('out of range')) {
    return 'you might be accessing an index that doesn\'t exist';
  }
  if (error.includes('TypeError') || error.includes('type')) {
    return 'there might be a type mismatch in your variables';
  }
  if (error.includes('SyntaxError')) {
    return 'there might be a syntax error in your code';
  }
  return 'there might be a logical error in your implementation';
};

export const getInitialHint = (context: TutorContext): string => {
  if (context.questionType === 'coding') {
    return `I noticed you might need some guidance on "${context.questionTitle}". Would you like me to explain the approach or help debug any specific errors?`;
  } else {
    return `For this MCQ question, I can help explain the concepts involved. What would you like to know?`;
  }
};

