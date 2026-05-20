import jwt from "jsonwebtoken";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const GOOGLE_TOKEN_AUDIENCE = "https://oauth2.googleapis.com/token";

function getSheetsConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID env var");
  }

  if (!serviceAccountEmail) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL env var");
  }

  if (!privateKeyRaw) {
    throw new Error("Missing GOOGLE_PRIVATE_KEY env var");
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  if (
    !serviceAccountEmail.includes("@") ||
    !serviceAccountEmail.endsWith(".iam.gserviceaccount.com")
  ) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL must be a service-account client_email, like xxx@xxx.iam.gserviceaccount.com",
    );
  }

  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY must be a service-account private key, starts with '-----BEGIN PRIVATE KEY-----'",
    );
  }

  return {
    spreadsheetId,
    serviceAccountEmail,
    privateKey,
  };
}

async function getAccessToken(config: ReturnType<typeof getSheetsConfig>) {
  const now = Math.floor(Date.now() / 1000);

  const assertion = jwt.sign(
    {
      scope: SCOPES.join(" "),
      aud: GOOGLE_TOKEN_AUDIENCE,
      iat: now,
      exp: now + 60 * 60,
    },
    config.privateKey,
    {
      algorithm: "RS256",
      issuer: config.serviceAccountEmail,
    },
  );

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const resp = await fetch(GOOGLE_TOKEN_AUDIENCE, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await resp.json()) as any;

  if (!resp.ok) {
    throw new Error(
      `Google OAuth token request failed (${resp.status}): ${JSON.stringify(
        data,
      )}`,
    );
  }

  if (!data?.access_token) {
    throw new Error("Google OAuth token response missing access_token");
  }

  return data.access_token as string;
}

function getDimensionScore(dimensionScores: any[] = [], key: string) {
  return dimensionScores.find((item) => item.key === key) || {};
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatPercent(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "";

  const num = Number(value);

  if (Number.isNaN(num)) return "";

  return `${num}%`;
}

export async function appendAssessmentToSheet(assessment: any) {
  const config = getSheetsConfig();
  const accessToken = await getAccessToken(config);

  const lead = assessment.lead || {};
  const result = assessment.result || {};
  const band = result.band || {};

  const brandClarity = getDimensionScore(
    result.dimensionScores,
    "brand_clarity",
  );

  const customerJourney = getDimensionScore(
    result.dimensionScores,
    "customer_journey",
  );

  const employeeEngagement = getDimensionScore(
    result.dimensionScores,
    "employee_engagement",
  );

  const internalProcesses = getDimensionScore(
    result.dimensionScores,
    "internal_processes",
  );

  /**
   * Column order must match your Google Sheet header:
   *
   * Submission ID
   * Lead ID
   * Status
   * Started At
   * Completed At
   * First Name
   * Last Name
   * Email
   * Company Name
   * Role
   * Industry
   * Assessment Goal
   * Raw Total
   * Max Total
   * Normalized Score
   * Final Percentage
   * Diagnosis
   * Maturity Interpretation
   * Score Range
   * Percentage Range
   * Primary Tension Title
   * Primary Tension Body
   * Customer Goal Title
   * Customer Goal Body
   * Insight
   * Tension
   * Bridge Statement
   * Brand Clarity Score
   * Brand Clarity Percentage
   * Customer Journey Score
   * Customer Journey Percentage
   * Employee Engagement Score
   * Employee Engagement Percentage
   * Internal Process Score
   * Internal Process Percentage
   */
  const row = [
    assessment.id || "",
    assessment.leadId || "",
    assessment.status || "",
    formatDateTime(assessment.startedAt),
    formatDateTime(assessment.completedAt),

    lead.firstName || "",
    lead.lastName || "",
    lead.email || "",
    lead.companyName || "",
    lead.role || "",
    lead.industry || "",
    lead.assessmentGoal || "",

    result.rawTotal ?? "",
    result.maxTotal ?? "",
    result.normalizedScore ?? "",
    formatPercent(result.finalPercentage),
    band.diagnosis || "",
    band.maturityInterpretation || "",
    band.scoreRange || "",
    band.percentageRange || "",

    result.primaryTensionTitle || "",
    result.primaryTensionBody || "",
    result.customerGoalTitle || "",
    result.customerGoalBody || "",
    band.insight || "",
    band.tension || "",
    band.bridgeStatement || "",

    brandClarity.rawScore ?? "",
    formatPercent(brandClarity.percentage),

    customerJourney.rawScore ?? "",
    formatPercent(customerJourney.percentage),

    employeeEngagement.rawScore ?? "",
    formatPercent(employeeEngagement.percentage),

    internalProcesses.rawScore ?? "",
    formatPercent(internalProcesses.percentage),
  ];

  const sheetName = process.env.GOOGLE_SHEET_NAME || "Sheet1";

  /**
   * A1 is safer for append.
   * Google Sheets will automatically append the full row to the next available row.
   */
  const range = `${sheetName}!A1`;

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      config.spreadsheetId,
    )}` +
    `/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [row],
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();

    console.error("Google Sheets append failed response:", text);

    throw new Error(
      `Google Sheets append failed (${resp.status}): ${text.slice(0, 1000)}`,
    );
  }

  const responseData = await resp.json();

  console.log("Assessment successfully appended to Google Sheet:", {
    spreadsheetId: config.spreadsheetId,
    sheetName,
    updatedRange: responseData?.updates?.updatedRange,
  });

  return true;
}