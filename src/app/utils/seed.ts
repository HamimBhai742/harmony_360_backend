import { prisma } from './prisma';

const brandPromiseClarityOptions = [
  {
    label: '1. Not clear — our brand promise is not formally defined',
    value: '1',
    score: 1,
  },
  {
    label: '2. Limited clarity — some leaders understand it, but most employees do not',
    value: '2',
    score: 2,
  },
  {
    label: '3. Somewhat clear — it exists, but is not consistently communicated',
    value: '3',
    score: 3,
  },
  {
    label: '4. Mostly clear — employees generally understand the brand promise',
    value: '4',
    score: 4,
  },
  {
    label: '5. Very clear — the brand promise is clearly defined, documented, and understood across the organization',
    value: '5',
    score: 5,
  },
];

const customerExperienceConsistencyOptions = [
  {
    label: '1. Very inconsistent — customer experience varies greatly across touchpoints',
    value: '1',
    score: 1,
  },
  {
    label: '2. Limited consistency — some touchpoints feel aligned, but many do not',
    value: '2',
    score: 2,
  },
  {
    label: '3. Somewhat consistent — the experience is acceptable, but not always reliable',
    value: '3',
    score: 3,
  },
  {
    label: '4. Mostly consistent — customers usually receive a similar experience across touchpoints',
    value: '4',
    score: 4,
  },
  {
    label: '5. Highly consistent — customers receive a seamless and reliable experience across all touchpoints',
    value: '5',
    score: 5,
  },
];

const brandValuesUnderstandingOptions = [
  {
    label: '1. Not well — employees have little or no understanding of the brand values',
    value: '1',
    score: 1,
  },
  {
    label: '2. Limited — employees know some values, but do not fully understand them',
    value: '2',
    score: 2,
  },
  {
    label: '3. Partial — employees understand the values, but do not always apply them',
    value: '3',
    score: 3,
  },
  {
    label: '4. Strong — employees generally understand and apply the brand values',
    value: '4',
    score: 4,
  },
  {
    label: '5. Fully embedded — employees clearly understand, believe in, and consistently apply the brand values',
    value: '5',
    score: 5,
  },
];

const empoweredScaleOptions = [
  {
    label: '1. Not at all — employees must follow strict rules and rarely take initiative',
    value: '1',
    score: 1,
  },
  {
    label: '2. Limited — employees occasionally take initiative, but often hesitate or need approval',
    value: '2',
    score: 2,
  },
  {
    label: '3. Inconsistent — empowerment exists in some teams or situations, but not across the organization',
    value: '3',
    score: 3,
  },
  {
    label: '4. Mostly empowered — employees are generally confident making decisions to serve customers',
    value: '4',
    score: 4,
  },
  {
    label: '5. Fully empowered — employees consistently take ownership and act confidently to deliver great experiences',
    value: '5',
    score: 5,
  },
];

const processSupportOptions = [
  {
    label: '1. Not supportive — internal processes often make the customer experience harder',
    value: '1',
    score: 1,
  },
  {
    label: '2. Limited support — some processes help, but many create delays or confusion',
    value: '2',
    score: 2,
  },
  {
    label: '3. Partially supportive — processes support some customer needs, but not consistently',
    value: '3',
    score: 3,
  },
  {
    label: '4. Mostly supportive — internal processes generally help teams deliver a good customer experience',
    value: '4',
    score: 4,
  },
  {
    label: '5. Fully supportive — processes are clearly aligned to deliver a smooth and excellent customer experience',
    value: '5',
    score: 5,
  },
];

const yesNoPositiveOptions = [
  {
    label: 'Yes',
    value: 'yes',
    score: 5,
  },
  {
    label: 'No',
    value: 'no',
    score: 0,
  },
];

const yesNoNegativeOptions = [
  {
    label: 'Yes',
    value: 'yes',
    score: 0,
  },
  {
    label: 'No',
    value: 'no',
    score: 5,
  },
];

const dimensions = [
  {
    key: 'brand_clarity',
    title: 'Brand Clarity & Promise',
    order: 1,
    questions: [
      {
        title:
          'On a scale of 1–5, how clearly is your brand promise defined internally?',
        options: brandPromiseClarityOptions,
      },
      {
        title:
          'Can most employees confidently explain what makes your brand different?',
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
        options: customerExperienceConsistencyOptions,
      },
      {
        title:
          'Do customers receive the same quality of service regardless of channel?',
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
        options: brandValuesUnderstandingOptions,
      },
      {
        title: 'Do employees feel empowered to deliver great experiences?',
        options: empoweredScaleOptions,
      },
    ],
  },
  {
    key: 'internal_processes',
    title: 'Internal Process Alignment',
    order: 4,
    questions: [
      {
        title:
          'How well do internal processes support your customer experience?',
        options: processSupportOptions,
      },
      {
        title: 'Are there frequent breakdowns between departments?',
        options: yesNoNegativeOptions,
      },
    ],
  },
];

export async function seedQuestions() {
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