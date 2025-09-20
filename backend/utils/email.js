const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Only create transporter if email credentials are properly configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email service not configured. Set EMAIL_USER and EMAIL_PASS environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, username) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('📧 Email service not configured, skipping OTP email');
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"ProdEase System" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset OTP - ProdEase',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔧 ProdEase</h1>
              <p>Manufacturing Management System</p>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${username},</p>
              <p>We received a request to reset your password for your ProdEase account. Use the OTP code below to proceed with resetting your password:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 14px;">This code expires in 10 minutes</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Never share this OTP with anyone</li>
                  <li>ProdEase staff will never ask for your OTP</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                </ul>
              </div>
              
              <p>If you have any questions or concerns, please contact your system administrator.</p>
              
              <p>Best regards,<br>The ProdEase Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} ProdEase Manufacturing Management System</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('📧 Email service not configured, skipping welcome email');
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"ProdEase System" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Welcome to ProdEase - Account Created Successfully',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ProdEase</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔧 Welcome to ProdEase!</h1>
              <p>Manufacturing Management System</p>
            </div>
            <div class="content">
              <h2>Account Created Successfully</h2>
              <p>Hello ${username},</p>
              <p>Welcome to ProdEase! Your account has been created successfully and you can now access our manufacturing management platform.</p>
              
              <div class="feature-list">
                <h3>🚀 What you can do with ProdEase:</h3>
                <ul>
                  <li>📋 Manage Manufacturing Orders</li>
                  <li>⚙️ Track Work Orders and Operations</li>
                  <li>📊 Monitor Bills of Materials (BOM)</li>
                  <li>🏭 Oversee Work Centers</li>
                  <li>📦 Track Stock and Inventory</li>
                  <li>📈 Generate Reports and Analytics</li>
                </ul>
              </div>
              
              <p>If you have any questions or need assistance getting started, please contact your system administrator.</p>
              
              <p>Best regards,<br>The ProdEase Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ProdEase Manufacturing Management System</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};
