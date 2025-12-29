import pool from '../config/database';
import { randomUUID } from 'crypto';
import { validateLanguage } from '../utils/codeExecutor';

export interface SessionQuestion {
  question_id: string;
  question_order: number;
  question_type: string;
  title: string;
  description: string;
  input_format?: string;
  output_format?: string;
  constraints?: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  course_id: string;
  level_id: string;
  session_type: string;
  status: string;
  questions: SessionQuestion[];
}

export const startSession = async (
  userId: string,
  courseId: string,
  levelId: string
): Promise<PracticeSession> => {
  // Get course info to determine session type
  const courseResult = await pool.query(
    'SELECT title FROM courses WHERE id = $1',
    [courseId]
  );
  const courseTitle = courseResult.rows[0]?.title || '';

  // Determine session type
  const sessionType = courseTitle === 'Machine Learning' && levelId.includes('660e8400-e29b-41d4-a716-446655440021') 
    ? 'mcq' 
    : 'coding';

  // Get questions for this level (2 for coding, 10 for MCQ)
  const questionCount = sessionType === 'mcq' ? 10 : 2;
  
  const questionsResult = await pool.query(
    `SELECT id, question_type, title, description, input_format, output_format, constraints
     FROM questions
     WHERE level_id = $1
     ORDER BY RANDOM()
     LIMIT $2`,
    [levelId, questionCount]
  );

  if (questionsResult.rows.length === 0) {
    throw new Error('No questions available for this level');
  }

  // Create session
  const sessionId = randomUUID();
  await pool.query(
    `INSERT INTO practice_sessions (id, user_id, course_id, level_id, session_type, status, total_questions, time_limit)
     VALUES ($1, $2, $3, $4, $5, 'in_progress', $6, 3600)`,
    [sessionId, userId, courseId, levelId, sessionType, questionCount]
  );

  // Add questions to session and fetch options for MCQ
  const sessionQuestions = [];
  for (let index = 0; index < questionsResult.rows.length; index++) {
    const q = questionsResult.rows[index];
    const questionData: any = {
      question_id: q.id,
      question_order: index + 1,
      question_type: q.question_type,
      title: q.title,
      description: q.description,
      input_format: q.input_format,
      output_format: q.output_format,
      constraints: q.constraints,
    };

    // Fetch options for MCQ questions
    if (q.question_type === 'mcq') {
      const optionsResult = await pool.query(
        'SELECT id, option_text, is_correct, option_letter FROM mcq_options WHERE question_id = $1 ORDER BY option_letter',
        [q.id]
      );
      questionData.options = optionsResult.rows;
    }

    sessionQuestions.push(questionData);

    await pool.query(
      `INSERT INTO session_questions (session_id, question_id, question_order, status)
       VALUES ($1, $2, $3, 'not_attempted')`,
      [sessionId, q.id, index + 1]
    );
  }

  return {
    id: sessionId,
    user_id: userId,
    course_id: courseId,
    level_id: levelId,
    session_type: sessionType,
    status: 'in_progress',
    questions: sessionQuestions,
  };
};

export const submitSolution = async (
  sessionId: string,
  questionId: string,
  userId: string,
  submission: {
    code?: string;
    language?: string;
    selected_option_id?: string;
  }
) => {
  // Get session and question info
  const sessionResult = await pool.query(
    `SELECT s.session_type, q.question_type
     FROM practice_sessions s
     JOIN session_questions sq ON s.id = sq.session_id
     JOIN questions q ON sq.question_id = q.id
     WHERE s.id = $1 AND q.id = $2`,
    [sessionId, questionId]
  );

  if (sessionResult.rows.length === 0) {
    throw new Error('Session or question not found');
  }

  const { session_type, question_type } = sessionResult.rows[0];

  if (question_type === 'mcq') {
    // Handle MCQ submission
    const optionResult = await pool.query(
      'SELECT is_correct FROM mcq_options WHERE id = $1',
      [submission.selected_option_id]
    );

    const isCorrect = optionResult.rows[0]?.is_correct || false;

    await pool.query(
      `INSERT INTO user_submissions (session_id, question_id, user_id, submission_type, selected_option_id, is_correct)
       VALUES ($1, $2, $3, 'mcq', $4, $5)
       ON CONFLICT DO NOTHING`,
      [sessionId, questionId, userId, submission.selected_option_id, isCorrect]
    );

    return { is_correct: isCorrect };
  } else {
    // Handle coding submission
    // Validate language
    const courseResult = await pool.query(
      `SELECT c.title FROM courses c
       JOIN practice_sessions s ON c.id = s.course_id
       WHERE s.id = $1`,
      [sessionId]
    );
    const courseName = courseResult.rows[0]?.title || '';

    if (submission.language && !validateLanguage(courseName, submission.language)) {
      throw new Error(`Invalid language for ${courseName} course`);
    }

    // Get test cases
    const testCasesResult = await pool.query(
      'SELECT id, input_data, expected_output FROM test_cases WHERE question_id = $1 ORDER BY test_case_number',
      [questionId]
    );

    if (testCasesResult.rows.length === 0) {
      throw new Error('No test cases found for this question');
    }

    // Evaluate code against test cases
    const { evaluateCode } = await import('./codeExecutionService');
    const testResults = await evaluateCode(
      submission.code || '',
      submission.language || 'python',
      testCasesResult.rows,
      courseName
    );

    const passedCount = testResults.filter((r) => r.passed).length;
    const allPassed = passedCount === testCasesResult.rows.length;

    // Save submission
    const submissionId = randomUUID();
    await pool.query(
      `INSERT INTO user_submissions (id, session_id, question_id, user_id, submission_type, submitted_code, language, test_cases_passed, total_test_cases, is_correct)
       VALUES ($1, $2, $3, $4, 'coding', $5, $6, $7, $8, $9)`,
      [
        submissionId,
        sessionId,
        questionId,
        userId,
        submission.code,
        submission.language,
        passedCount,
        testCasesResult.rows.length,
        allPassed,
      ]
    );

    // Save test case results
    for (const tr of testResults) {
      await pool.query(
        `INSERT INTO test_case_results (submission_id, test_case_id, passed, actual_output, error_message, execution_time)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          submissionId,
          tr.test_case_id,
          tr.passed,
          tr.actual_output,
          tr.error_message || null,
          tr.execution_time || null,
        ]
      );
    }

    // Update session question status
    await pool.query(
      `UPDATE session_questions SET status = $1 WHERE session_id = $2 AND question_id = $3`,
      [allPassed ? 'completed' : 'attempted', sessionId, questionId]
    );

    return {
      is_correct: allPassed,
      test_cases_passed: passedCount,
      total_test_cases: testCasesResult.rows.length,
      test_results: testResults,
    };
  }
};

export const completeSession = async (sessionId: string, userId: string) => {
  // Update session status
  await pool.query(
    `UPDATE practice_sessions SET status = 'completed', completed_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2`,
    [sessionId, userId]
  );

  // Check if all questions are completed (for coding sessions)
  const sessionResult = await pool.query(
    `SELECT s.level_id, s.course_id, COUNT(*) as total, SUM(CASE WHEN sq.status = 'completed' THEN 1 ELSE 0 END) as completed
     FROM practice_sessions s
     JOIN session_questions sq ON s.id = sq.session_id
     WHERE s.id = $1
     GROUP BY s.level_id, s.course_id`,
    [sessionId]
  );

  if (sessionResult.rows.length > 0) {
    const { level_id, course_id, total, completed } = sessionResult.rows[0];
    
    // If all questions completed, mark level as completed
    if (parseInt(completed) === parseInt(total)) {
      await pool.query(
        `INSERT INTO user_progress (user_id, course_id, level_id, status, completed_at)
         VALUES ($1, $2, $3, 'completed', CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, level_id) 
         DO UPDATE SET status = 'completed', completed_at = CURRENT_TIMESTAMP`,
        [userId, course_id, level_id]
      );
    }
  }
};

