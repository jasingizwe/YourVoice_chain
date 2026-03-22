import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logError, logInfo } from './logger.js';

function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

/**
 * Send an email. Fails silently so it never breaks the main request flow.
 */
export async function sendMail({ to, subject, html }) {
  const transporter = createTransporter();

  if (!transporter) {
    logInfo('Email not sent — SMTP not configured', { to, subject });
    return;
  }

  try {
    await transporter.sendMail({
      from: `"YourVoice" <${env.SMTP_FROM || env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logInfo('Email sent', { to, subject });
  } catch (err) {
    logError('Failed to send email', err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Notify an authority that a survivor has granted them access to a case.
 */
export async function sendAccessGrantedEmail({ authorityEmail, survivorName, caseTitle, appUrl }) {
  const dashboardLink = `${appUrl}/dashboard/cases`;

  await sendMail({
    to: authorityEmail,
    subject: 'YourVoice — You have been granted access to a case',
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #f9c8d4; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 22px; color: #1a1a1a;">YourVoice</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #fbcfe8; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="margin-top: 0; font-size: 18px;">You have been granted access to a case</h2>
          <p style="color: #555; line-height: 1.6;">
            <strong>${survivorName || 'A survivor'}</strong> has granted you access to the case:
          </p>
          <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${caseTitle}</p>
          </div>
          <p style="color: #555; line-height: 1.6;">
            You can now view this case and its details in your dashboard.
          </p>
          <a href="${dashboardLink}"
             style="display: inline-block; margin-top: 8px; background: #c0394b; color: #ffffff;
                    text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600;">
            View Cases
          </a>
          <p style="margin-top: 32px; font-size: 12px; color: #999;">
            This email was sent by YourVoice. If you were not expecting this, please ignore it.
          </p>
        </div>
      </div>
    `,
  });
}
