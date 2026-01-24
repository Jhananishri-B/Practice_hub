import pool from '../config/database';
import { randomUUID } from 'crypto';
import { validateLanguage } from '../utils/codeExecutor';
import { getRows } from '../utils/mysqlHelper';
import { hashPassword } from '../utils/password';

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

/**
 * Ensure dev bypass user exists in database
 * This is needed for foreign key constraints when using dev bypass tokens
 */
const ensureDevBypassUser = async (userId: string, username: string, role: string): Promise<void> => {
  try {
    console.log(`[ensureDevBypassUser] Checking for user: ${userId} (${username}, ${role})`);

    // Check if user exists by ID
    const userCheck = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    const userRows = getRows(userCheck);

    if (userRows.length > 0) {
      console.log(`[ensureDevBypassUser] User ${userId} already exists`);
      return;
    }

    // User doesn't exist, create it
    console.log(`[ensureDevBypassUser] Creating dev bypass user: ${userId} (${username}, ${role})`);
    const passwordHash = await hashPassword('dev-bypass-password');

    // Use INSERT IGNORE or ON DUPLICATE KEY UPDATE to handle conflicts
    try {
      await pool.query(
        'INSERT INTO users (id, username, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
        [userId, username, passwordHash, role, `${role === 'admin' ? 'Admin' : 'Student'} User (Dev Bypass)`]
      );
      console.log(`[ensureDevBypassUser] Dev bypass user created successfully: ${userId}`);
    } catch (insertError: any) {
      // If insert fails due to duplicate username, try to update existing user
      if (insertError.code === 'ER_DUP_ENTRY' && insertError.message.includes('username')) {
        console.log(`[ensureDevBypassUser] Username ${username} exists, updating user ID to ${userId}`);
        // Update existing user to use the dev bypass ID
        await pool.query(
          'UPDATE users SET id = ? WHERE username = ?',
          [userId, username]
        );
        console.log(`[ensureDevBypassUser] Updated existing user to use dev bypass ID: ${userId}`);
      } else {
        // Re-throw other errors
        throw insertError;
      }
    }
  } catch (error: any) {
    console.error(`[ensureDevBypassUser] Error ensuring dev bypass user:`, error);
    console.error(`[ensureDevBypassUser] Error message:`, error.message);
    console.error(`[ensureDevBypassUser] Error code:`, error.code);
    // Re-throw the error so we can see what went wrong
    throw new Error(`Failed to ensure dev bypass user: ${error.message}`);
  }
};

export const startSession = async (
  userId: string,
  courseId: string,
  levelId: string,
  requestedSessionType?: 'coding' | 'mcq'
): Promise<PracticeSession> => {
  try {
    console.log(`[startSession] Starting session for userId: ${userId}, courseId: ${courseId}, levelId: ${levelId}, sessionType: ${requestedSessionType || 'auto'}`);

    // Ensure dev bypass users exist in database (for foreign key constraints)
    if (userId === 'user-1' || userId === 'admin-1') {
      const role = userId === 'admin-1' ? 'admin' : 'student';
      const username = userId === 'admin-1' ? 'admin' : 'user';
      await ensureDevBypassUser(userId, username, role);
    }

    // Get course info to determine default session type (with error handling)
    let courseTitle = '';
    try {
      const courseResult = await pool.query(
        'SELECT title FROM courses WHERE id = ?',
        [courseId]
      );
      const courseRows = getRows(courseResult);
      courseTitle = courseRows[0]?.title || '';
      console.log(`[startSession] Course title: ${courseTitle}`);
    } catch (courseError: any) {
      console.error(`[startSession] Error fetching course:`, courseError.message);
      throw new Error(`Failed to fetch course: ${courseError.message}`);
    }

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

    console.log(`[startSession] Session type determined: ${sessionType}`);

    // Get questions for this level (with error handling)
    let query = `SELECT id, question_type, title, description, input_format, output_format, constraints, reference_solution
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

    let questionsRows: any[] = [];
    try {
      const questionsResult = await pool.query(query, params);
      questionsRows = getRows(questionsResult);
      console.log(`[startSession] Found ${questionsRows.length} questions for level ${levelId}`);
    } catch (questionsError: any) {
      console.error(`[startSession] Error fetching questions:`, questionsError.message);
      console.error(`[startSession] Query was:`, query);
      console.error(`[startSession] Params were:`, params);
      throw new Error(`Failed to fetch questions: ${questionsError.message}`);
    }

    if (questionsRows.length === 0) {
      console.warn(`[startSession] No questions found for level ${levelId} with sessionType ${sessionType}`);
      throw new Error(`No questions available for this level. Please add questions before starting a session.`);
    }

    // Create session (store total available questions) (with error handling)
    const sessionId = randomUUID();
    try {
      await pool.query(
        `INSERT INTO practice_sessions (id, user_id, course_id, level_id, session_type, status, total_questions, time_limit)
     VALUES (?, ?, ?, ?, ?, 'in_progress', ?, 3600)`,
        [sessionId, userId, courseId, levelId, sessionType, questionsRows.length]
      );
      console.log(`[startSession] Created session ${sessionId}`);
    } catch (sessionError: any) {
      console.error(`[startSession] Error creating session:`, sessionError.message);
      throw new Error(`Failed to create session: ${sessionError.message}`);
    }

    // Add questions to session and fetch options / test cases (with error handling)
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
        reference_solution: q.reference_solution,
      };

      try {
        if (q.question_type === 'mcq') {
          // Fetch options for MCQ questions
          const optionsResult = await pool.query(
            'SELECT id, option_text, is_correct, option_letter FROM mcq_options WHERE question_id = ? ORDER BY option_letter',
            [q.id]
          );
          questionData.options = getRows(optionsResult);
          console.log(`[startSession] Loaded ${questionData.options.length} options for MCQ question ${q.id}`);
        } else if (q.question_type === 'coding') {
          // Fetch test cases for coding questions so the UI can show visible / hidden test cases
          const testCasesResult = await pool.query(
            'SELECT id, input_data, expected_output, is_hidden, test_case_number FROM test_cases WHERE question_id = ? ORDER BY test_case_number',
            [q.id]
          );
          questionData.test_cases = getRows(testCasesResult);
          console.log(`[startSession] Loaded ${questionData.test_cases.length} test cases for coding question ${q.id}`);
        }
      } catch (questionDataError: any) {
        console.warn(`[startSession] Error fetching data for question ${q.id}:`, questionDataError.message);
        // Continue with empty options/test_cases if fetch fails
        if (q.question_type === 'mcq') {
          questionData.options = [];
        } else if (q.question_type === 'coding') {
          questionData.test_cases = [];
        }
      }

      sessionQuestions.push(questionData);

      // Insert session question (with error handling)
      try {
        const sessionQuestionId = randomUUID();
        await pool.query(
          `INSERT INTO session_questions (id, session_id, question_id, question_order, status)
       VALUES (?, ?, ?, ?, 'not_attempted')`,
          [sessionQuestionId, sessionId, q.id, index + 1]
        );
      } catch (sessionQuestionError: any) {
        console.error(`[startSession] Error inserting session question:`, sessionQuestionError.message);
        // Continue even if one session question insert fails
      }
    }

    console.log(`[startSession] Successfully created session ${sessionId} with ${sessionQuestions.length} questions`);

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
  } catch (error: any) {
    console.error('[startSession] Error:', error);
    console.error('[startSession] Error stack:', error.stack);
    // Re-throw the error so controller can handle it
    throw error;
  }
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
  const { normalizeExecutionInput } = await import('../utils/inputNormalizer');
  const normalizedInput = normalizeExecutionInput(customInput || '');
  const result = await executeCode(code, language, normalizedInput);

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
  // TiDB/MySQL connections can be dropped intermittently (ECONNRESET / PROTOCOL_CONNECTION_LOST).
  // Add a small retry to make "Run test cases" resilient.
  const queryWithRetry = async <T = any>(
    sql: string,
    params: any[],
    retries: number = 2
  ): Promise<T> => {
    let lastErr: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // @ts-ignore mysql2 typing for pool.query is broad; keep local
        return await pool.query(sql, params);
      } catch (err: any) {
        lastErr = err;
        const code = err?.code;
        const isConnDrop = code === 'ECONNRESET' || code === 'PROTOCOL_CONNECTION_LOST';
        if (!isConnDrop || attempt === retries) throw err;
        // small backoff before retry
        await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
      }
    }
    throw lastErr;
  };

  // Validate Session and get course info
  const sessionResult = await queryWithRetry(
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
  const testCasesResult = await queryWithRetry(
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