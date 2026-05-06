import { Router } from 'express';
import { assessmentRoutes } from './modules/assessment/assessment.route';
import { questionRoutes } from './modules/question/question.route';
import { reportRoutes } from './modules/report/report.route';

const router = Router();

router.use('/questions', questionRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/reports', reportRoutes);

export const appRoutes = router;
