import dotenv from 'dotenv';
dotenv.config();
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { EmailOptions } from '../interface/common.interface';
import { emailConfig } from '../../config/email.config';
/**
 * Generic utility to send emails via SMTP.
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
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

  if (!emailConfig.host) {
    console.error('Email Dispatch Error: SMTP_HOST is not defined in environment variables.');
    throw new Error('Internal Server Error: Email configuration missing.');
  }

  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
  });

  const mailOptions = {
    from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
    to: options.to,
    subject: options.subject,
    text: textBody || '',
    html: htmlBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("send email to=>", options.to)
  } catch (error) {
    console.error('Email Dispatch Error:', error);
    throw error;
  }
};