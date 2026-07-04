interface ResetPasswordEmailParams {
  name: string;
  resetUrl: string;
}

export const getResetPasswordEmail = ({ name, resetUrl }: ResetPasswordEmailParams) => {
  const subject = 'Reset your password - Disciplin 🔑';
  
  const text = `Hi ${name},\n\nYou are receiving this email because you (or someone else) requested a password reset for your Disciplin account. Please click the link below to choose a new password:\n\n${resetUrl}\n\nThis password reset link is valid for 15 minutes.\n\nIf you did not request this, you can safely ignore this email.\n\nStay focused,\nThe Disciplin Team`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border: 1px solid #e2e8f0;
          }
          .header {
            background-color: #10b981;
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.025em;
          }
          .content {
            padding: 40px 32px;
            color: #334155;
            line-height: 1.6;
          }
          .content h2 {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 16px;
          }
          .content p {
            margin-top: 0;
            margin-bottom: 24px;
            font-size: 15px;
          }
          .cta-container {
            text-align: center;
            margin: 32px 0;
          }
          .btn {
            background-color: #10b981;
            color: #ffffff !important;
            padding: 14px 28px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 750;
            font-size: 15px;
            display: inline-block;
            box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
            transition: background-color 0.2s;
          }
          .link-box {
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 16px;
            font-size: 13px;
            word-break: break-all;
            color: #3b82f6;
            margin-bottom: 32px;
          }
          .footer {
            background-color: #f8fafc;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
          }
          .footer p {
            margin: 0;
            font-size: 12px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div style="padding: 20px 10px; background-color: #f8fafc;">
          <div class="container">
            <div class="header">
              <h1>Disciplin 🎯</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hi ${name},</p>
              <p>You are receiving this email because you (or someone else) requested a password reset for your Disciplin account. Please click the button below to choose a new password. This link is valid for 15 minutes.</p>
              
              <div class="cta-container">
                <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
              </div>

              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <div class="link-box">
                <a href="${resetUrl}">${resetUrl}</a>
              </div>

              <p>If you did not request a password reset, you can safely ignore this email.</p>
              
              <p style="margin-bottom: 0;">Stay focused,<br><strong>The Disciplin Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Disciplin. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, text, html };
};
