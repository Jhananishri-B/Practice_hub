// AI Tutor Service

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
  explanation?: string;
  concepts?: any;
}

const LLM_API_URL = process.env.LLM_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'llama3-70b-8192';

export const getTutorResponse = async (
  userMessage: string,
  context: TutorContext
): Promise<string> => {
  try {
    const systemPrompt = buildSystemPrompt(context);

    if (!LLM_API_KEY && !process.env.LLM_API_URL?.includes('localhost')) {
      // Fallback if no key is configured
      return fallbackResponse(userMessage, context);
    }

    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API Error:', errorText);
      throw new Error(`LLM API request failed: ${response.statusText}`);
    }

    const data: any = await response.json();
    return data.choices?.[0]?.message?.content || "I'm having trouble thinking right now. Please try again.";

  } catch (error) {
    console.error('AI Tutor Service Error:', error);
    return fallbackResponse(userMessage, context);
  }
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
    return `I noticed your code failed some test cases. Check the input "${context.failedTestCases[0].input}". You returned "${context.failedTestCases[0].actual}" but expected "${context.failedTestCases[0].expected}". \n\n(AI Service is currently offline, please configure LLM_API_KEY for smart help)`;
  }
  return `I'm here to help with "${context.questionTitle}". What specific part are you stuck on? \n\n(AI Service is currently offline, please configure LLM_API_KEY)`;
};

export const getInitialHint = (context: TutorContext): string => {
  if (context.questionType === 'coding') {
    return `I see you're working on "${context.questionTitle}". I can analyze your code and test case failures. How can I help?`;
  } else {
    return `I can explain the concepts behind this question ("${context.questionTitle}"). Ask me anything!`;
  }
};

