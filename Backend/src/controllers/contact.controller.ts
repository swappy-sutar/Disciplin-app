import { Request, Response, NextFunction } from 'express';
import { sendEmail } from '../utils/email';

export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. Send support email to admin
    const supportEmail = process.env.SUPPORT_EMAIL || 'sutarswapnil322@gmail.com';
    const emailToAdmin = {
      email: supportEmail,
      subject: `[Contact Form] ${subject} - from ${name}`,
      message: `
You have received a new contact form submission:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
      html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Subject:</strong> ${subject}</p>
<br/>
<p><strong>Message:</strong></p>
<p style="white-space: pre-wrap; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">${message}</p>
      `,
    };

    await sendEmail(emailToAdmin);

    // 2. Send confirmation auto-reply email to the sender
    const confirmationEmail = {
      email,
      subject: `Thank you for contacting Disciplin!`,
      message: `
Hi ${name},

Thank you for reaching out to us. We have received your inquiry regarding "${subject}" and our team is reviewing it. We will get back to you as soon as possible.

Best regards,
The Disciplin Team
      `,
      html: `
<h3>Hi ${name},</h3>
<p>Thank you for reaching out to us. We have received your message regarding <strong>"${subject}"</strong>.</p>
<p>Our team is currently reviewing your inquiry and we will get back to you as soon as possible (usually within 24 hours).</p>
<br/>
<p>Best regards,<br/><strong>The Disciplin Team</strong></p>
      `,
    };

    await sendEmail(confirmationEmail);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
    });
  } catch (error) {
    next(error);
  }
};
