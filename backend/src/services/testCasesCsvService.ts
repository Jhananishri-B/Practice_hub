import pool from '../config/database';
import { randomUUID } from 'crypto';
import { getRows } from '../utils/mysqlHelper';
import logger from '../config/logger';

export interface TestCaseCSVRow {
  question_title: string;
  test_case_number: string;
  input_data: string;
  expected_output: string;
  is_hidden: string;
}

export const parseAndImportTestCasesFromCSV = async (
  csvData: TestCaseCSVRow[],
  levelId: string
): Promise<{ success: number; errors: string[] }> => {
  let successCount = 0;
  const errors: string[] = [];

  // Track test case numbers per question to detect duplicates
  const questionTestCaseMap = new Map<string, Set<number>>();

  for (let i = 0; i < csvData.length; i++) {
    const row = csvData[i];
    const rowNumber = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

    try {
      // Validate required fields
      if (!row.question_title || !row.test_case_number || row.input_data === undefined || row.expected_output === undefined) {
        errors.push(`Row ${rowNumber}: Missing required fields (question_title, test_case_number, input_data, or expected_output)`);
        continue;
      }

      // Validate question_title exists
      const questionTitle = row.question_title.trim();
      if (!questionTitle) {
        errors.push(`Row ${rowNumber}: question_title cannot be empty`);
        continue;
      }

      // Find question by title and level_id
      const questionResult = await pool.query(
        'SELECT id FROM questions WHERE title = ? AND level_id = ? AND question_type = ?',
        [questionTitle, levelId, 'coding']
      );

      const questionRows = getRows(questionResult);
      if (questionRows.length === 0) {
        errors.push(`Row ${rowNumber}: Question with title "${questionTitle}" not found in this level (must be a coding question)`);
        continue;
      }

      const questionId = questionRows[0].id;

      // Validate test_case_number
      const testCaseNumber = parseInt(row.test_case_number.trim(), 10);
      if (isNaN(testCaseNumber) || testCaseNumber < 1) {
        errors.push(`Row ${rowNumber}: test_case_number must be a positive integer`);
        continue;
      }

      // Check for duplicate test_case_number for this question
      if (!questionTestCaseMap.has(questionId)) {
        questionTestCaseMap.set(questionId, new Set());
      }
      const testCaseNumbers = questionTestCaseMap.get(questionId)!;
      
      if (testCaseNumbers.has(testCaseNumber)) {
        errors.push(`Row ${rowNumber}: Duplicate test_case_number ${testCaseNumber} for question "${questionTitle}"`);
        continue;
      }

      // Validate is_hidden (must be 0 or 1)
      const isHiddenStr = (row.is_hidden || '0').toString().trim();
      let isHidden: number;
      if (isHiddenStr === '1' || isHiddenStr.toLowerCase() === 'true') {
        isHidden = 1;
      } else if (isHiddenStr === '0' || isHiddenStr.toLowerCase() === 'false') {
        isHidden = 0;
      } else {
        errors.push(`Row ${rowNumber}: is_hidden must be 0 or 1 (got: ${isHiddenStr})`);
        continue;
      }

      // Check if test case with this number already exists in database
      const existingResult = await pool.query(
        'SELECT id FROM test_cases WHERE question_id = ? AND test_case_number = ?',
        [questionId, testCaseNumber]
      );
      const existingRows = getRows(existingResult);
      if (existingRows.length > 0) {
        errors.push(`Row ${rowNumber}: Test case number ${testCaseNumber} already exists for question "${questionTitle}"`);
        continue;
      }

      // Insert test case
      const testCaseId = randomUUID();
      await pool.query(
        `INSERT INTO test_cases (id, question_id, test_case_number, input_data, expected_output, is_hidden)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [testCaseId, questionId, testCaseNumber, row.input_data || '', row.expected_output || '', isHidden]
      );

      testCaseNumbers.add(testCaseNumber);
      successCount++;
      logger.info(`Row ${rowNumber}: Successfully imported test case ${testCaseNumber} for question "${questionTitle}"`);

    } catch (error: any) {
      logger.error(`Row ${rowNumber}: Error importing test case:`, error);
      errors.push(`Row ${rowNumber}: ${error.message || 'Unknown error'}`);
    }
  }

  return { success: successCount, errors };
};
