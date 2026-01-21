const nodemailer = require('nodemailer');

// Email configuration using environment variables
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('⚠️ Email service not configured - SMTP_HOST, SMTP_USER, SMTP_PASS required');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ecity.com';
const FROM_NAME = process.env.FROM_NAME || 'E-City';

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} resetLink - Password reset URL with token
 * @param {string} userName - User's name for personalization
 */
const sendPasswordResetEmail = async (to, resetLink, userName = 'User') => {
  const transporter = getTransporter();
  if (!transporter) {
    console.error('Email service not configured - cannot send password reset email');
    return false;
  }

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Reset Your E-City Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">E-CITY</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Smart City Management</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #f1f5f9; margin: 0 0 20px 0; font-size: 22px;">Password Reset Request</h2>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hello ${userName},
                    </p>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      We received a request to reset your password. Click the button below to create a new password:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: bold;">Reset Password</a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                      This link will expire in <strong style="color: #f1f5f9;">1 hour</strong> for security reasons.
                    </p>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 15px 0 0 0;">
                      If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                    </p>
                    <hr style="border: none; border-top: 1px solid #334155; margin: 30px 0;">
                    <p style="color: #475569; font-size: 12px; margin: 0;">
                      If the button doesn't work, copy and paste this link into your browser:<br>
                      <a href="${resetLink}" style="color: #3b82f6; word-break: break-all;">${resetLink}</a>
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #0f172a; padding: 24px; text-align: center;">
                    <p style="color: #475569; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} E-City. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error.message);
    return false;
  }
};

/**
 * Send welcome email on successful login (async/non-blocking)
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 */
const sendWelcomeEmail = async (to, userName = 'User') => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('Email service not configured - skipping welcome email');
    return false;
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Welcome Back to E-City!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">E-CITY</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Smart City Management</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #f1f5f9; margin: 0 0 20px 0; font-size: 22px;">Welcome Back, ${userName}! 👋</h2>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      You've successfully logged into your E-City account. We're glad to have you back!
                    </p>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      If this wasn't you, please secure your account immediately by changing your password.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${clientUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: bold;">Go to Dashboard</a>
                        </td>
                      </tr>
                    </table>
                    <hr style="border: none; border-top: 1px solid #334155; margin: 30px 0;">
                    <p style="color: #475569; font-size: 12px; margin: 0;">
                      Login detected at: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #0f172a; padding: 24px; text-align: center;">
                    <p style="color: #475569; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} E-City. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
    return false;
  }
};

/**
 * Send welcome email in background (fire-and-forget)
 * This function is non-blocking and won't affect login response time
 */
const sendWelcomeEmailAsync = (to, userName) => {
  // Fire and forget - don't await
  setImmediate(() => {
    sendWelcomeEmail(to, userName).catch(err => {
      console.error('Background welcome email failed:', err.message);
    });
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendWelcomeEmailAsync
};
