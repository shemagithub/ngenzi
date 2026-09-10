import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpSecure =
  process.env.SMTP_SECURE === 'true' ||
  process.env.SMTP_SECURE === '1' ||
  smtpPort === 465;

let smtpReady = false;

/**
 * Outgoing mail via hosting SMTP (e.g. ngenzirealestate.com:465 SSL).
 * Bad credentials only disable email — they never crash the API.
 */
const createTransporter = () => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn(
        '⚠️  Email configuration incomplete. Set SMTP_USER and SMTP_PASS in .env'
      );
      return null;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'ngenzirealestate.com',
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
      },
    });

    // Soft verify — never dump full stack traces to stderr
    if (process.env.SMTP_SKIP_VERIFY !== 'true') {
      transporter.verify().then(
        () => {
          smtpReady = true;
          console.log(
            `✅ Email SMTP ready (${process.env.SMTP_HOST}:${smtpPort}, secure=${smtpSecure})`
          );
        },
        (error) => {
          smtpReady = false;
          console.warn(
            `⚠️  Email SMTP not ready (auth/mails skipped until SMTP_PASS is fixed): ${error?.message || error}`
          );
        }
      );
    } else {
      smtpReady = true;
    }

    return transporter;
  } catch (error) {
    console.warn('⚠️  Failed to create email transporter:', error.message);
    return null;
  }
};

const transporter = createTransporter();

/** Default From header: "NGENZI REALESTATE" <info@...> */
export const getDefaultFrom = () => {
  const address = process.env.EMAIL || process.env.SMTP_USER || 'info@ngenzirealestate.com';
  const name = process.env.EMAIL_FROM_NAME || 'NGENZI REALESTATE';
  return `"${name}" <${address}>`;
};

export const sendEmail = async (mailOptions) => {
  if (!transporter) {
    console.warn('⚠️  Email skipped: transporter not configured');
    return null;
  }

  try {
    const info = await transporter.sendMail({
      ...mailOptions,
      from: mailOptions.from || getDefaultFrom(),
    });
    smtpReady = true;
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    smtpReady = false;
    console.warn('⚠️  Email send failed:', error?.message || error);
    return null;
  }
};

export const checkEmailHealth = async () => {
  if (!transporter) {
    return { status: 'error', message: 'Transporter not configured' };
  }

  try {
    await transporter.verify();
    smtpReady = true;
    return { status: 'healthy', message: 'Email service is operational' };
  } catch (error) {
    smtpReady = false;
    return { status: 'error', message: error.message };
  }
};

export const isSmtpReady = () => smtpReady;

export default transporter;
