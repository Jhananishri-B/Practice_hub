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
  levelId: string,
  questionType?: 'coding' | 'mcq'
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

  // Enforce questionType and new MCQ format only
  const enforcedType = questionType || 'mcq';

  if (enforcedType !== 'mcq') {
    logger.warn(`[parseAndCreateQuestionsFromCSV] Only MCQ uploads are supported via CSV. Received type: ${enforcedType}`);
    return { success: 0, errors: ['Only MCQ CSV uploads are supported. Please choose MCQ and provide the required columns.'] };
  }

  for (let i = 0; i < csvData.length; i++) {
    const row = csvData[i];
    const rowNumber = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

    try {
      logger.info(`[parseAndCreateQuestionsFromCSV] Processing row ${rowNumber}. Keys: ${Object.keys(row).join(', ')}`);

      // Expected headers (case-insensitive, underscores applied by parser):
      // Problem Title -> problem_title
      // Question Description -> question_description
      // Option A/B/C/D -> option_a / option_b / option_c / option_d
      // Correct Answer (Text) -> correct_answer (must match one of the options, case-insensitive)
      const requiredHeadersPresent =
        row.problem_title !== undefined &&
        row.question_description !== undefined &&
        row.option_a !== undefined &&
        row.option_b !== undefined &&
        row.option_c !== undefined &&
        row.option_d !== undefined &&
        row.correct_answer !== undefined;

      if (!requiredHeadersPresent) {
        errors.push(
          `Row ${rowNumber}: Missing required columns. Expected headers: Problem Title, Question Description, Option A, Option B, Option C, Option D, Correct Answer (Text).`
        );
        continue;
      }

      const title = row.problem_title?.toString().trim();
      const description = row.question_description?.toString().trim();
      const optA = row.option_a?.toString().trim();
      const optB = row.option_b?.toString().trim();
      const optC = row.option_c?.toString().trim();
      const optD = row.option_d?.toString().trim();
      const correctAnswerRaw = row.correct_answer?.toString().trim();

      // Validate required fields
      if (!title || !description) {
        errors.push(`Row ${rowNumber}: Missing Problem Title or Question Description`);
        continue;
      }

      // Collect options (must have all four; ignore empty strings but require at least 2)
      const optionTexts = [optA, optB, optC, optD].filter(Boolean) as string[];
      if (optionTexts.length < 2) {
        errors.push(`Row ${rowNumber}: MCQ questions must have at least 2 options (Option A-D)`);
        continue;
      }

      if (!correctAnswerRaw) {
        errors.push(`Row ${rowNumber}: Correct Answer is required and must match one of the options exactly (case-insensitive)`);
        continue;
      }

      // Match correct answer against options (case-insensitive, trimmed)
      const correctLower = correctAnswerRaw.toLowerCase();
      const matchedIndex = optionTexts.findIndex(opt => opt.toLowerCase() === correctLower);
      if (matchedIndex === -1) {
        errors.push(`Row ${rowNumber}: Correct Answer "${correctAnswerRaw}" does not match any option (A-D). It must exactly match one of the option texts.`);
        continue;
      }

      // Build options array with is_correct flag
      const options = optionTexts.map((opt, idx) => ({
        option_text: opt,
        is_correct: idx === matchedIndex,
      }));

      await createMCQQuestion({
        level_id: levelId,
        title,
        description,
        options,
        difficulty: row.difficulty?.toLowerCase() || 'medium',
      });

      successCount++;
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

