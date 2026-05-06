type Band = {
  min: number;
  max: number;
  scoreRange: string;
  percentageRange: string;
  diagnosis: string;
  maturityInterpretation: string;
  insight: string;
  tension: string;
  bridgeStatement: string;
};

export const diagnosticBands: Band[] = [
  {
    min: 0,
    max: 31,
    scoreRange: '0–31',
    percentageRange: '0–39%',
    diagnosis: 'Brand Incongruence',
    maturityInterpretation: 'Misaligned / Reactive',
    insight: 'Your organization is currently operating with significant misalignment across key areas of brand, customer experience, and internal operations. There is little consistency in how your brand is understood internally or delivered externally.',
    tension: 'Your organization is currently operating with significant misalignment across key areas of your brand, customer experience, and internal operations. There is little consistency in how your brand is understood internally or delivered externally.',
    bridgeStatement: 'A deeper diagnostic is required to uncover the root causes of these breakdowns and establish a path toward alignment. Uncover the root cause and upgrade to the Full Harmony 360 Diagnostic to identify the underlying drivers of misalignment and receive a structured action plan.',
  },
  {
    min: 32,
    max: 47,
    scoreRange: '32–47',
    percentageRange: '40–59%',
    diagnosis: 'Fragmented Alignment',
    maturityInterpretation: 'Inconsistent / Siloed',
    insight: 'Your organization shows early signs of alignment, but performance varies significantly across teams and touchpoints. Some areas are functioning well, while others are creating friction and inconsistency.',
    tension: 'This uneven execution creates unpredictability in both employee performance and customer experience — making it difficult to build trust and consistency at scale.',
    bridgeStatement: 'Identify where these breakdowns occur and why. Pinpoint where alignment breaks down and upgrade to the Full Harmony 360 Diagnostic to map the exact points of breakdown across your organization.',
  },
  {
    min: 48,
    max: 63,
    scoreRange: '48–63',
    percentageRange: '60–79%',
    diagnosis: 'Developing Alignment',
    maturityInterpretation: 'Defined but Uneven',
    insight: 'Your organization has established a foundation for alignment, with clear strengths in certain areas. However, inconsistencies in execution are limiting your ability to fully deliver a seamless and reliable experience.',
    tension: 'At this stage, the risk is not failure — but stagnation. Without targeted refinement, these gaps can prevent you from reaching higher levels of performance and differentiation.',
    bridgeStatement: 'Close the gaps limiting your performance. Upgrade to the Full Harmony 360 Diagnostic to identify the specific barriers preventing full alignment and unlock higher levels of consistency and performance.',
  },
  {
    min: 64,
    max: 80,
    scoreRange: '64–80',
    percentageRange: '80–100%',
    diagnosis: 'Strong Alignment',
    maturityInterpretation: 'Consistent / Scalable',
    insight: 'Your organization demonstrates strong alignment across brand, experience, and operations. Customers are likely receiving a consistent and reliable experience, supported by a solid internal foundation.',
    tension: 'Even strong systems can plateau. Without continuous optimization, small inefficiencies can compound and limit long-term scalability and competitive advantage.',
    bridgeStatement: 'A deeper diagnostic can help you fine-tune performance and identify opportunities to strengthen and sustain your alignment. Upgrade to the Full Harmony 360 Diagnostic to uncover hidden inefficiencies and optimize your organization for sustained high performance.',
  },
];

export const getDiagnosticBand = (normalizedScore: number) => {
  return diagnosticBands.find((band) => normalizedScore >= band.min && normalizedScore <= band.max) || diagnosticBands[0];
};


export const getPrimaryTension = (dimensionScores: Array<{ key: string; title: string; percentage: number }>) => {
  const lowest = [...dimensionScores].sort((a, b) => a.percentage - b.percentage)[0];
  const title = `Primary Tension - Driven by ${lowest.title}`;
  const body = `This uneven execution creates unpredictability in both employee performance and customer experience — making it difficult to build trust and consistency at scale.`;
  return { title, body };
};
