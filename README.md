
## Dependencies

The project uses the following dependencies:

- `express`
- `cors`
- `helmet`
- `morgan`
- `dotenv`
- `jsonwebtoken`
- `nodemailer`
- `pdfkit`
- `prisma`
- `zod`

## Setup

To run the project locally, follow these steps:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env` and update the environment variables
4. Run `npm run prisma:generate` to generate Prisma client
5. Run `npm run prisma:push` to push Prisma schema to the database
6. Run `npm run seed` to seed the database
7. Run `npm run dev` to start the server

## API Endpoints

The API endpoints are as follows:

- `GET /api/v1/questions`: Returns a list of grouped questions
- `POST /api/v1/assessments/start`: Starts a new assessment
- `POST /api/v1/assessments/:assessmentId/answer`: Saves an answer for an assessment
- `POST /api/v1/assessments/:assessmentId/complete`: Completes an assessment
- `GET /api/v1/assessments/:assessmentId/result`: Retrieves the assessment result
- `GET /api/v1/reports/:assessmentId/pdf`: Downloads the assessment report as a PDF

## Contributing

Contributions are welcome! Please follow these guidelines when contributing:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the [MIT License](LICENSE).