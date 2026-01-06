// AI Tutor Service using Ollama (Llama 3)
import pool from '../config/database';
import { getRows } from '../utils/mysqlHelper';

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

    const data: OllamaResponse = await response.json();
    return data.message.content;
  } catch (error) {
    console.warn('Ollama Connection Failed (Using Mock):', error);
    throw error; // Re-throw to trigger fallback in getTutorResponse
  }
};

export const getTutorResponse = async (
  userMessage: string,
  context: TutorContext
): Promise<string> => {
  try {
    const systemPrompt = buildSystemPrompt(context);

    // Construct message history including system prompt
    const messages: TutorMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return await callOllama({
      model: OLLAMA_MODEL,
      messages: messages,
      stream: false,
      options: {
        temperature: 0.7
      }
    });

  } catch (error) {
    // Graceful Fallback to Mock AI
    console.log("Switching to Mock AI response provider");
    return getMockTutorResponse(userMessage, context);
  }
};

// --- MOCK AI IMPLEMENTATION ---
const getMockTutorResponse = (userMessage: string, context: TutorContext): string => {
  const msg = userMessage.toLowerCase();

  if (context.questionType === 'mcq') {
    if (msg.includes('answer') || msg.includes('correct')) {
      return `I can't give you the answer directly, but think about the key concepts in "${context.questionTitle}". Review the definition of the terms in the options.`;
    }
    if (msg.includes('why')) {
      return `That's a good question! In this context, consider what happens when the code executes linearly. What does the specific syntax imply?`;
    }
    return `I'm currently running in 'Offline Mode' (AI Backend unavailable). Based on "${context.questionTitle}", I suggest reviewing the related course material. Keep trying!`;
  }

  if (context.questionType === 'coding') {
    if (context.failedTestCases && context.failedTestCases.length > 0) {
      const firstFail = context.failedTestCases[0];
      return `I noticed your code failed specifically on Input: ${firstFail.input}. It expected ${firstFail.expected} but got ${firstFail.actual}. Check your logic handling this specific edge case.`;
    }
    if (msg.includes('help') || msg.includes('stuck')) {
      return `Don't worry! Break down the problem "${context.questionTitle}" into smaller steps. Write pseudo-code first. What should happen at step 1?`;
    }
  }

  return `I am here to help with "${context.questionTitle}". As the AI service is currently offline, I can only offer general encouragement. debugging is 90% of programming!`;
};

const buildSystemPrompt = (ctx: TutorContext): string => {
  let prompt = `You are an expert AI Tutor and Coding Coach named "PracticeHub Coach".
Your goal is to help students learn programming (C, Python, ML) by guiding them, NOT just giving answers.
Use the Socratic method when appropriate. Be encouraging but precise.`;

  prompt += `\n\nContext Question: "${ctx.questionTitle}"`;
  prompt += `\nDescription: ${ctx.questionDescription}`;

  if (ctx.explanation) {
    prompt += `\nCorrect Explanation: ${ctx.explanation}`;
  }
  if (ctx.concepts) {
    prompt += `\nRelated Concepts: ${JSON.stringify(ctx.concepts)}`;
  }

  if (ctx.questionType === 'coding') {
    if (ctx.userCode) {
      prompt += `\n\nUser's Submitted Code:\n\`\`\`\n${ctx.userCode}\n\`\`\``;
    }
    if (ctx.correctCode) {
      prompt += `\n\nReference Solution (for your eyes only - guide user towards this):\n\`\`\`\n${ctx.correctCode}\n\`\`\``;
    }
    if (ctx.failedTestCases && ctx.failedTestCases.length > 0) {
      prompt += `\n\nThe user's code failed the following test cases:`;
      ctx.failedTestCases.forEach((tc, i) => {
        prompt += `\nCase ${i + 1}: Input="${tc.input}", Expected="${tc.expected}", Got="${tc.actual}" ${tc.error ? `Error: ${tc.error}` : ''}`;
      });
      prompt += `\n\nAnalyze why the code failed these specific cases. Explain the logical error without writing the full code for them immediately.`;
    }
  } else if (ctx.questionType === 'mcq') {
    prompt += `\nThe user selected: "${ctx.selectedAnswer}".`;
    prompt += `\nThe correct answer contains: "${ctx.correctAnswer}".`;
    if (ctx.selectedAnswer !== ctx.correctAnswer) {
      prompt += `\nExplain why the user's answer might be wrong and hint towards the correct concept.`;
    }
  }

  return prompt;
};

const fallbackResponse = (userMessage: string, context: TutorContext): string => {
  // Basic heuristic response if LLM is offline
  if (context.questionType === 'coding' && context.failedTestCases && context.failedTestCases.length > 0) {
    return `I noticed your code failed some test cases. Check the input "${context.failedTestCases[0].input}". You returned "${context.failedTestCases[0].actual}" but expected "${context.failedTestCases[0].expected}". \n\n(AI Service is currently offline or Ollama is not running on port 11434)`;
  }
  return `I'm here to help with "${context.questionTitle}". What specific part are you stuck on? \n\n(AI Service is currently offline or Ollama is not running on port 11434)`;
};

export const getInitialHint = (context: TutorContext): string => {
  if (context.questionType === 'coding') {
    return `I see you're working on "${context.questionTitle}". I can analyze your code and test case failures. How can I help?`;
  } else {
    return `I can explain the concepts behind this question ("${context.questionTitle}"). Ask me anything!`;
  }
};

export const generateQuestionsWithAI = async (
  topic: string,
  count: number,
  difficulty: string,
  type: 'coding' | 'mcq'
): Promise<any[]> => {
  try {
    const prompt = `Generate ${count} ${difficulty} ${type} questions about "${topic}".
    
    CRITICAL: Return ONLY a valid JSON array of objects. Do not include any text before or after the JSON.
    
    If type is 'coding', each object must have:
    - title (string)
    - description (string)
    - input_format (string)
    - output_format (string)
    - constraints (string)
    - difficulty (string: 'easy', 'medium', 'hard')
    - reference_solution (string: code)
    - test_cases (array of {input_data: string, expected_output: string, is_hidden: boolean}) Note: keys are input_data/expected_output

    If type is 'mcq', each object must have:
    - title (string)
    - description (string)
    - options (array of {option_text: string, is_correct: boolean})
    - correct_answer (string: text of correct option)
    - difficulty (string: 'easy', 'medium', 'hard')
    `;

    const response = await callOllama({
      model: OLLAMA_MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      format: 'json', // Force JSON mode if supported by newer Ollama/Models
      options: {
        temperature: 0.7,
        num_predict: 4096,
      },
    });

    let text = response;
    // Clean up markdown if present (Ollama might still wrap in ```json)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error('AI Question Generation Error (Mocking):', error);
    // Return Mock Questions if generation fails
    return getMockQuestions(topic, count, type);
  }
};

const getMockQuestions = (topic: string, count: number, type: 'coding' | 'mcq'): any[] => {
  // Helper to generate basic mock data
  const mockQuestions = [];
  for (let i = 0; i < count; i++) {
    if (type === 'mcq') {
      mockQuestions.push({
        title: `Mock Question ${i + 1} on ${topic}`,
        description: `This is a simulated question because AI generation failed. What is a key feature of ${topic}?`,
        options: [
          { option_text: "It is fast", is_correct: true },
          { option_text: "It is slow", is_correct: false },
          { option_text: "Neither", is_correct: false },
          { option_text: "Both", is_correct: false }
        ],
        correct_answer: "It is fast",
        difficulty: "easy"
      });
    } else {
      mockQuestions.push({
        title: `Mock Coding ${i + 1}: ${topic}`,
        description: `Write a function related to ${topic}. (AI Service Offline)`,
        input_format: "String s",
        output_format: "String",
        constraints: "None",
        reference_solution: "return s;",
        test_cases: [
          { input_data: "hello", expected_output: "hello", is_hidden: false }
        ],
        difficulty: "easy"
      });
    }
  }
  return mockQuestions;
};

export interface LessonPlan {
  introduction: string;
  concepts: Array<{ title: string; explanation: string }>;
  key_terms: string[];
  example_code: string;
  resources: Array<{ title: string; url: string }>;
}

// Helper for Mock Data (Function declaration for hoisting)
function getMockLessonPlan(course: string, level: string): LessonPlan {
  return {
    introduction: `Welcome to ${level}! In this lesson, we will dive into the core concepts of ${course}.`,
    concepts: [
      { title: "Core Concept 1", explanation: "This is a fundamental building block." },
      { title: "Core Concept 2", explanation: "Understanding this is crucial for advanced topics." }
    ],
    key_terms: ["Syntax", "Logic", "Compilation"],
    example_code: "// Example Code\nprint('Hello Learning Phase!');",
    resources: [
      { title: "Official Documentation", url: "https://docs.python.org/3/" },
      { title: "W3Schools Tutorial", url: "https://www.w3schools.com/" }
    ]
  };
}

export const generateLessonPlan = async (
  courseTitle: string,
  levelTitle: string,
  levelDescription: string,
  levelId?: string
): Promise<LessonPlan> => {

  // 1. Check for Manual Content in DB (if levelId provided)
  if (levelId) {
    try {
      const levelResult = await pool.query('SELECT learning_materials, code_snippet FROM levels WHERE id = ?', [levelId]);
      const rows = getRows(levelResult);
      if (rows.length > 0 && rows[0].learning_materials) {
        const materials = JSON.parse(rows[0].learning_materials);
        // Map to LessonPlan interface
        return {
          introduction: `Welcome to ${levelTitle}. This level covers key concepts.`,
          concepts: materials.map((m: any) => ({
            title: m.title,
            explanation: `Read more at: ${m.url}`
          })),
          key_terms: [],
          example_code: rows[0].code_snippet || '// Code examples available in the resources above',
          resources: materials
        };
      }
    } catch (dbError) {
      console.error('Error fetching manual learning materials:', dbError);
      // Proceed to AI fallback
    }
  }

  // 2. AI Generation
  try {
    const prompt = `Generate a structured lesson plan for a coding course.
    Course: ${courseTitle}
    Level: ${levelTitle}
    Description: ${levelDescription}

    CRITICAL: Return ONLY a valid JSON object. No markdown, no text before/after.
    Structure:
    {
      "introduction": "Brief engaging intro (2-3 sentences)",
      "concepts": [{"title": "Concept Name", "explanation": "Clear explanation"}],
      "key_terms": ["Term 1", "Term 2"],
      "example_code": "Code snippet demonstrating the concept",
      "resources": [{"title": "Resource Name", "url": "valid url"}]
    }`;

    const response = await callOllama({
      model: OLLAMA_MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      format: 'json',
      options: {
        temperature: 0.7,
      },
    });

    let text = response;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);

  } catch (error) {
    console.error('AI Lesson Generation Error (Mocking):', error);
    return getMockLessonPlan(courseTitle, levelTitle);
  }
};
