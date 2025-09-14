import { Router } from 'express';
import buildingController from '../controllers/buildingController';

const router = Router();

// Get all buildings with filtering, pagination, and sorting
router.get('/', buildingController.getBuildings.bind(buildingController));

// Get building by ID with detailed information
router.get('/:id', buildingController.getBuildingById.bind(buildingController));

// Get elevators for a specific building
router.get('/:id/elevators', buildingController.getBuildingElevators.bind(buildingController));

// Get violations for a specific building
router.get('/:id/violations', buildingController.getBuildingViolations.bind(buildingController));

// Recalculate opportunity score for a building
router.post('/:id/recalculate-score', buildingController.recalculateScore.bind(buildingController));

export default router;