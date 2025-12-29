import pool from '../config/database';

export const getSessionResults = async (sessionId: string, userId: string) => {
  // Get session info
  const sessionResult = await pool.query(
    `SELECT s.id, s.session_type, s.status, s.started_at, s.completed_at,
            c.title as course_title, l.title as level_title
     FROM practice_sessions s
     JOIN courses c ON s.course_id = c.id
     JOIN levels l ON s.level_id = l.id
     WHERE s.id = $1 AND s.user_id = $2`,
    [sessionId, userId]
  );

  if (sessionResult.rows.length === 0) {
    throw new Error('Session not found');
  }

  const session = sessionResult.rows[0];

  // Get all questions in session
  const questionsResult = await pool.query(
    `SELECT q.id, q.title, q.description, q.question_type, q.input_format, q.output_format, q.constraints, q.reference_solution,
            sq.question_order, sq.status
     FROM session_questions sq
     JOIN questions q ON sq.question_id = q.id
     WHERE sq.session_id = $1
     ORDER BY sq.question_order`,
    [sessionId]
  );

  // Get submissions for each question
  const questions = [];
  for (const question of questionsResult.rows) {
    const submissionResult = await pool.query(
      `SELECT id, submitted_code, language, selected_option_id, is_correct, test_cases_passed, total_test_cases, submitted_at
       FROM user_submissions
       WHERE session_id = $1 AND question_id = $2
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [sessionId, question.id]
    );

    const submission = submissionResult.rows[0] || null;

    // Get test case results if coding question
    let testResults = [];
    if (question.question_type === 'coding' && submission) {
      const testResultsQuery = await pool.query(
        `SELECT tcr.passed, tcr.actual_output, tcr.error_message,
                tc.input_data, tc.expected_output, tc.is_hidden, tc.test_case_number
         FROM test_case_results tcr
         JOIN test_cases tc ON tcr.test_case_id = tc.id
         WHERE tcr.submission_id = $1
         ORDER BY tc.test_case_number`,
        [submission.id]
      );
      testResults = testResultsQuery.rows;
    }

    // Get MCQ options if MCQ
    let options = [];
    if (question.question_type === 'mcq') {
      const optionsQuery = await pool.query(
        `SELECT id, option_text, is_correct, option_letter
         FROM mcq_options
         WHERE question_id = $1
         ORDER BY option_letter`,
        [question.id]
      );
      options = optionsQuery.rows;
    }

    questions.push({
      ...question,
      submission,
      test_results: testResults,
      options,
    });
  }

  return {
    session,
    questions,
  };
};

