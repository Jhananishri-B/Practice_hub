import pool from '../config/database';
import { randomUUID } from 'crypto';
import { getRows, getFirstRow } from '../utils/mysqlHelper';

export interface Question {
  id: string;
  level_id: string;
  question_type: string;
  title: string;
  description: string;
  input_format?: string;
  output_format?: string;
  constraints?: string;
  reference_solution?: string;
  difficulty: string;
}

export interface TestCase {
  id: string;
  question_id: string;
  input_data: string;
  expected_output: string;
  is_hidden: boolean;
  test_case_number: number;
}

export interface MCQOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  option_letter: string;
}

export const getQuestionById = async (questionId: string) => {
  const result = await pool.query(
    `SELECT id, level_id, question_type, title, description, input_format, output_format, constraints, reference_solution, difficulty
     FROM questions WHERE id = ?`,
    [questionId]
  );

  const rows = getRows(result);
  if (rows.length === 0) {
    throw new Error('Question not found');
  }

  const question = rows[0];

  // Get test cases if coding question
  if (question.question_type === 'coding') {
    const testCasesResult = await pool.query(
      'SELECT id, input_data, expected_output, is_hidden, test_case_number FROM test_cases WHERE question_id = ? ORDER BY test_case_number',
      [questionId]
    );
    question.test_cases = getRows(testCasesResult);
  }

  // Get options if MCQ
  if (question.question_type === 'mcq') {
    const optionsResult = await pool.query(
      'SELECT id, option_text, is_correct, option_letter FROM mcq_options WHERE question_id = ? ORDER BY option_letter',
      [questionId]
    );
    const optionsRows = getRows(optionsResult);
    // Convert MySQL boolean (0/1/Buffer) to JavaScript boolean for frontend compatibility
    question.options = optionsRows.map((opt: any) => {
      let isCorrect = opt.is_correct;
      // Handle various MySQL boolean formats
      if (isCorrect === true || isCorrect === 1) {
        isCorrect = true;
      } else if (Buffer.isBuffer(isCorrect)) {
        isCorrect = isCorrect[0] === 1;
      } else if (isCorrect === '1' || isCorrect === 'true') {
        isCorrect = true;
      } else {
        isCorrect = false;
      }
      return {
        ...opt,
        is_correct: isCorrect,
      };
    });
  }

  return question;
};

export const createCodingQuestion = async (data: {
  level_id: string;
  title: string;
  description: string;
  input_format?: string;
  output_format?: string;
  constraints?: string;
  reference_solution: string;
  difficulty?: string;
  test_cases: Array<{
    input_data: string;
    expected_output: string;
    is_hidden: boolean;
  }>;
}) => {
  const questionId = randomUUID();

  await pool.query(
    `INSERT INTO questions (id, level_id, question_type, title, description, input_format, output_format, constraints, reference_solution, difficulty)
     VALUES (?, ?, 'coding', ?, ?, ?, ?, ?, ?, ?)`,
    [
      questionId,
      data.level_id,
      data.title,
      data.description,
      data.input_format || null,
      data.output_format || null,
      data.constraints || null,
      data.reference_solution,
      data.difficulty || 'medium',
    ]
  );

  // Insert test cases
  for (let i = 0; i < data.test_cases.length; i++) {
    const testCase = data.test_cases[i];
    const testCaseId = randomUUID();
    await pool.query(
      `INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [testCaseId, questionId, testCase.input_data, testCase.expected_output, testCase.is_hidden, i + 1]
    );
  }

  // Update course updated_at
  await pool.query(
    `UPDATE courses SET updated_at = CURRENT_TIMESTAMP 
     WHERE id = (SELECT course_id FROM levels WHERE id = ?)`,
    [data.level_id]
  );

  return questionId;
};

export const createMCQQuestion = async (data: {
  level_id: string;
  title: string;
  description: string;
  options: Array<{
    option_text: string;
    is_correct: boolean;
  }>;
  difficulty?: string;
}) => {
  const questionId = randomUUID();

  await pool.query(
    `INSERT INTO questions (id, level_id, question_type, title, description, difficulty)
     VALUES (?, ?, 'mcq', ?, ?, ?)`,
    [
      questionId,
      data.level_id,
      data.title,
      data.description,
      data.difficulty || 'medium',
    ]
  );

  // Insert options
  const letters = ['A', 'B', 'C', 'D'];
  for (let i = 0; i < data.options.length; i++) {
    const option = data.options[i];
    const optionId = randomUUID();
    await pool.query(
      `INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter)
       VALUES (?, ?, ?, ?, ?)`,
      [optionId, questionId, option.option_text, option.is_correct, letters[i]]
    );
  }

  // Update course updated_at
  await pool.query(
    `UPDATE courses SET updated_at = CURRENT_TIMESTAMP 
     WHERE id = (SELECT course_id FROM levels WHERE id = ?)`,
    [data.level_id]
  );

  return questionId;
};

export const getLevelQuestions = async (levelId: string) => {
  const result = await pool.query(
    `SELECT id, question_type, title, description, difficulty, created_at
     FROM questions WHERE level_id = ? ORDER BY created_at ASC`,
    [levelId]
  );
  return getRows(result);
};

export const updateCodingQuestion = async (
  questionId: string,
  data: {
    title: string;
    description: string;
    input_format?: string;
    output_format?: string;
    constraints?: string;
    reference_solution: string;
    difficulty?: string;
    test_cases: Array<{
      id?: string;
      input_data: string;
      expected_output: string;
      is_hidden: boolean;
    }>;
  }
) => {
  // Update question
  await pool.query(
    `UPDATE questions 
     SET title = ?, description = ?, input_format = ?, output_format = ?, 
         constraints = ?, reference_solution = ?, difficulty = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      data.title,
      data.description,
      data.input_format || null,
      data.output_format || null,
      data.constraints || null,
      data.reference_solution,
      data.difficulty || 'medium',
      questionId,
    ]
  );

  // Delete existing test cases
  await pool.query('DELETE FROM test_cases WHERE question_id = ?', [questionId]);

  // Insert new test cases
  for (let i = 0; i < data.test_cases.length; i++) {
    const testCase = data.test_cases[i];
    const testCaseId = randomUUID();
    await pool.query(
      `INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, test_case_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [testCaseId, questionId, testCase.input_data, testCase.expected_output, testCase.is_hidden, i + 1]
    );
  }

  // Update course updated_at
  await pool.query(
    `UPDATE courses SET updated_at = CURRENT_TIMESTAMP 
     WHERE id = (SELECT course_id FROM levels WHERE id = (SELECT level_id FROM questions WHERE id = ?))`,
    [questionId]
  );
};

export const updateMCQQuestion = async (
  questionId: string,
  data: {
    title: string;
    description: string;
    options: Array<{
      id?: string;
      option_text: string;
      is_correct: boolean;
    }>;
    difficulty?: string;
  }
) => {
  // Update question
  await pool.query(
    `UPDATE questions 
     SET title = ?, description = ?, difficulty = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [data.title, data.description, data.difficulty || 'medium', questionId]
  );

  // Get existing option IDs before deleting
  const existingOptionsResult = await pool.query(
    'SELECT id FROM mcq_options WHERE question_id = ?',
    [questionId]
  );
  const existingOptionIds = getRows(existingOptionsResult).map((row: any) => row.id);

  // Clear selected_option_id references before deleting options
  if (existingOptionIds.length > 0) {
    const placeholders = existingOptionIds.map(() => '?').join(',');
    await pool.query(
      `UPDATE user_submissions 
       SET selected_option_id = NULL 
       WHERE selected_option_id IN (${placeholders})`,
      existingOptionIds
    );
  }

  // Delete existing options
  await pool.query('DELETE FROM mcq_options WHERE question_id = ?', [questionId]);

  // Insert new options
  const letters = ['A', 'B', 'C', 'D'];
  for (let i = 0; i < data.options.length; i++) {
    const option = data.options[i];
    const optionId = randomUUID();
    await pool.query(
      `INSERT INTO mcq_options (id, question_id, option_text, is_correct, option_letter)
       VALUES (?, ?, ?, ?, ?)`,
      [optionId, questionId, option.option_text, option.is_correct, letters[i]]
    );
  }

  // Update course updated_at
  await pool.query(
    `UPDATE courses SET updated_at = CURRENT_TIMESTAMP 
     WHERE id = (SELECT course_id FROM levels WHERE id = (SELECT level_id FROM questions WHERE id = ?))`,
    [questionId]
  );
};

export const deleteQuestion = async (questionId: string) => {
  // Get level_id before deleting
  const questionResult = await pool.query('SELECT level_id FROM questions WHERE id = ?', [questionId]);
  const questionRows = getRows(questionResult);
  if (questionRows.length === 0) {
    throw new Error('Question not found');
  }

  const levelId = questionRows[0].level_id;

  // Get all mcq_option IDs for this question first
  const mcqOptionsResult = await pool.query(
    'SELECT id FROM mcq_options WHERE question_id = ?',
    [questionId]
  );
  const mcqOptionIds = getRows(mcqOptionsResult).map((row: any) => row.id);

  // Delete in order to handle foreign key constraints:
  // 1. Set selected_option_id to NULL in user_submissions for all mcq_options of this question
  // This must be done BEFORE deleting mcq_options to avoid foreign key constraint violation
  if (mcqOptionIds.length > 0) {
    const placeholders = mcqOptionIds.map(() => '?').join(',');
    await pool.query(
      `UPDATE user_submissions 
       SET selected_option_id = NULL 
       WHERE selected_option_id IN (${placeholders})`,
      mcqOptionIds
    );
  }

  // 2. Delete test_case_results that reference test_cases of this question
  await pool.query(
    `DELETE tcr FROM test_case_results tcr
     INNER JOIN test_cases tc ON tcr.test_case_id = tc.id
     WHERE tc.question_id = ?`,
    [questionId]
  );

  // 3. Delete user_submissions for this question
  await pool.query('DELETE FROM user_submissions WHERE question_id = ?', [questionId]);

  // 4. Delete session_questions for this question
  await pool.query('DELETE FROM session_questions WHERE question_id = ?', [questionId]);

  // 5. Delete test_cases
  await pool.query('DELETE FROM test_cases WHERE question_id = ?', [questionId]);

  // 6. Now safe to delete mcq_options (after clearing selected_option_id references)
  await pool.query('DELETE FROM mcq_options WHERE question_id = ?', [questionId]);

  // 7. Finally delete the question itself
  await pool.query('DELETE FROM questions WHERE id = ?', [questionId]);

  // Update course updated_at
  await pool.query(
    `UPDATE courses SET updated_at = CURRENT_TIMESTAMP 
     WHERE id = (SELECT course_id FROM levels WHERE id = ?)`,
    [levelId]
  );
};
