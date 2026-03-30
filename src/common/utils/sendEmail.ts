import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { EmailOptions } from '../interface/common.interface';

/**
 * Generic utility to send emails via SMTP.
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const host = process.env.SMTP_HOST;

  let htmlBody = options.html;
  let textBody = options.text;

  if (options.template) {
    const templatePath = path.join(__dirname, '..', 'templates', `${options.template}.hbs`);
    try {
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateSource);
      htmlBody = compiledTemplate(options.context || {});
      textBody = textBody || htmlBody.replace(/<[^>]*>?/gm, ''); // Simple fallback for text-only clients
    } catch (error) {
      console.error(`Email Template Error: Could not load template ${options.template}`, error);
    }
  }

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
    text: textBody || '',
    html: htmlBody,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email Dispatch Error:', error);
    throw error;
  }
};