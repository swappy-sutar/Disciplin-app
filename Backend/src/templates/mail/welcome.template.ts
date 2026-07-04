interface WelcomeEmailParams {
  name: string;
  dashboardUrl: string;
}

export const getWelcomeEmail = ({ name, dashboardUrl }: WelcomeEmailParams) => {
  const subject = 'Welcome to Disciplin! 🚀 Let\'s build better habits';
  
  const text = `Hi ${name},\n\nWelcome to Disciplin! We're thrilled to have you join our community of disciplined, goal-oriented individuals.\n\nHere is what you can track with your new account:\n- 📅 Daily Timetable: Block and plan your schedule.\n- ⚡ Habits Tracker: Track daily routines and maintain streaks.\n- 🎯 Weekly Goals: Focus on short-term milestones.\n- 📚 Study Topics: Break down subjects into subtopics.\n- 💼 Job Applications: Track status and manage applications.\n\nGet started by visiting your dashboard:\n${dashboardUrl}\n\nStay focused,\nThe Disciplin Team`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Disciplin</title>
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
          .features-list {
            background-color: #f1f5f9;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            list-style-type: none;
            padding-left: 20px;
          }
          .features-list li {
            margin-bottom: 12px;
            font-size: 14px;
            font-weight: 500;
            color: #475569;
            position: relative;
          }
          .features-list li:last-child {
            margin-bottom: 0;
          }
          .cta-container {
            text-align: center;
            margin-bottom: 32px;
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
              <h2>Welcome, ${name}!</h2>
              <p>We're thrilled to have you join Disciplin. Our mission is to help you build consistency, track progress, and accomplish your goals daily.</p>
              
              <p>Here's a quick look at what you can start tracking today:</p>
              <ul class="features-list">
                <li>📅 <strong>Daily Timetable:</strong> Block time and design your ideal schedule.</li>
                <li>⚡ <strong>Habits Tracker:</strong> Log daily routines and watch your streaks grow.</li>
                <li>🎯 <strong>Weekly Goals:</strong> Stay laser-focused on short-term milestones.</li>
                <li>📚 <strong>Study Topics:</strong> Break down topics into organized subtopics.</li>
                <li>💼 <strong>Job Applications:</strong> Track status, logs, and interview pipelines.</li>
              </ul>

              <div class="cta-container">
                <a href="${dashboardUrl}" class="btn" target="_blank">Go to Dashboard</a>
              </div>

              <p>If you have any questions or feedback, feel free to reply directly to this email. We're here to support you!</p>
              
              <p style="margin-bottom: 0;">Stay focused,<br><strong>The Disciplin Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Disciplin. All rights reserved.</p>
              <p style="margin-top: 6px;">You received this email because you signed up for an account on Disciplin.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, text, html };
};
