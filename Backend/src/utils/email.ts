import nodemailer from 'nodemailer';
import dns from 'dns';

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

    // Sanitized From address (ensure we don't use onboarding@resend.dev on SMTP)
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

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Email service (SMTP) is not configured. Please set SMTP_HOST and SMTP_USER in your Render environment settings.');
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
