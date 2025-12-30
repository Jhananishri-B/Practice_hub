import pool from '../config/database';
import { randomUUID } from 'crypto';
import { getRows } from '../utils/mysqlHelper';
import { createCodingQuestion, createMCQQuestion } from './questionService';
import logger from '../config/logger';

export interface CSVRow {
  [key: string]: string;
}

export const parseAndCreateQuestionsFromCSV = async (
  csvData: CSVRow[],
  levelId: string
): Promise<{ success: number; errors: string[] }> => {
  let successCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < csvData.length; i++) {
    const row = csvData[i];
    const rowNumber = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

    try {
      // Determine question type based on available columns
      const hasTestCases = row.test_cases || row.test_case_1 || row['test_case_1'];
      const hasOptions = row.option1 || row.option_1 || row['option_1'];
      const questionType = hasTestCases || row.reference_solution ? 'coding' : hasOptions ? 'mcq' : 'coding';

      if (questionType === 'coding') {
        // Parse coding question
        if (!row.title || !row.description || !row.reference_solution) {
          errors.push(`Row ${rowNumber}: Missing required fields (title, description, or reference_solution)`);
          continue;
        }

        // Parse test cases - can be in different formats
        const testCases: Array<{ input_data: string; expected_output: string; is_hidden: boolean }> = [];
        
        // Format 1: Single test_cases column with JSON or semicolon-separated
        if (row.test_cases) {
          try {
            const parsed = JSON.parse(row.test_cases);
            if (Array.isArray(parsed)) {
              testCases.push(...parsed);
            }
          } catch {
            // Try semicolon-separated format: "input1|output1;input2|output2"
            const cases = row.test_cases.split(';');
            cases.forEach((testCase: string) => {
              const [input, output] = testCase.split('|');
              if (input && output) {
                testCases.push({
                  input_data: input.trim(),
                  expected_output: output.trim(),
                  is_hidden: false,
                });
              }
            });
          }
        } else {
          // Format 2: Multiple columns like test_case_1, test_case_2, etc.
          let testCaseIndex = 1;
          while (row[`test_case_${testCaseIndex}_input`] || row[`test_case_${testCaseIndex}`]) {
            const input = row[`test_case_${testCaseIndex}_input`] || row[`test_case_${testCaseIndex}`]?.split('|')[0] || '';
            const output = row[`test_case_${testCaseIndex}_output`] || row[`test_case_${testCaseIndex}`]?.split('|')[1] || '';
            const isHidden = row[`test_case_${testCaseIndex}_hidden`] === 'true' || row[`test_case_${testCaseIndex}_hidden`] === '1';
            
            if (input && output) {
              testCases.push({
                input_data: input.trim(),
                expected_output: output.trim(),
                is_hidden: isHidden,
              });
            }
            testCaseIndex++;
          }
        }

        // If no test cases found, create a default one
        if (testCases.length === 0) {
          testCases.push({
            input_data: row.sample_input || '',
            expected_output: row.sample_output || '',
            is_hidden: false,
          });
        }

        await createCodingQuestion({
          level_id: levelId,
          title: row.title.trim(),
          description: row.description.trim(),
          input_format: row.input_format || row.input_format || '',
          output_format: row.output_format || row.output_format || '',
          constraints: row.constraints || '',
          reference_solution: row.reference_solution.trim(),
          difficulty: row.difficulty?.toLowerCase() || 'medium',
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
        const correctOption = row.correct_option?.toUpperCase() || row.correct_answer?.toUpperCase() || 'A';

        // Parse options (option1, option2, option3, option4 or option_1, option_2, etc.)
        for (let optNum = 1; optNum <= 4; optNum++) {
          const optionText = row[`option${optNum}`] || row[`option_${optNum}`] || row[`option ${optNum}`];
          if (optionText) {
            const letter = String.fromCharCode(64 + optNum); // A, B, C, D
            options.push({
              option_text: optionText.trim(),
              is_correct: letter === correctOption,
            });
          }
        }

        if (options.length < 2) {
          errors.push(`Row ${rowNumber}: MCQ questions must have at least 2 options`);
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
      logger.error(`Error processing CSV row ${rowNumber}:`, error);
      errors.push(`Row ${rowNumber}: ${error.message || 'Unknown error'}`);
    }
  }

  return { success: successCount, errors };
};

