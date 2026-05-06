import { Router } from 'express';
import { reportController } from './report.controller';

const router = Router();
router.get('/:assessmentId/pdf', reportController.download);

export const reportRoutes = router;
