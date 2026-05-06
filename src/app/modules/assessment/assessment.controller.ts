import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { assessmentService } from './assessment.service';

export const assessmentController = {
  start: catchAsync(async (req: Request, res: Response) => {
    const data = await assessmentService.start(req.body);
    res.status(201).json({ success: true, message: 'Assessment started successfully', data });
  }),

  answer: catchAsync(async (req: Request, res: Response) => {
    const data = await assessmentService.saveAnswer(req.params.assessmentId as string , req.body);
    res.status(200).json({ success: true, message: 'Answer saved successfully', data });
  }),

  complete: catchAsync(async (req: Request, res: Response) => {
    const data = await assessmentService.complete(req.params.assessmentId as string);
    res.status(200).json({ success: true, message: 'Assessment completed successfully', data });
  }),

  result: catchAsync(async (req: Request, res: Response) => {
    const data = await assessmentService.getResult(req.params.assessmentId as string);
    res.status(200).json({ success: true, message: 'Assessment result retrieved successfully', data });
  }),
};
