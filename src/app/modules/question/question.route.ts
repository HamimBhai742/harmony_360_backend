import { Router } from 'express';
import { questionController } from './question.controller';

const router = Router();
router.get('/', questionController.list);

export const questionRoutes = router;
