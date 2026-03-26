import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Generic utility to send emails via SMTP.
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.error('Email Dispatch Error: SMTP_HOST is not defined in environment variables.');
    throw new Error('Internal Server Error: Email configuration missing.');
  }

  const transporter = nodemailer.createTransport({
    host: host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'PickAm'}" <${process.env.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email Dispatch Error:', error);
    throw error;
  }
};