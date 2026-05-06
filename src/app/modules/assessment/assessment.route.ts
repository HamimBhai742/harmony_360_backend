import { Router } from 'express';
import { assessmentController } from './assessment.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { answerSchema, startAssessmentSchema } from './assessment.validation';

const router = Router();

router.post('/start', validateRequest(startAssessmentSchema), assessmentController.start);
router.post('/:assessmentId/answer', validateRequest(answerSchema), assessmentController.answer);
router.post('/:assessmentId/complete', assessmentController.complete);
router.get('/:assessmentId/result', assessmentController.result);

export const assessmentRoutes = router;
