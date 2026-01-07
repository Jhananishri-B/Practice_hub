// AI Tutor Service
// In production, integrate with TinyLlama or similar AI model

export interface TutorMessage {
  role: 'user' | 'assistant' | 'system';
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
  explanation?: string;
  concepts?: any;
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3:latest';

interface OllamaRequest {
  model: string;
  messages: TutorMessage[];
  stream?: boolean;
  format?: 'json';
  options?: {
    temperature?: number;
    num_predict?: number;
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

const callOllama = async (request: OllamaRequest): Promise<string> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API Error:', errorText);
      throw new Error(`Ollama API request failed: ${response.statusText}`);
    }

    const data = await response.json() as OllamaResponse;
    return data.message.content;
  } catch (error) {
    console.warn('Ollama Connection Failed (Using Mock):', error);
    throw error; // Re-throw to trigger fallback in getTutorResponse
  }
};

/**
 * Get tutor response based on context
 */
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
  return `I'm here to help with your question. What specific part are you stuck on? \n\n(AI Service is currently offline or Ollama is not running on port 11434)`;
};

/**
 * Get initial hint
 */
export const getInitialHint = async (context: TutorContext): Promise<string> => {
  if (context.questionType === 'coding') {
    return `I see you're working on "${context.questionTitle}". I can analyze your code and test case failures. How can I help?`;
  } else {
    return `For this MCQ question, I can help explain the concepts involved. What would you like to know?`;
  }
};


/**
 * Generate a lesson plan for a specific level
 */
export const generateLessonPlan = async (
  courseTitle: string,
  levelTitle: string,
  levelDescription: string,
  levelId: string
): Promise<any> => {
  const systemPrompt = `You are an expert ${courseTitle} tutor. Create a structured lesson plan for the level "${levelTitle}".
  Description: ${levelDescription}.
  
  Return ONLY a JSON object with this structure:
  {
    "introduction": "Brief engaging introduction to the topic (~2-3 sentences)",
    "concepts": [
      { "title": "Concept Name", "description": "Clear explanation" }
    ],
    "resources": [
      { "title": "Resource Title", "url": "https://example.com", "type": "article/video" }
    ],
    "example_code": "Show a code example demonstrating the concept. Use markdown code blocks."
  }`;

  const request: OllamaRequest = {
    model: OLLAMA_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: "Generate the lesson plan." }
    ],
    stream: false,
    format: 'json',
    options: { temperature: 0.7 }
  };

  try {
    const response = await callOllama(request);
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to generate lesson plan:", error);
    // Fallback
    return {
      introduction: `Welcome to ${levelTitle}! In this level, we will explore ${levelDescription}.`,
      concepts: [],
      resources: [],
      example_code: ""
    };
  }
};

/**
 * Get response for free-form chat (AI Coach)
 */
export const getFreeChatResponse = async (
  message: string,
  topic?: string,
  questionType: 'coding' | 'mcq' = 'coding'
): Promise<string> => {
  const systemPrompt = `You are an AI Tutor helper for ${topic || 'programming'}. 
  The user is asking a ${questionType} related question.
  Be helpful, encouraging, and concise.`;

  const request: OllamaRequest = {
    model: OLLAMA_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    stream: false,
    options: { temperature: 0.7 }
  };

  try {
    return await callOllama(request);
  } catch (error) {
    console.error("Free chat failed:", error);
    return "I'm having trouble connecting to my brain right now. Please try again later.";
  }
};

/**
 * Generate practice questions using AI
 */
export const generateQuestionsWithAI = async (
  topic: string,
  count: number,
  difficulty: string,
  type: string
): Promise<any[]> => {
  const systemPrompt = `You are an expert computer science teacher. Create ${count} ${difficulty} level ${type} questions about "${topic}".
  
  Return ONLY a JSON array of objects with this structure:
  {
    "title": "Question Title",
    "description": "Problem description",
    ${type === 'coding' ? '"input_format": "...", "output_format": "...", "constraints": "...",' : ''}
    ${type === 'mcq' ? '"options": [{"text": "Option A", "is_correct": true}, {"text": "Option B", "is_correct": false}],' : ''}
    "explanation": "Brief explanation of the answer/solution"
  }`;

  const request: OllamaRequest = {
    model: OLLAMA_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: "Generate the questions." }
    ],
    stream: false,
    format: 'json',
    options: { temperature: 0.7 }
  };

  try {
    const response = await callOllama(request);
    const data = JSON.parse(response);
    return Array.isArray(data) ? data : (data.questions || []);
  } catch (error) {
    console.error("Failed to generate questions:", error);
    return [];
  }
};
