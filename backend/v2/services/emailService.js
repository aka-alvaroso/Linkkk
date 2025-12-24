const nodemailer = require('nodemailer');
const config = require('../config/environment');

/**
 * Email Service
 * Provides email sending functionality using nodemailer
 */

// Create reusable transporter
let transporter = null;

/**
 * Initialize email transporter
 * @returns {Object} Nodemailer transporter
 */
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Check if email is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.warn('Email service not configured. Email notifications will be skipped.');
    return null;
  }

  const emailConfig = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };

  transporter = nodemailer.createTransport(emailConfig);

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email service configuration error:', error);
    } else {
      console.log('Email service ready');
    }
  });

  return transporter;
}

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} Send result
 */
async function sendEmail({ to, subject, text, html }) {
  const emailTransporter = getTransporter();

  if (!emailTransporter) {
    console.warn('Email not sent - service not configured');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Linkkk'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send waitlist notification to admin
 * @param {string} userEmail - User's email who joined the waitlist
 * @returns {Promise<Object>} Send result
 */
async function sendWaitlistNotification(userEmail) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const subject = 'New Waitlist Signup - Linkkk Premium';

  const text = `
New waitlist signup!

Email: ${userEmail}
Date: ${new Date().toLocaleString()}

This user is interested in Linkkk Premium features.
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">🎉 New Waitlist Signup!</h2>

      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p style="color: #666;">This user is interested in Linkkk Premium features.</p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

      <p style="color: #999; font-size: 12px;">
        Sent from Linkkk Waitlist System
      </p>
    </div>
  `.trim();

  return await sendEmail({
    to: adminEmail,
    subject,
    text,
    html,
  });
}

module.exports = {
  sendEmail,
  sendWaitlistNotification,
};
