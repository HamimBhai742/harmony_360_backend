import { z } from 'zod';

export const startAssessmentSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    companyName: z.string().min(1),
    role: z.string().min(1),
    industry: z.string().optional(),
    assessmentGoal: z.string().optional(),
  }),
});

export const answerSchema = z.object({
  body: z.object({
    questionId: z.string().min(1),
    selectedValue: z.string().min(1),
  }),
});
