import nodemailer from 'nodemailer';
import dns from 'dns';
import { env } from '../config/env';

// Force DNS lookup to prefer IPv4, preventing ENETUNREACH errors on IPv6-disabled container networks
dns.setDefaultResultOrder('ipv4first');

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER;
  const hasResendConfig = env.RESEND_API_KEY;

  if (hasSmtpConfig) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Make sure we don't send using onboarding@resend.dev on Gmail SMTP
    const fromAddress = process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('resend.dev')
      ? process.env.EMAIL_FROM
      : `"Disciplin" <${process.env.SMTP_USER}>`;

    const mailOptions = {
      from: fromAddress,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    };

    await transporter.sendMail(mailOptions);
    return;
  }

  if (hasResendConfig) {
    let fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    
    // Resend requires verified custom domains. Public domains (gmail, yahoo, etc.) cannot be verified and will throw a 403.
    // If the from address uses a public domain, automatically fallback to Resend's sandbox domain.
    const isPublicDomain = /@(gmail|yahoo|outlook|hotmail|icloud|mail)\.com/i.test(fromAddress);
    if (isPublicDomain) {
      fromAddress = '"Disciplin" <onboarding@resend.dev>';
    }
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || `<p>${options.message}</p>`,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let cleanMessage = errText;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.message) {
          cleanMessage = parsed.message;
        }
      } catch (_) {}
      throw new Error(cleanMessage);
    }
    return;
  }

  // Development fallback: Log the email to console for easy testing
  console.log('\n=================== EMAIL SENT (MOCK) ===================');
  console.log(`To:      ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body:    ${options.message}`);
  console.log('=========================================================\n');

  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Disciplin" <noreply@disciplin.app>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (e) {
    // Internet is offline or Ethereal fails: simply return (console print is sufficient)
    return;
  }
};
