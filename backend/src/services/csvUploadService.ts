import pool from '../config/database';
import { randomUUID } from 'crypto';
import { getRows } from '../utils/mysqlHelper';
import { createCodingQuestion, createMCQQuestion } from './questionService';
import logger from '../config/logger';
import { normalizeExecutionInput } from '../utils/inputNormalizer';

export interface CSVRow {
  [key: string]: string;
}

export const parseAndCreateQuestionsFromCSV = async (
  csvData: CSVRow[],
  levelId: string
): Promise<{ success: number; errors: string[] }> => {
  let successCount = 0;
  const errors: string[] = [];

  logger.info(`[parseAndCreateQuestionsFromCSV] Starting processing. Rows: ${csvData.length}, levelId: ${levelId}`);

  // Validate level exists
  try {
    const levelCheck = await pool.query('SELECT id FROM levels WHERE id = ?', [levelId]);
    const levelRows = getRows(levelCheck);
    if (levelRows.length === 0) {
      logger.error(`[parseAndCreateQuestionsFromCSV] Level ${levelId} not found`);
      return { success: 0, errors: [`Level ${levelId} not found`] };
    }
    logger.info(`[parseAndCreateQuestionsFromCSV] Level ${levelId} validated`);
  } catch (levelError: any) {
    logger.error(`[parseAndCreateQuestionsFromCSV] Error checking level:`, levelError);
    return { success: 0, errors: [`Failed to validate level: ${levelError.message}`] };
  }

  for (let i = 0; i < csvData.length; i++) {
    const row = csvData[i];
    const rowNumber = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

    try {
      logger.info(`[parseAndCreateQuestionsFromCSV] Processing row ${rowNumber}. Keys: ${Object.keys(row).join(', ')}`);
      // Determine question type based on available columns
      const hasTestCases = row.test_cases || row.test_case_1 || row['test_case_1'];
      const hasOptions = row.option1 || row.option_1 || row['option_1'];
      const questionType = hasTestCases || row.reference_solution ? 'coding' : hasOptions ? 'mcq' : 'coding';

      if (questionType === 'coding') {
        // Parse coding question - required columns
        if (!row.title || !row.description || !row.reference_solution) {
          errors.push(`Row ${rowNumber}: Missing required fields (title, description, or reference_solution)`);
          continue;
        }

        // Parse test cases from testcase1_input through testcase6_input columns
        // Format: testcase1_input, testcase1_output, testcase1_hidden, ... up to testcase6
        // Test cases must be inserted with correct test_case_number (1-6) matching CSV column number
        const testCases: Array<{ input_data: string; expected_output: string; is_hidden: boolean; test_case_number: number }> = [];
        
        for (let testCaseNum = 1; testCaseNum <= 6; testCaseNum++) {
          const inputKey = `testcase${testCaseNum}_input`;
          const outputKey = `testcase${testCaseNum}_output`;
          const hiddenKey = `testcase${testCaseNum}_hidden`;
          
          const inputData = row[inputKey]?.trim();
          const outputData = row[outputKey]?.trim();
          const hiddenValue = row[hiddenKey]?.trim();
          
          // If input and output are both present, add this test case with correct test_case_number
          if (inputData && outputData) {
            // Parse is_hidden: must be 0 or 1, default to 0 if missing or invalid
            let isHidden = 0;
            if (hiddenValue !== undefined && hiddenValue !== '') {
              const hiddenLower = hiddenValue.toLowerCase();
              if (hiddenLower === '1' || hiddenLower === 'true') {
                isHidden = 1;
              } else if (hiddenLower === '0' || hiddenLower === 'false') {
                isHidden = 0;
            } else {
                errors.push(`Row ${rowNumber}: Invalid value for ${hiddenKey} "${hiddenValue}". Must be 0 or 1. Defaulting to 0.`);
              }
            }
            
            // Normalize escaped characters in input and output before storing
            // This converts "5\\n1 2 3 4 5" to "5\n1 2 3 4 5" (actual newline)
            const normalizedInput = normalizeExecutionInput(inputData);
            const normalizedOutput = normalizeExecutionInput(outputData);
            
                testCases.push({
              input_data: normalizedInput,
              expected_output: normalizedOutput,
              is_hidden: isHidden === 1,
              test_case_number: testCaseNum, // Preserve the test case number from CSV column
            });
            
            logger.info(`Row ${rowNumber}: Parsed test case ${testCaseNum}. Hidden: ${isHidden === 1}, Input: "${normalizedInput.substring(0, 50)}${normalizedInput.length > 50 ? '...' : ''}", Output: "${normalizedOutput.substring(0, 50)}${normalizedOutput.length > 50 ? '...' : ''}"`);
          } else if (inputData || outputData) {
            // Partial test case (only input or only output) - warn but don't fail
            logger.warn(`Row ${rowNumber}: Test case ${testCaseNum} has partial data. Input: ${inputData ? 'present' : 'missing'}, Output: ${outputData ? 'present' : 'missing'}. Skipping this test case.`);
          }
        }

        // Validate that at least one test case was parsed
        if (testCases.length === 0) {
          errors.push(`Row ${rowNumber}: No valid test cases found. Provide at least one test case using testcase1_input, testcase1_output columns (up to testcase6).`);
          continue;
        }

        await createCodingQuestion({
          level_id: levelId,
          title: row.title.trim(),
          description: row.description.trim(),
          input_format: (row.input_format || '').trim(),
          output_format: (row.output_format || '').trim(),
          constraints: (row.constraints || '').trim(),
          reference_solution: row.reference_solution.trim(),
          difficulty: (row.difficulty?.toLowerCase() || 'medium').trim(),
          test_cases: testCases,
        });

        successCount++;
      } else {
        // Parse MCQ question
        if (!row.title || !row.description) {
          errors.push(`Row ${rowNumber}: Missing required fields (title or description)`);
          continue;
        }

        const options: Array<{ option_text: string; is_correct: boolean }> = [];

        const rawCorrectOption = row.correct_option?.toString().trim();
        const rawCorrectAnswer = row.correct_answer?.toString().trim();

        // Decide whether to treat correct_answer as a letter (A/B/C/D) or full text
        let correctLetter: string | null = null;
        let correctTextLower: string | null = null;

        if (rawCorrectOption) {
          correctLetter = rawCorrectOption.toUpperCase();
        }

        if (rawCorrectAnswer) {
          const upper = rawCorrectAnswer.toUpperCase();
          if (['A', 'B', 'C', 'D'].includes(upper)) {
            // Legacy style: letter
            correctLetter = correctLetter || upper;
          } else {
            // Preferred style: full text match
            correctTextLower = rawCorrectAnswer.toLowerCase();
          }
        }

        // Validate that a correct answer was provided
        if (!correctLetter && !correctTextLower) {
          errors.push(`Row ${rowNumber}: No correct answer specified (provide correct_option as A/B/C/D or correct_answer as full text)`);
          continue;
        }

        // Parse options (option1, option2, option3, option4 or option_1, option_2, etc.)
        for (let optNum = 1; optNum <= 4; optNum++) {
          const optionText =
            row[`option${optNum}`] || row[`option_${optNum}`] || row[`option ${optNum}`];
          if (optionText) {
            const trimmed = optionText.trim();
            const letter = String.fromCharCode(64 + optNum); // A, B, C, D

            const isCorrect =
              correctTextLower != null
                ? trimmed.toLowerCase() === correctTextLower
                : letter === (correctLetter || 'A');

            options.push({
              option_text: trimmed,
              is_correct: isCorrect,
            });
          }
        }

        if (options.length < 2) {
          errors.push(`Row ${rowNumber}: MCQ questions must have at least 2 options`);
          continue;
        }

        // Ensure at least one option is marked as correct
        const hasCorrectOption = options.some(opt => opt.is_correct === true);
        if (!hasCorrectOption) {
          errors.push(`Row ${rowNumber}: No correct option found. Please check your correct_answer or correct_option field.`);
          continue;
        }

        await createMCQQuestion({
          level_id: levelId,
          title: row.title.trim(),
          description: row.description.trim(),
          options: options,
          difficulty: row.difficulty?.toLowerCase() || 'medium',
        });

        successCount++;
      }
    } catch (error: any) {
      logger.error(`[parseAndCreateQuestionsFromCSV] Error processing CSV row ${rowNumber}:`, error);
      logger.error(`[parseAndCreateQuestionsFromCSV] Row ${rowNumber} error message:`, error.message);
      logger.error(`[parseAndCreateQuestionsFromCSV] Row ${rowNumber} error stack:`, error.stack);
      logger.error(`[parseAndCreateQuestionsFromCSV] Row ${rowNumber} data:`, JSON.stringify(row, null, 2));
      errors.push(`Row ${rowNumber}: ${error.message || 'Unknown error'}`);
    }
  }

  logger.info(`[parseAndCreateQuestionsFromCSV] Processing complete. Success: ${successCount}, Errors: ${errors.length}`);
  return { success: successCount, errors };
};

