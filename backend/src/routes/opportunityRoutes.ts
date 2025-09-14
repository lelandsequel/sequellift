import { Router } from 'express';
import opportunityController from '../controllers/opportunityController';

const router = Router();

// Get all opportunities with filtering
router.get('/', opportunityController.getOpportunities.bind(opportunityController));

// Update opportunity status
router.patch('/:id/status', opportunityController.updateOpportunityStatus.bind(opportunityController));

export default router;