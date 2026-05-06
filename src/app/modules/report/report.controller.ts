import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { prisma } from '../../utils/prisma';
import { reportService } from './report.service';

export const reportController = {
  download: catchAsync(async (req: Request, res: Response) => {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params?.assessmentId as string },
      include: { lead: true, result: true },
    });

    if (!assessment || !assessment.result) {
      throw Object.assign(new Error('Result not found'), { statusCode: 404 });
    }

    const pdfBuffer = await reportService.buildPdfBuffer(assessment?.lead, assessment.result);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="harmony-360-alignment-report.pdf"');
    res.send(pdfBuffer);
  }),
};
