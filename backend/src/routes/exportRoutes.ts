import { Router } from 'express';
import exportController from '../controllers/exportController';

const router = Router();

// Export endpoints
router.post('/buildings', exportController.exportBuildings.bind(exportController));
router.post('/opportunities', exportController.exportOpportunities.bind(exportController));
router.post('/violations', exportController.exportViolations.bind(exportController));
router.post('/report', exportController.generateReport.bind(exportController));

// Template endpoints
router.get('/templates', exportController.getExportTemplates.bind(exportController));
router.post('/templates/:templateId/apply', exportController.applyExportTemplate.bind(exportController));

export default router;