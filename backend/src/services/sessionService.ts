import pool from '../config/database';
import { randomUUID } from 'crypto';
import { validateLanguage } from '../utils/codeExecutor';
import { getRows } from '../utils/mysqlHelper';

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
  course_title: string;
}

export const startSession = async (
  userId: string,
  courseId: string,
  levelId: string,
  requestedSessionType?: 'coding' | 'mcq'
): Promise<PracticeSession> => {
  // Get course info to determine default session type (for backward compatibility)
  const courseResult = await pool.query(
    'SELECT title FROM courses WHERE id = ?',
    [courseId]
  );
  const courseRows = getRows(courseResult);
  const courseTitle = courseRows[0]?.title || '';

  let sessionType: 'coding' | 'mcq';

  if (requestedSessionType === 'coding' || requestedSessionType === 'mcq') {
    sessionType = requestedSessionType;
  } else {
    // Fallback: preserve original behaviour – ML Level 1 as MCQ, everything else coding
    sessionType =
      courseTitle === 'Machine Learning' &&
        levelId.includes('660e8400-e29b-41d4-a716-446655440021')
        ? 'mcq'
        : 'coding';
  }

  // Get questions for this level
  // - Always return ALL questions so the frontend can control how many are used
  // - Filter by question_type when a specific sessionType is requested
  let query = `SELECT id, question_type, title, description, input_format, output_format, constraints
               FROM questions
               WHERE level_id = ?`;
  const params: any[] = [levelId];

  if (sessionType === 'coding') {
    query += ' AND question_type = ? ORDER BY RAND() LIMIT 2';
    params.push('coding');
  } else if (sessionType === 'mcq') {
    query += ' AND question_type = ? ORDER BY created_at ASC';
    params.push('mcq');
  } else {
    query += ' ORDER BY created_at ASC';
  }

  const questionsResult = await pool.query(query, params);
  const questionsRows = getRows(questionsResult);

  if (questionsRows.length === 0) {
    throw new Error('No questions available for this level');
  }

  // Create session (store total available questions)
  const sessionId = randomUUID();
  await pool.query(
    `INSERT INTO practice_sessions (id, user_id, course_id, level_id, session_type, status, total_questions, time_limit)
     VALUES (?, ?, ?, ?, ?, 'in_progress', ?, 3600)`,
    [sessionId, userId, courseId, levelId, sessionType, questionsRows.length]
  );

  // Add questions to session and fetch options / test cases
  const sessionQuestions = [];
  for (let index = 0; index < questionsRows.length; index++) {
    const q = questionsRows[index];
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

    if (q.question_type === 'mcq') {
      // Fetch options for MCQ questions
      const optionsResult = await pool.query(
        'SELECT id, option_text, is_correct, option_letter FROM mcq_options WHERE question_id = ? ORDER BY option_letter',
        [q.id]
      );
      questionData.options = getRows(optionsResult);
    } else if (q.question_type === 'coding') {
      // Fetch test cases for coding questions so the UI can show visible / hidden test cases
      const testCasesResult = await pool.query(
        'SELECT id, input_data, expected_output, is_hidden, test_case_number FROM test_cases WHERE question_id = ? ORDER BY test_case_number',
        [q.id]
      );
      questionData.test_cases = getRows(testCasesResult);
    }

    sessionQuestions.push(questionData);

    const sessionQuestionId = randomUUID();
    await pool.query(
      `INSERT INTO session_questions (id, session_id, question_id, question_order, status)
       VALUES (?, ?, ?, ?, 'not_attempted')`,
      [sessionQuestionId, sessionId, q.id, index + 1]
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
    course_title: courseTitle,
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
     WHERE s.id = ? AND q.id = ?`,
    [sessionId, questionId]
  );

  const sessionRows = getRows(sessionResult);
  if (sessionRows.length === 0) {
    throw new Error('Session or question not found');
  }

  const { session_type, question_type } = sessionRows[0];

  if (question_type === 'mcq') {
    // Handle MCQ submission
    if (!submission.selected_option_id) {
      throw new Error('No option selected');
    }

    const optionResult = await pool.query(
      'SELECT is_correct FROM mcq_options WHERE id = ?',
      [submission.selected_option_id]
    );

    const optionRows = getRows(optionResult);
    if (optionRows.length === 0) {
      throw new Error('Selected option not found');
    }

    // Handle MySQL boolean (0/1) and JavaScript boolean (true/false)
    const isCorrectValue = optionRows[0].is_correct;
    const isCorrect = isCorrectValue === true || isCorrectValue === 1 || isCorrectValue === '1';

    const mcqSubmissionId = randomUUID();
    await pool.query(
      `INSERT INTO user_submissions (id, session_id, question_id, user_id, submission_type, selected_option_id, is_correct)
       VALUES (?, ?, ?, ?, 'mcq', ?, ?)
       ON DUPLICATE KEY UPDATE id=id`,
      [mcqSubmissionId, sessionId, questionId, userId, submission.selected_option_id, isCorrect]
    );

    return { is_correct: isCorrect };
  } else {
    // Handle coding submission
    // Validate language
    const courseResult = await pool.query(
      `SELECT c.title FROM courses c
       JOIN practice_sessions s ON c.id = s.course_id
       WHERE s.id = ?`,
      [sessionId]
    );
    const courseRows = getRows(courseResult);
    const courseName = courseRows[0]?.title || '';

    if (submission.language && !validateLanguage(courseName, submission.language)) {
      throw new Error(`Invalid language for ${courseName} course`);
    }

    // Get test cases
    const testCasesResult = await pool.query(
      'SELECT id, input_data, expected_output FROM test_cases WHERE question_id = ? ORDER BY test_case_number',
      [questionId]
    );

    const testCasesRows = getRows(testCasesResult);
    if (testCasesRows.length === 0) {
      throw new Error('No test cases found for this question');
    }

    // Evaluate code against test cases
    const { evaluateCode } = await import('./codeExecutionService');
    const testResults = await evaluateCode(
      submission.code || '',
      submission.language || 'python',
      testCasesRows,
      courseName
    );

    const passedCount = testResults.filter((r) => r.passed).length;
    const allPassed = passedCount === testCasesRows.length;

    // Save submission
    const submissionId = randomUUID();
    await pool.query(
      `INSERT INTO user_submissions (id, session_id, question_id, user_id, submission_type, submitted_code, language, test_cases_passed, total_test_cases, is_correct)
       VALUES (?, ?, ?, ?, 'coding', ?, ?, ?, ?, ?)`,
      [
        submissionId,
        sessionId,
        questionId,
        userId,
        submission.code,
        submission.language,
        passedCount,
        testCasesRows.length,
        allPassed,
      ]
    );

    // Save test case results
    for (const tr of testResults) {
      const testResultId = randomUUID();
      await pool.query(
        `INSERT INTO test_case_results (id, submission_id, test_case_id, passed, actual_output, error_message, execution_time)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          testResultId,
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
      `UPDATE session_questions SET status = ? WHERE session_id = ? AND question_id = ?`,
      [allPassed ? 'completed' : 'attempted', sessionId, questionId]
    );

    return {
      is_correct: allPassed,
      test_cases_passed: passedCount,
      total_test_cases: testCasesRows.length,
      test_results: testResults,
    };
  }
};

export const completeSession = async (sessionId: string, userId: string) => {
  // Update session status
  await pool.query(
    `UPDATE practice_sessions SET status = 'completed', completed_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    [sessionId, userId]
  );

  // Check if all questions are completed (for coding sessions)
  const sessionResult = await pool.query(
    `SELECT s.level_id, s.course_id, COUNT(*) as total, SUM(CASE WHEN sq.status = 'completed' THEN 1 ELSE 0 END) as completed
     FROM practice_sessions s
     JOIN session_questions sq ON s.id = sq.session_id
     WHERE s.id = ?
     GROUP BY s.level_id, s.course_id`,
    [sessionId]
  );

  const sessionRows = getRows(sessionResult);
  if (sessionRows.length > 0) {
    const { level_id, course_id, total, completed } = sessionRows[0];

    // If all questions completed, mark level as completed
    if (parseInt(completed) === parseInt(total)) {
      const completedProgressId = randomUUID();
      await pool.query(
        `INSERT INTO user_progress (id, user_id, course_id, level_id, status, completed_at)
         VALUES (?, ?, ?, ?, 'completed', CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE status = 'completed', completed_at = CURRENT_TIMESTAMP`,
        [completedProgressId, userId, course_id, level_id]
      );
    }
  }
};
export const runCode = async (
  sessionId: string,
  code: string,
  language: string,
  customInput?: string
): Promise<{ output: string; error?: string; execution_time?: number }> => {
  // Validate Session
  const sessionResult = await pool.query(
    `SELECT c.title 
     FROM practice_sessions s 
     JOIN courses c ON s.course_id = c.id
     WHERE s.id = ?`,
    [sessionId]
  );

  const rows = getRows(sessionResult);
  if (rows.length === 0) {
    throw new Error('Session not found');
  }
  const courseName = rows[0].title;

  // Validate Language
  if (!validateLanguage(courseName, language)) {
    throw new Error(`Invalid language for ${courseName}`);
  }

  // Execute
  // Dynamic import to avoid cycles if any (safe practice here)
  const { executeCode } = await import('../utils/codeExecutor');
  const result = await executeCode(code, language, customInput || '');

  return {
    output: result.output || '',
    error: result.error,
    execution_time: result.executionTime
  };
};

/**
 * Get all practice sessions from the database
 */
// ... (previous code)

export const runTestCases = async (
  sessionId: string,
  questionId: string,
  code: string,
  language: string
) => {
  // Validate Session and get course info
  const sessionResult = await pool.query(
    `SELECT s.course_id, c.title as course_title
     FROM practice_sessions s 
     JOIN courses c ON s.course_id = c.id
     WHERE s.id = ?`,
    [sessionId]
  );

  const sessionRows = getRows(sessionResult);
  if (sessionRows.length === 0) {
    throw new Error('Session not found');
  }

  const courseName = sessionRows[0].course_title;

  // Validate language for this course
  if (!validateLanguage(courseName, language)) {
    throw new Error(`Invalid language for ${courseName}. Please use the correct programming language for this course.`);
  }

  // Get ONLY visible test cases for "Run" mode
  const testCasesResult = await pool.query(
    `SELECT id, input_data, expected_output, test_case_number 
     FROM test_cases 
     WHERE question_id = ? AND is_hidden = 0
     ORDER BY test_case_number`,
    [questionId]
  );

  const testCasesRows = getRows(testCasesResult);
  if (testCasesRows.length === 0) {
    return {
      test_results: [],
      message: 'No visible test cases to run'
    };
  }

  // Execute code against visible test cases
  const { evaluateCode } = await import('./codeExecutionService');
  const testResults = await evaluateCode(
    code,
    language,
    testCasesRows,
    courseName
  );

  const passedCount = testResults.filter((r) => r.passed).length;

  return {
    test_results: testResults,
    test_cases_passed: passedCount,
    total_test_cases: testCasesRows.length,
  };
};

export const getAllSessions = async () => {
  const result = await pool.query(
    `SELECT id, user_id, course_id, level_id, session_type, status, total_questions, time_limit, created_at, completed_at
     FROM practice_sessions
     ORDER BY created_at DESC`
  );
  return getRows(result);
};

