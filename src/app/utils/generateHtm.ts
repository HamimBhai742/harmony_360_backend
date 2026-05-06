import { AssessmentResult, Lead } from "@prisma/client";

export function generateReportHtml(lead: Lead, result: AssessmentResult) {
  const band: any = result.band;
  const dimensionScores: any[] = result.dimensionScores as any[];

  const scoreOutOf100 = Math.round((result.normalizedScore / 80) * 100);

  // Rank-based colors:
  // lowest = red, 2nd = yellow, 3rd = blue, highest = green
  const rankColors = ["#ef4444", "#f59e0b", "#2563eb", "#16a34a"];

  const rankedScores = [...dimensionScores]
    .map((score, index) => ({
      ...score,
      originalIndex: index,
    }))
    .sort((a, b) => a.percentage - b.percentage);

  const colorMap: Record<number, string> = {};

  rankedScores.forEach((item, rank) => {
    colorMap[item.originalIndex] = rankColors[rank];
  });

  const strongest = [...dimensionScores].sort(
    (a, b) => b.percentage - a.percentage,
  )[0];

  const weakest = [...dimensionScores].sort(
    (a, b) => a.percentage - b.percentage,
  )[0];

  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      color: #222;
      background: #fff;
    }

    .page {
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      background: #fff;
    }

    .topbar {
      height: 48px;
      padding: 12px 34px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
    }

    .logo {
      font-size: 16px;
      font-weight: 600;
      color: #555;
    }

    .hero {
      background: #202020;
      color: white;
      padding: 34px 86px 28px;
    }

    .hero-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .hero h1 {
      font-family: Georgia, serif;
      font-size: 30px;
      line-height: 1.2;
      margin: 0;
      font-weight: 500;
    }

    .hero h1 span {
      font-style: italic;
      color: #cfcfcf;
    }

    .score {
      text-align: right;
      font-size: 14px;
    }

    .score strong {
      font-size: 34px;
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 18px;
      margin-top: 30px;
      font-size: 10px;
    }

    .meta label {
      display: block;
      color: #999;
      margin-bottom: 4px;
      font-size: 8px;
    }

    .section {
      padding: 30px 86px 0;
    }

    .eyebrow {
      font-size: 8px;
      color: #777;
      margin-bottom: 8px;
    }

    h2 {
      font-family: Georgia, serif;
      font-size: 20px;
      font-weight: 500;
      margin: 0 0 18px;
    }

    .score-card {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 24px 20px;
    }

    .dimension-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
    }

    .dimension-item {
      margin-bottom: 22px;
    }

    .dimension-top {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-bottom: 8px;
    }

    .bar-bg {
      height: 4px;
      background: #eee;
      border-radius: 10px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 10px;
    }

    .analytics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .analytics-card {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 18px;
      text-align: center;
      min-height: 70px;
    }

    .analytics-card strong {
      display: block;
      font-size: 22px;
      margin-bottom: 8px;
    }

    .analytics-card span {
      font-size: 8px;
      color: #666;
    }

    .quote-box {
      background: #f6f6f6;
      border-left: 2px solid #222;
      padding: 18px;
      font-style: italic;
      line-height: 1.5;
      font-size: 13px;
      margin: 12px 0 16px;
    }

    .small-text {
      font-size: 10px;
      line-height: 1.6;
      color: #555;
    }

    .two-card {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 18px;
    }

    .info-card {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 18px;
      min-height: 110px;
    }

    .info-card .green {
      color: #16a34a;
      font-size: 9px;
      margin-bottom: 14px;
    }

    .info-card .red {
      color: #ef4444;
      font-size: 9px;
      margin-bottom: 14px;
    }

    .info-card h3 {
      margin: 0 0 10px;
      font-size: 13px;
      font-weight: 500;
    }

    .dimension-detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .detail-card {
      border: 1px solid #ddd;
      padding: 18px;
      min-height: 190px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    }

    .detail-card h4 {
      margin: 0 0 10px;
      font-size: 12px;
      color: #111;
    }

    .detail-card .num {
      float: right;
      font-size: 18px;
    }

    .impact-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .impact-card {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 20px 14px;
      min-height: 105px;
    }

    .impact-card strong {
      font-size: 26px;
      display: block;
      color: #555;
      margin-bottom: 20px;
    }

    .recommendation {
      display: flex;
      background: #f5f5f5;
      margin-bottom: 8px;
    }

    .recommendation .number {
      width: 42px;
      background: #222;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .recommendation .content {
      padding: 14px;
      font-size: 10px;
    }

    .cta {
      margin-top: 34px;
      background: #193452;
      color: white;
      padding: 32px 54px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cta h2 {
      color: white;
      margin: 0;
      font-size: 24px;
    }

    .cta button {
      background: white;
      color: #193452;
      border: none;
      border-radius: 6px;
      padding: 12px 18px;
      font-weight: bold;
    }

    .detail-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>

<body>
  <div class="page">
    <div class="topbar">
      <div class="logo">Harmony 360</div>
      <div></div>
    </div>

    <div class="hero">
      <div class="hero-row">
        <h1>Brand & Culture<br/>Alignment <span>Snapshot</span></h1>

        <div class="score">
          <strong>${scoreOutOf100}</strong>/100<br/>
          <small>${result.finalPercentage}% Alignment Score</small>
        </div>
      </div>

      <div class="meta">
        <div><label>Name:</label>${lead.firstName} ${lead.lastName}</div>
        <div><label>Email:</label>${lead.email}</div>
        <div><label>Company:</label>${lead.companyName}</div>
        <div><label>Goal:</label>${lead.assessmentGoal || "N/A"}</div>
        <div><label>Role:</label>${lead.role}</div>
        <div><label>Date:</label>${date}</div>
      </div>
    </div>

    <div class="section">
      <div class="eyebrow">Score Summary Dashboard</div>
      <h2>Your Four Dimension Scores</h2>

      <div class="score-card">
        <div class="dimension-grid">
          ${dimensionScores
            .map((score, index) => {
              const displayScore = Math.round((score.percentage / 100) * 25);
              const color = colorMap[index];

              return `
                <div class="dimension-item">
                  <div class="dimension-top">
                    <span>${score.title}</span>
                    <span>${displayScore}<small>/25</small></span>
                  </div>
                  <div class="bar-bg">
                    <div class="bar-fill" style="width:${score.percentage}%; background:${color};"></div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="eyebrow">Data Analysis</div>
      <h2>What Your Numbers Reveal</h2>

      <div class="analytics">
        <div class="analytics-card">
          <strong style="color:#16a34a">${strongest.percentage}%</strong>
          <span>Strongest Area</span>
        </div>

        <div class="analytics-card">
          <strong style="color:#ef4444">${weakest.percentage}%</strong>
          <span>Weakest Area</span>
        </div>

        <div class="analytics-card">
          <strong>${strongest.percentage - weakest.percentage}</strong>
          <span>Point Spread /100</span>
        </div>

        <div class="analytics-card">
          <strong>${dimensionScores.filter((s) => s.percentage >= 60).length}<small>/4</small></strong>
          <span>Above Average</span>
        </div>
      </div>

      <p class="small-text">
        <strong>Score Distribution:</strong>
        Your strongest dimension is ${strongest.title} and your weakest is ${weakest.title}.
        This helps identify where alignment is strong and where execution needs improvement.
      </p>
    </div>

    <div class="section">
      <div class="eyebrow">What This Means</div>
      <h2>${band.diagnosis} · ${band.maturityInterpretation}</h2>

      <div class="quote-box">
        ${result.primaryTensionBody}
      </div>

      <p class="small-text">${band.insight}</p>
      <p class="small-text">Harmony 360 Lite identifies where alignment gaps exist. The Full Harmony 360 reveals why they exist — and how to fix them.</p>

      <div class="two-card">
        <div class="info-card">
          <div class="green">Where You're Strong</div>
          <h3>${strongest.title}</h3>
          <p class="small-text">
            Your strongest dimension is ${strongest.percentage}%. This area is contributing positively to your overall alignment.
          </p>
        </div>

        <div class="info-card">
          <div class="red">Where Alignment Breaks Down</div>
          <h3>${weakest.title}</h3>
          <p class="small-text">
            Your weakest dimension is ${weakest.percentage}%. This is the most important area to improve first.
          </p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="eyebrow">Industry Context · ${lead.industry || "General"}</div>
      <h2>${result.primaryTensionTitle}</h2>
      <div class="quote-box">${result.primaryTensionBody}</div>
    </div>

    ${
      result.customerGoalTitle && result.customerGoalBody
        ? `
    <div class="section">
      <div class="eyebrow">Industry Context · ${lead.industry || "General"}</div>
      <h2>${result.customerGoalTitle}</h2>
      <div class="quote-box">${result.customerGoalBody}</div>
    </div>
    `
        : ""
    }

    <div class="section">
      <div class="eyebrow">Key Alignment Insight Per Dimension</div>
      <h2>Where Each Dimension Stands</h2>

      <div class="dimension-detail-grid">
  ${dimensionScores
    .map((score, index) => {
      const displayScore = Math.round((score.percentage / 100) * 25);
      const color = colorMap[index];

      const bgColor =
        color === "#16a34a"
          ? "#ecfdf3"
          : color === "#2563eb"
            ? "#eff6ff"
            : color === "#f59e0b"
              ? "#fffbeb"
              : "#fef2f2";

      const insight =
        displayScore >= 20
          ? "This dimension shows strong alignment and reliable execution across the organization."
          : displayScore >= 14
            ? "This dimension has a developing foundation, but consistency still needs improvement."
            : displayScore >= 8
              ? "This dimension shows visible alignment gaps that may affect customer and employee experience."
              : "This dimension is currently a critical alignment risk and should be improved first.";

      const nextStep =
        displayScore >= 20
          ? "Maintain consistency and use this area as a model for other dimensions."
          : displayScore >= 14
            ? "Strengthen processes, ownership, and communication to improve consistency."
            : displayScore >= 8
              ? "Create clearer standards and reinforce expectations across teams."
              : "Prioritize this area immediately and remove the main blockers affecting execution.";

      return `
        <div class="detail-card" style="border-color:${color};">
          <div class="detail-card-header" style="border-top-color:${color}; background:${bgColor}; padding: 0.5rem;">
            <div class="detail-top-row">
              <div>
                <div class="eyebrow" style="color:${color};">Dimension 0${index + 1}</div>
                <h4 style="color:${color};">${score.title}</h4>
              </div>

              <div class="num" style="color:${color};">
                ${displayScore}<small>/25</small>
              </div>
            </div>
          </div>

          <div class="detail-card-body">
            <p class="small-text">
              ${insight}
            </p>

            <div class="detail-label">Operational Reality</div>
            <ul>
              <li>Current score: ${displayScore}/25</li>
              <li>Alignment percentage: ${score.percentage}%</li>
              <li>Priority level based on comparative dimension performance</li>
            </ul>

            <div class="detail-label">Next Step</div>
            <p class="small-text">
              ${nextStep}
            </p>
          </div>
        </div>
      `;
    })
    .join("")}
</div>
    </div>

    <div class="section">
      <div class="eyebrow">Why This Matters</div>
      <h2>Business Impact of Misalignment</h2>

      <div class="impact-grid">
        <div class="impact-card">
          <strong>01</strong>
          <p class="small-text">Inconsistent customer experiences across every touchpoint</p>
        </div>
        <div class="impact-card">
          <strong>02</strong>
          <p class="small-text">Reduced employee clarity and ownership of the brand</p>
        </div>
        <div class="impact-card">
          <strong>03</strong>
          <p class="small-text">Operational inefficiencies that compound over time</p>
        </div>
        <div class="impact-card">
          <strong>04</strong>
          <p class="small-text">Difficulty scaling your brand promise as you grow</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="eyebrow">What Needs To Happen Next</div>
      <h2>Recommendations</h2>

      <div class="recommendation">
        <div class="number">1</div>
        <div class="content">
          <strong>Clarify Expectations</strong><br/>
          Establish a single, clearly articulated brand definition and cascade it with leadership alignment.
        </div>
      </div>

      <div class="recommendation">
        <div class="number">2</div>
        <div class="content">
          <strong>Align Internal Execution</strong><br/>
          Connect every team’s daily operations to the brand promise through structured reinforcement.
        </div>
      </div>

      <div class="recommendation">
        <div class="number">3</div>
        <div class="content">
          <strong>Strengthen Consistency Across Touchpoints</strong><br/>
          Map the full customer journey and standardize experience delivery end-to-end.
        </div>
      </div>
    </div>

    <div class="cta">
      <div>
        <h2>Uncover the Root Cause Behind These Gaps</h2>
        <p class="small-text" style="color:#dbeafe">
          Upgrade to the Full Harmony 360 Diagnostic to gain deeper insights across all alignment areas.
        </p>
      </div>
      <button>Upgrade to Full Harmony 360</button>
    </div>
  </div>
</body>
</html>
`;
}
