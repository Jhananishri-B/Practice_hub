import pool from '../config/database';
import { randomUUID } from 'crypto';

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
     FROM questions WHERE id = $1`,
    [questionId]
  );

  if (result.rows.length === 0) {
    throw new Error('Question not found');
  }

  const question = result.rows[0];

  // Get test cases if coding question
  if (question.question_type === 'coding') {
    const testCasesResult = await pool.query(
      'SELECT id, input_data, expected_output, is_hidden, test_case_number FROM test_cases WHERE question_id = $1 ORDER BY test_case_number',
      [questionId]
    );
    question.test_cases = testCasesResult.rows;
  }

  // Get options if MCQ
  if (question.question_type === 'mcq') {
    const optionsResult = await pool.query(
      'SELECT id, option_text, is_correct, option_letter FROM mcq_options WHERE question_id = $1 ORDER BY option_letter',
      [questionId]
    );
    question.options = optionsResult.rows;
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
     VALUES ($1, $2, 'coding', $3, $4, $5, $6, $7, $8, $9)`,
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
    await pool.query(
      `INSERT INTO test_cases (question_id, input_data, expected_output, is_hidden, test_case_number)
       VALUES ($1, $2, $3, $4, $5)`,
      [questionId, testCase.input_data, testCase.expected_output, testCase.is_hidden, i + 1]
    );
  }

  // Update course updated_at
  await pool.query(
    `UPDATE courses SET updated_at = CURRENT_TIMESTAMP 
     WHERE id = (SELECT course_id FROM levels WHERE id = $1)`,
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
     VALUES ($1, $2, 'mcq', $3, $4, $5)`,
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
    await pool.query(
      `INSERT INTO mcq_options (question_id, option_text, is_correct, option_letter)
       VALUES ($1, $2, $3, $4)`,
      [questionId, option.option_text, option.is_correct, letters[i]]
    );
  }

  // Update course updated_at
  await pool.query(
    `UPDATE courses SET updated_at = CURRENT_TIMESTAMP 
     WHERE id = (SELECT course_id FROM levels WHERE id = $1)`,
    [data.level_id]
  );

  return questionId;
};

export const getLevelQuestions = async (levelId: string) => {
  const result = await pool.query(
    `SELECT id, question_type, title, description, difficulty, created_at
     FROM questions WHERE level_id = $1 ORDER BY created_at ASC`,
    [levelId]
  );
  return result.rows;
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
     SET title = $1, description = $2, input_format = $3, output_format = $4, 
         constraints = $5, reference_solution = $6, difficulty = $7, updated_at = CURRENT_TIMESTAMP
     WHERE id = $8`,
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
  await pool.query('DELETE FROM test_cases WHERE question_id = $1', [questionId]);

  // Insert new test cases
  for (let i = 0; i < data.test_cases.length; i++) {
    const testCase = data.test_cases[i];
    await pool.query(
      `INSERT INTO test_cases (question_id, input_data, expected_output, is_hidden, test_case_number)
       VALUES ($1, $2, $3, $4, $5)`,
      [questionId, testCase.input_data, testCase.expected_output, testCase.is_hidden, i + 1]
    );
  }

  // Update course updated_at
  await pool.query(
    `UPDATE courses SET updated_at = CURRENT_TIMESTAMP 
     WHERE id = (SELECT course_id FROM levels WHERE id = (SELECT level_id FROM questions WHERE id = $1))`,
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
     SET title = $1, description = $2, difficulty = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $4`,
    [data.title, data.description, data.difficulty || 'medium', questionId]
  );

  // Delete existing options
  await pool.query('DELETE FROM mcq_options WHERE question_id = $1', [questionId]);

  // Insert new options
  const letters = ['A', 'B', 'C', 'D'];
  for (let i = 0; i < data.options.length; i++) {
    const option = data.options[i];
    await pool.query(
      `INSERT INTO mcq_options (question_id, option_text, is_correct, option_letter)
       VALUES ($1, $2, $3, $4)`,
      [questionId, option.option_text, option.is_correct, letters[i]]
    );
  }

  // Update course updated_at
  await pool.query(
    `UPDATE courses SET updated_at = CURRENT_TIMESTAMP 
     WHERE id = (SELECT course_id FROM levels WHERE id = (SELECT level_id FROM questions WHERE id = $1))`,
    [questionId]
  );
};

export const deleteQuestion = async (questionId: string) => {
  // Get level_id before deleting
  const questionResult = await pool.query('SELECT level_id FROM questions WHERE id = $1', [questionId]);
  if (questionResult.rows.length === 0) {
    throw new Error('Question not found');
  }

  // Delete question (cascade will delete test_cases and mcq_options)
  await pool.query('DELETE FROM questions WHERE id = $1', [questionId]);

  // Update course updated_at
  await pool.query(
    `UPDATE courses SET updated_at = CURRENT_TIMESTAMP 
     WHERE id = (SELECT course_id FROM levels WHERE id = $1)`,
    [questionResult.rows[0].level_id]
  );
};

