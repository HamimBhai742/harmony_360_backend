import { Request, Response } from 'express';
import { prisma } from '../../utils/prisma';
import { catchAsync } from '../../utils/catchAsync';

export const questionController = {
  list: catchAsync(async (req: Request, res: Response) => {
    const dimensions = await prisma.dimension.findMany({
      orderBy: { order: 'asc' },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(200).json({ success: true, message: 'Questions retrieved successfully', data: dimensions });
  }),
};
