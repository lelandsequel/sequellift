import { Router } from 'express';
import analyticsController from '../controllers/analyticsController';

const router = Router();

// Get dashboard statistics
router.get('/statistics', analyticsController.getStatistics.bind(analyticsController));

// Get hot opportunities (top scoring buildings)
router.get('/hot-opportunities', analyticsController.getHotOpportunities.bind(analyticsController));

// Get buildings with recent violations
router.get('/recent-violations', analyticsController.getRecentViolations.bind(analyticsController));

// Get opportunity score distribution
router.get('/score-distribution', analyticsController.getScoreDistribution.bind(analyticsController));

// Get ROI analysis by priority level
router.get('/roi-analysis', analyticsController.getROIAnalysis.bind(analyticsController));

export default router;