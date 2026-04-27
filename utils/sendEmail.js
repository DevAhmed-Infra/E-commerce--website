const nodemailer = require('nodemailer');

const emailConfig = require('../config/emailConfig');
const logger = require('../utils/logger');

/**
 * Singleton Design patter partial usage
 */
const transporter = nodemailer.createTransport({
  host: emailConfig.SMTP_HOST,
  port: Number(emailConfig.SMTP_PORT),
  secure: Number(emailConfig.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: emailConfig.SMTP_USER,
    pass: emailConfig.SMTP_PASS
  },
  pool: true, // Use pooled connections
  maxConnections: 5,
  maxMessages: 100
});

async function verifyEmailConnection() {
  try {
    await transporter.verify();
    logger.info('Email service connected successfully');
  } catch (err) {
    logger.error('Email service connection failed:', err);
    throw err;
  }
}

async function sendEmail({ to, subject, text, html, retries = 3 }) {
  if (!to || !subject) {
    const validationError = new Error('Email "to" and "subject" are required');
    logger.error('Email validation failed:', validationError);
    throw validationError;
  }

  const mailOptions = {
    from: `"${emailConfig.FROM_NAME}" <${emailConfig.FROM_EMAIL}>`,
    to,
    subject,
    text,
    html
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info('Email sent:', info.messageId);
      return info;
    } catch (error) {
      if (attempt === retries) throw error;
      logger.warn(`Email attempt ${attempt} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

module.exports = { sendEmail, verifyEmailConnection };
