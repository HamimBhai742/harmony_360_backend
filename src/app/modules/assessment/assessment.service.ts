import { prisma } from "../../utils/prisma";
import { getDiagnosticBand, getPrimaryTension } from "./scoring";
import { reportService } from "../report/report.service";
import { emailService } from "../email/email.service";

type AssessmentItem = {
  category: string;
  score?: number;
  value?: number;
  answer?: string;
};

type AssessmentAnswer = {
  question: string;
  category: string;
  answer: string;
  score?: number;
};

export const assessmentService = {
  async start(payload: {
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    role: string;
    industry?: string;
    assessmentGoal?: string;
  }) {
    const lead = await prisma.lead.create({ data: payload });
    const assessment = await prisma.assessment.create({
      data: { leadId: lead.id },
    });
    return { lead, assessment };
  },

  async saveAnswer(
    assessmentId: string,
    payload: { questionId: string; selectedValue: string },
  ) {
    const question = await prisma.question.findUnique({
      where: { id: payload.questionId },
    });

    if (!question)
      throw Object.assign(new Error("Question not found"), { statusCode: 404 });

    const option = question.options.find(
      (item: any) => item?.value === payload?.selectedValue,
    );
    if (!option)
      throw Object.assign(new Error("Invalid answer option"), {
        statusCode: 400,
      });

    const answer = await prisma.answer.upsert({
      where: {
        assessmentId_questionId: {
          assessmentId,
          questionId: payload.questionId,
        },
      },
      update: {
        selectedValue: option.value,
        selectedLabel: option.label,
        score: option.score,
      },
      create: {
        assessmentId,
        questionId: payload.questionId,
        selectedValue: option.value,
        selectedLabel: option.label,
        score: option.score,
      },
    });

    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: "IN_PROGRESS" },
    });
    return answer;
  },

  async complete(assessmentId: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        lead: true,
        answers: {
          include: {
            question: {
              include: {
                dimension: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw Object.assign(new Error("Assessment not found"), {
        statusCode: 404,
      });
    }

    const totalQuestions = await prisma.question.count({
      where: { isActive: true },
    });

    if (assessment.answers.length < totalQuestions) {
      throw Object.assign(
        new Error(
          `Please answer all questions. Answered ${assessment.answers.length}/${totalQuestions}.`,
        ),
        { statusCode: 400 },
      );
    }

    const dimensionMap = new Map<
      string,
      {
        key: string;
        title: string;
        rawScore: number;
        maxScore: number;
      }
    >();

    assessment.answers.forEach((answer:any) => {
      const dimension = answer.question.dimension;

      const existing = dimensionMap.get(dimension.key) || {
        key: dimension.key,
        title: dimension.title,
        rawScore: 0,
        maxScore: 0,
      };

      existing.rawScore += answer.score;

      existing.maxScore += Math.max(
        ...((answer.question.options as any[]) || []).map(
          (option: any) => option.score,
        ),
      );

      dimensionMap.set(dimension.key, existing);
    });

    const dimensionScores = Array.from(dimensionMap.values()).map((item) => ({
      ...item,
      percentage: Math.round((item.rawScore / item.maxScore) * 100),
    }));

    const rawTotal = dimensionScores.reduce(
      (sum, item) => sum + item.rawScore,
      0,
    );
    const maxTotal = dimensionScores.reduce(
      (sum, item) => sum + item.maxScore,
      0,
    );

    const normalizedScore = Math.round((rawTotal / maxTotal) * 80);
    const finalPercentage = Math.round((normalizedScore / 80) * 100);

    const band = getDiagnosticBand(normalizedScore);
    const primaryTension = getPrimaryTension(dimensionScores);

    const customerGoalTitle = assessment.lead.assessmentGoal
      ? `Based on Your Goal: ${assessment.lead.assessmentGoal}`
      : null;

    const customerGoalBody = assessment.lead.assessmentGoal
      ? "Your selected goal helps determine which alignment gaps should be prioritized first."
      : null;

    const result = await prisma.assessmentResult.upsert({
      where: {
        assessmentId,
      },
      update: {
        rawTotal,
        maxTotal,
        normalizedScore,
        finalPercentage,

        dimensionScores: {
          set: dimensionScores,
        },

        band: {
          set: band,
        },

        primaryTensionTitle: primaryTension.title,
        primaryTensionBody: primaryTension.body,
        customerGoalTitle,
        customerGoalBody,
      },
      create: {
        assessmentId,
        rawTotal,
        maxTotal,
        normalizedScore,
        finalPercentage,

        dimensionScores: {
          set: dimensionScores,
        },

        band: {
          set: band,
        },

        primaryTensionTitle: primaryTension.title,
        primaryTensionBody: primaryTension.body,
        customerGoalTitle,
        customerGoalBody,
      },
    });

    await prisma.assessment.update({
      where: {
        id: assessmentId,
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    const pdfBuffer = await reportService.buildPdfBuffer(
      assessment.lead,
      result,
    );

    const emailSent = await emailService.sendAssessmentReport({
      to: assessment.lead.email,
      name: `${assessment.lead.firstName} ${assessment.lead.lastName}`,
      pdfBuffer,
    });

    if (emailSent) {
      await prisma.assessmentResult.update({
        where: {
          assessmentId,
        },
        data: {
          emailedAt: new Date(),
        },
      });
    }

    return {
      result,
      emailSent,
    };
  },

  async getResult(assessmentId: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        lead: true,
        result: true,
        answers: { include: { question: true } },
      },
    });
    if (!assessment)
      throw Object.assign(new Error("Assessment not found"), {
        statusCode: 404,
      });
    return assessment;
  },
};
