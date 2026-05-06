# Harmony 360 Backend

Backend for a web-based assessment workflow: lead capture, step-by-step questionnaire, custom scoring, result interpretation, PDF report generation, and email delivery.

## Stack
Node.js, Express, TypeScript, MongoDB, Prisma, Zod, PDFKit, Nodemailer.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

## Main workflow
1. Frontend calls `GET /api/v1/questions` to load grouped questions.
2. Frontend calls `POST /api/v1/assessments/start` with lead/contact information.
3. Frontend calls `POST /api/v1/assessments/:assessmentId/answer` for each answer.
4. Frontend calls `POST /api/v1/assessments/:assessmentId/complete` when all answers are done.
5. Backend calculates dimensions, overall score, diagnostic band, tensions, bridge statement/CTA.
6. Backend stores result, generates PDF, and emails the report to the user.
7. Frontend can call `GET /api/v1/assessments/:assessmentId/result` to show result page.
8. Frontend can call `GET /api/v1/reports/:assessmentId/pdf` to download PDF.

## API base
`http://localhost:5000/api/v1`
