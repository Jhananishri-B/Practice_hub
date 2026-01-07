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
        // Parse coding question - required columns
        if (!row.title || !row.description || !row.reference_solution || !row.test_cases) {
          errors.push(`Row ${rowNumber}: Missing required fields (title, description, reference_solution, or test_cases)`);
          continue;
        }

        // Parse test cases from test_cases column with special format
        // Format: Each test case starts with [VISIBLE] or [HIDDEN]
        // Then "Input:" followed by input data, then "Output:" followed by output data
        // Test cases are separated by blank lines
        const testCases: Array<{ input_data: string; expected_output: string; is_hidden: boolean }> = [];
        
        if (row.test_cases) {
          const testCasesText = row.test_cases.trim();
          logger.info(`Row ${rowNumber}: Parsing test cases. Length: ${testCasesText.length}, Preview: ${testCasesText.substring(0, 100)}`);
          
          // Split by pattern: [VISIBLE] or [HIDDEN] markers
          // This will split the text into blocks, each starting with a visibility marker
          const testCaseBlocks = testCasesText.split(/(?=\[(?:VISIBLE|HIDDEN)\])/i);
          logger.info(`Row ${rowNumber}: Split into ${testCaseBlocks.length} blocks`);
          
          for (const block of testCaseBlocks) {
            const trimmedBlock = block.trim();
            if (!trimmedBlock) continue;
            
            logger.info(`Row ${rowNumber}: Processing block. Length: ${trimmedBlock.length}, Preview: ${trimmedBlock.substring(0, 100)}`);

            let isHidden = false;
            let blockContent = trimmedBlock;

            // Extract visibility marker [VISIBLE] or [HIDDEN] (case-insensitive)
            const visibilityMatch = trimmedBlock.match(/^\[(VISIBLE|HIDDEN)\]/i);
            if (visibilityMatch) {
              const visibility = visibilityMatch[1].toUpperCase();
              isHidden = visibility === 'HIDDEN';
              // Remove [VISIBLE] or [HIDDEN] prefix and any following whitespace/newlines
              blockContent = trimmedBlock.replace(/^\[(?:VISIBLE|HIDDEN)\]\s*/i, '').trim();
            } else {
              // If no visibility marker found, skip this block or default to visible
              logger.warn(`Row ${rowNumber}: Test case block missing [VISIBLE] or [HIDDEN] marker, skipping`);
              continue;
            }

            // Extract Input and Output sections using line-by-line parsing
            // This is more robust for multi-line content
            const lines = blockContent.split(/\r?\n/);
            
            let inputStartIndex = -1;
            let outputStartIndex = -1;
            
            // Find Input and Output markers
            for (let i = 0; i < lines.length; i++) {
              const lineLower = lines[i].trim().toLowerCase();
              if (lineLower.startsWith('input')) {
                inputStartIndex = i;
              } else if (lineLower.startsWith('output') && inputStartIndex !== -1) {
                outputStartIndex = i;
                break; // Stop at first Output after Input
              }
            }
            
            if (inputStartIndex !== -1 && outputStartIndex !== -1 && outputStartIndex > inputStartIndex) {
              // Extract input: everything from line after "Input:" until "Output:"
              // The "Input:" line might be "Input:" or "Input" - extract content after colon if present
              const inputFirstLine = lines[inputStartIndex].trim();
              const inputColonIndex = inputFirstLine.toLowerCase().indexOf(':');
              const inputContentStart = inputColonIndex !== -1 ? inputFirstLine.substring(inputColonIndex + 1).trim() : '';
              
              // Collect all input lines (from Input line until Output line)
              const inputLines: string[] = [];
              if (inputContentStart) {
                inputLines.push(inputContentStart);
              }
              for (let i = inputStartIndex + 1; i < outputStartIndex; i++) {
                const line = lines[i].trim();
                if (line) {
                  inputLines.push(line);
                }
              }
              
              // Extract output: everything from line after "Output:" until end
              const outputFirstLine = lines[outputStartIndex].trim();
              const outputColonIndex = outputFirstLine.toLowerCase().indexOf(':');
              const outputContentStart = outputColonIndex !== -1 ? outputFirstLine.substring(outputColonIndex + 1).trim() : '';
              
              // Collect all output lines (from Output line until end)
              const outputLines: string[] = [];
              if (outputContentStart) {
                outputLines.push(outputContentStart);
              }
              for (let i = outputStartIndex + 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                  outputLines.push(line);
                }
              }
              
              const inputData = inputLines.join('\n').trim();
              const outputData = outputLines.join('\n').trim();

              if (inputData && outputData) {
                testCases.push({
                  input_data: inputData,
                  expected_output: outputData,
                  is_hidden: isHidden,
                });
                logger.info(`Row ${rowNumber}: Successfully parsed test case. Hidden: ${isHidden}, Input: "${inputData.substring(0, 50)}...", Output: "${outputData}"`);
              } else {
                logger.warn(`Row ${rowNumber}: Test case block has empty Input or Output section. Input lines: ${inputLines.length}, Output lines: ${outputLines.length}, Input: "${inputData}", Output: "${outputData}"`);
              }
            } else {
              logger.warn(`Row ${rowNumber}: Could not find Input or Output sections. Input index: ${inputStartIndex}, Output index: ${outputStartIndex}. Block preview: ${blockContent.substring(0, 200)}`);
            }
          }
        }

        // Validate that at least one test case was parsed
        if (testCases.length === 0) {
          errors.push(`Row ${rowNumber}: No valid test cases found. Expected format: [VISIBLE] or [HIDDEN] followed by Input and Output sections separated by blank lines`);
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
      logger.error(`Error processing CSV row ${rowNumber}:`, error);
      errors.push(`Row ${rowNumber}: ${error.message || 'Unknown error'}`);
    }
  }

  return { success: successCount, errors };
};

