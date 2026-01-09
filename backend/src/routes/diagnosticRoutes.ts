import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as diagnosticController from '../controllers/diagnosticController';

const router = express.Router();

// ============================================================================
// Diagnostic Test Routes - All require authentication
// ============================================================================

// Check if user needs diagnostic
router.get('/status', authenticate, diagnosticController.checkStatus);

// Start diagnostic test
router.post('/start', authenticate, diagnosticController.startDiagnostic);

// Submit answer during diagnostic
router.post('/:sessionId/submit', authenticate, diagnosticController.submitAnswer);

// Complete diagnostic and get results
router.post('/:sessionId/complete', authenticate, diagnosticController.completeDiagnostic);

export default router;
