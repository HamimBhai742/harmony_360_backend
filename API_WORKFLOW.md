# Harmony 360 Backend Workflow Analysis

## 1. Lead capture
The first page collects:
- First name
- Last name
- Work email
- Company name
- Role/position
- Industry
- Main goal for assessment

Endpoint:
`POST /api/v1/assessments/start`

## 2. Question flow
The app loads dimensions and questions from the database.

Endpoint:
`GET /api/v1/questions`

The frontend can show one question at a time with previous/next navigation.

## 3. Answer saving
Each answer is saved/updated by assessment ID and question ID.

Endpoint:
`POST /api/v1/assessments/:assessmentId/answer`

Body:
```json
{
  "questionId": "QUESTION_ID",
  "selectedValue": "4"
}
```

## 4. Completion and scoring
When the user submits final answer, backend verifies all active questions are answered, calculates dimension scores, normalized score out of 80, final percentage, diagnostic band, tension text, bridge statement, and CTA.

Endpoint:
`POST /api/v1/assessments/:assessmentId/complete`

## 5. Result display
Frontend can show the generated result from:
`GET /api/v1/assessments/:assessmentId/result`

## 6. PDF generation
Backend generates a clean PDF report with contact info, scores, diagnostic interpretation, tension, and CTA.

Endpoint:
`GET /api/v1/reports/:assessmentId/pdf`

## 7. Email delivery
After completion, backend sends the generated PDF report to the lead email using SMTP/Nodemailer.

## 8. Diagnostic bands
- 0–31 / 0–39%: Brand Incongruence — Misaligned / Reactive
- 32–47 / 40–59%: Fragmented Alignment — Inconsistent / Siloed
- 48–63 / 60–79%: Developing Alignment — Defined but Uneven
- 64–80 / 80–100%: Strong Alignment — Consistent / Scalable
