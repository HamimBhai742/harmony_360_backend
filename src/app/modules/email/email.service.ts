import nodemailer from 'nodemailer';
import { config } from '../../config';

export const emailService = {
  async sendAssessmentReport(params: { to: string; name: string; pdfBuffer: Buffer }) {
    if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
      console.warn('SMTP is not configured. Skipping email delivery.');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    await transporter.sendMail({
      from: config.smtp.from,
      to: params.to,
      subject: 'Your Harmony 360 Alignment Report',
      html: `
        <p>Hi ${params.name},</p>
        <p>Thank you for completing the Harmony 360 assessment.</p>
        <p>Your PDF report is attached with your scores, diagnostic interpretation, and suggested next steps.</p>
        <p>Best regards,<br/>Harmony 360 Team</p>
      `,
      attachments: [
        {
          filename: 'harmony-360-alignment-report.pdf',
          content: params.pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return true;
  },
};
