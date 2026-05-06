import { prisma } from './prisma';

const scaleOptions = [
  { label: '1. Inconsistent or unclear', value: '1', score: 1 },
  { label: '2. Loosely defined and rarely referenced', value: '2', score: 2 },
  { label: '3. Partially defined, applied in some areas', value: '3', score: 3 },
  { label: '4. Mostly clear and referenced regularly', value: '4', score: 4 },
  { label: '5. Crystal clear, documented and fully embedded', value: '5', score: 5 },
];

const yesNoPositiveOptions = [
  { label: 'Yes', value: 'yes', score: 5 },
  { label: 'No', value: 'no', score: 0 },
];

const yesNoNegativeOptions = [
  { label: 'Yes', value: 'yes', score: 0 },
  { label: 'No', value: 'no', score: 5 },
];

const dimensions = [
  {
    key: 'brand_clarity',
    title: 'Brand Clarity & Promise',
    order: 1,
    questions: [
      {
        title: 'On a scale of 1–5, how clearly is your brand promise defined internally?',
        options: scaleOptions,
      },
      {
        title: 'Can most employees confidently explain what makes your brand different?',
        options: yesNoPositiveOptions,
      },
    ],
  },
  {
    key: 'customer_journey',
    title: 'Customer Journey Consistency',
    order: 2,
    questions: [
      {
        title: 'How consistent is your customer experience across touchpoints?',
        options: scaleOptions,
      },
      {
        title: 'Do customers receive the same quality of service regardless of channel?',
        options: yesNoPositiveOptions,
      },
    ],
  },
  {
    key: 'employee_engagement',
    title: 'Employee & Brand Engagement',
    order: 3,
    questions: [
      {
        title: 'How well do employees understand your brand values?',
        options: scaleOptions,
      },
      {
        title: 'Do employees feel empowered to deliver great experiences?',
        options: scaleOptions,
      },
    ],
  },
  {
    key: 'internal_processes',
    title: 'Internal Process Alignment',
    order: 4,
    questions: [
      {
        title: 'How well do internal processes support your customer experience?',
        options: scaleOptions,
      },
      {
        title: 'Are there frequent breakdowns between departments?',
        options: yesNoNegativeOptions,
      },
    ],
  },
];

async function main() {
  await prisma.answer.deleteMany();
  await prisma.assessmentResult.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.question.deleteMany();
  await prisma.dimension.deleteMany();

  for (const dimension of dimensions) {
    const createdDimension = await prisma.dimension.create({
      data: {
        key: dimension.key,
        title: dimension.title,
        order: dimension.order,
      },
    });

    for (let i = 0; i < dimension.questions.length; i++) {
      await prisma.question.create({
        data: {
          dimensionId: createdDimension.id,
          title: dimension.questions[i].title,
          order: i + 1,
          options: dimension.questions[i].options,
        },
      });
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });