import { Response } from 'express';
import { getTutorResponse, getInitialHint, generateLessonPlan, TutorContext } from '../services/aiTutorService';
import { AuthRequest } from '../middlewares/auth';
import logger from '../config/logger';
import pool from '../config/database';
import { getRows, getFirstRow } from '../utils/mysqlHelper';

export const chatWithTutor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let context: TutorContext;

    if (sessionId) {
      // Get session and question context from DB
      const sessionResult = await pool.query(
        `SELECT s.id, s.session_type, sq.question_id, q.title, q.description, q.question_type
         FROM practice_sessions s
         JOIN session_questions sq ON s.id = sq.session_id
         JOIN questions q ON sq.question_id = q.id
         WHERE s.id = ? AND s.user_id = ?
         ORDER BY sq.question_order
         LIMIT 1`,
        [sessionId, userId]
      );

      const sessionRows = getRows(sessionResult);
      if (sessionRows.length === 0) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      const session = sessionRows[0];
      const questionId = session.question_id;

      // Get user submission
      const submissionResult = await pool.query(
        `SELECT submitted_code, language, selected_option_id
         FROM user_submissions
         WHERE session_id = ? AND question_id = ? AND user_id = ?
         ORDER BY submitted_at DESC
         LIMIT 1`,
        [sessionId, questionId, userId]
      );

      const submissionRows = getRows(submissionResult);
      const submission = submissionRows[0] || null;

      // Get failed test cases if coding question
      let failedTestCases = [];
      if (session.question_type === 'coding' && submission) {
        const testResults = await pool.query(
          `SELECT tc.input_data, tc.expected_output, tcr.actual_output, tcr.error_message
           FROM test_case_results tcr
           JOIN test_cases tc ON tcr.test_case_id = tc.id
           WHERE tcr.submission_id = (
             SELECT id FROM user_submissions 
             WHERE session_id = ? AND question_id = ? AND user_id = ?
             ORDER BY submitted_at DESC LIMIT 1
           )
           AND tcr.passed = false`,
          [sessionId, questionId, userId]
        );
        failedTestCases = getRows(testResults);
      }

      // Get correct answer for MCQ
      let correctAnswer = null;
      if (session.question_type === 'mcq') {
        const correctOption = await pool.query(
          `SELECT option_text FROM mcq_options
           WHERE question_id = ? AND is_correct = true
           LIMIT 1`,
          [questionId]
        );
        const correctOptionRows = getRows(correctOption);
        correctAnswer = correctOptionRows[0]?.option_text || null;
      }

      // Get reference solution for coding
      const questionResult = await pool.query(
        'SELECT reference_solution FROM questions WHERE id = ?',
        [questionId]
      );
      const questionRows = getRows(questionResult);
      const correctCode = questionRows[0]?.reference_solution || null;

      context = {
        questionTitle: session.title,
        questionDescription: session.description,
        userCode: submission?.submitted_code || null,
        correctCode: correctCode,
        failedTestCases: failedTestCases.map((tc: any) => ({
          input: tc.input_data,
          expected: tc.expected_output,
          actual: tc.actual_output || '',
          error: tc.error_message || undefined,
        })),
        questionType: session.question_type as 'coding' | 'mcq',
        selectedAnswer: submission?.selected_option_id || null,
        correctAnswer: correctAnswer,
      };
    } else {
      // General chat context (no session support)
      context = {
        questionTitle: "General Coding Help",
        questionDescription: "The user is asking for general assistance with programming concepts, debugging, or advice unrelated to a specific practice session.",
        questionType: 'coding', // Default type
      };
    }

    const response = await getTutorResponse(message, context);
    res.json({ message: response });
  } catch (error: any) {
    logger.error('AI Tutor error:', error);
    res.status(500).json({ error: 'Failed to get tutor response' });
  }
};

export const getInitialHintController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get session context (similar to chatWithTutor)
    const sessionResult = await pool.query(
      `SELECT s.session_type, sq.question_id, q.title, q.question_type
       FROM practice_sessions s
       JOIN session_questions sq ON s.id = sq.session_id
       JOIN questions q ON sq.question_id = q.id
       WHERE s.id = ? AND s.user_id = ?
       ORDER BY sq.question_order
       LIMIT 1`,
      [sessionId, userId]
    );

    const sessionRows = getRows(sessionResult);
    if (sessionRows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const session = sessionRows[0];

    const context: TutorContext = {
      questionTitle: session.title,
      questionDescription: '',
      questionType: session.question_type as 'coding' | 'mcq',
    };

    const hint = getInitialHint(context);

    res.json({ hint });
  } catch (error: any) {
    logger.error('Get initial hint error:', error);
    res.status(500).json({ error: 'Failed to get hint' });
  }
};

export const generateLessonController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, levelId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch Course & Level details
    const courseResult = await pool.query('SELECT title FROM courses WHERE id = ?', [courseId]);
    const levelResult = await pool.query('SELECT title, description FROM levels WHERE id = ?', [levelId]);

    const courseRows = getRows(courseResult);
    const levelRows = getRows(levelResult);

    if (courseRows.length === 0 || levelRows.length === 0) {
      res.status(404).json({ error: 'Course or Level not found' });
      return;
    }

    const courseTitle = courseRows[0].title;
    const levelTitle = levelRows[0].title;
    const levelDescription = levelRows[0].description;

    const lessonPlan = await generateLessonPlan(courseTitle, levelTitle, levelDescription, levelId);
    res.json(lessonPlan);

  } catch (error: any) {
    logger.error('Generate Lesson Plan error:', error);
    res.status(500).json({ error: 'Failed to generate lesson plan' });
  }
};
