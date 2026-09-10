/**
 * NGENZI REALESTATE — branded HTML email templates
 * Colors align with the public site (haven green + cream + accent gold).
 */

const SITE_URL = () =>
  (process.env.WEBSITE_URL || process.env.FRONTEND_URL || 'https://ngenzirealestate.com').replace(
    /\/$/,
    ''
  );

const CONTACT_EMAIL = () => process.env.EMAIL || 'info@ngenzirealestate.com';
const CONTACT_PHONE = () => process.env.COMPANY_PHONE || '+250 788 000 000';
const BRAND = 'NGENZI REALESTATE';

const statusStyles = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'confirmed') return { bg: '#dcfce7', color: '#166534', label: 'Confirmed' };
  if (s === 'cancelled') return { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' };
  return { bg: '#fef3c7', color: '#854d0e', label: 'Pending' };
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Shared email chrome */
const wrapEmail = ({ preheader = '', title, subtitle, bodyHtml }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | ${BRAND}</title>
</head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f5f0;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(18,38,32,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(160deg,#0a1612 0%,#1b3a2f 55%,#163029 100%);padding:36px 28px;text-align:center;">
              <div style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:12px;background:#c4a574;color:#0a1612;font-family:Georgia,serif;font-size:22px;font-weight:700;margin-bottom:14px;">N</div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c4a574;margin-bottom:10px;">${BRAND}</div>
              <h1 style="margin:0;font-size:26px;line-height:1.25;color:#ffffff;font-weight:600;">${escapeHtml(title)}</h1>
              ${subtitle ? `<p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:rgba(247,245,240,0.78);">${escapeHtml(subtitle)}</p>` : ''}
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 28px;font-family:Arial,Helvetica,sans-serif;color:#122620;font-size:15px;line-height:1.65;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Contact strip -->
          <tr>
            <td style="padding:0 28px 28px;font-family:Arial,Helvetica,sans-serif;">
              <div style="background:#f7f5f0;border:1px solid #e8e0d5;border-radius:12px;padding:18px 20px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#1b3a2f;letter-spacing:0.04em;text-transform:uppercase;">Need help?</p>
                <p style="margin:0;font-size:14px;color:#3d7a5f;line-height:1.6;">
                  <a href="mailto:${CONTACT_EMAIL()}" style="color:#1b3a2f;text-decoration:none;font-weight:600;">${CONTACT_EMAIL()}</a>
                  &nbsp;·&nbsp;
                  <a href="tel:${CONTACT_PHONE().replace(/\s/g, '')}" style="color:#1b3a2f;text-decoration:none;">${CONTACT_PHONE()}</a>
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#122620;padding:22px 28px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#c4a574;">${BRAND}</p>
              <p style="margin:0 0 12px;font-size:13px;color:rgba(247,245,240,0.65);">Premium properties, plots &amp; cars across Rwanda</p>
              <p style="margin:0;">
                <a href="${SITE_URL()}" style="color:#c4a574;text-decoration:none;font-size:13px;margin:0 8px;">Website</a>
                <a href="${SITE_URL()}/properties" style="color:#c4a574;text-decoration:none;font-size:13px;margin:0 8px;">Properties</a>
                <a href="${SITE_URL()}/contact" style="color:#c4a574;text-decoration:none;font-size:13px;margin:0 8px;">Contact</a>
              </p>
              <p style="margin:14px 0 0;font-size:11px;color:rgba(247,245,240,0.4);">© ${new Date().getFullYear()} ${BRAND}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const ctaButton = (href, label) => `
  <div style="text-align:center;margin:28px 0 8px;">
    <a href="${href}" style="display:inline-block;padding:14px 28px;background:#1b3a2f;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.04em;">
      ${escapeHtml(label)}
    </a>
  </div>
`;

const detailCard = (rows) => `
  <div style="background:#f7f5f0;border-left:4px solid #c4a574;border-radius:10px;padding:18px 20px;margin:18px 0;">
    ${rows
      .filter(Boolean)
      .map(
        ([label, value]) => `
      <p style="margin:0 0 10px;font-size:14px;color:#122620;">
        <span style="display:inline-block;min-width:88px;color:#3d7a5f;font-weight:600;">${label}</span>
        ${value}
      </p>`
      )
      .join('')}
  </div>
`;

const bulletList = (items, tone = 'neutral') => {
  const tones = {
    success: { bg: '#dcfce7', color: '#166534', mark: '✓' },
    warn: { bg: '#fef3c7', color: '#854d0e', mark: '!' },
    danger: { bg: '#fee2e2', color: '#991b1b', mark: 'i' },
    neutral: { bg: '#e8e0d5', color: '#1b3a2f', mark: '•' },
  };
  const t = tones[tone] || tones.neutral;
  return `
    <ul style="list-style:none;padding:0;margin:12px 0 0;">
      ${items
        .map(
          (item) => `
        <li style="margin:0 0 10px;display:flex;align-items:flex-start;font-size:14px;color:#122620;">
          <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:${t.bg};color:${t.color};text-align:center;line-height:22px;font-size:12px;font-weight:700;margin-right:10px;flex-shrink:0;">${t.mark}</span>
          <span>${item}</span>
        </li>`
        )
        .join('')}
    </ul>
  `;
};

const propertyTitle = (appointment) =>
  escapeHtml(appointment?.propertyId?.title || appointment?.property?.title || 'Property viewing');

export const getSchedulingEmailTemplate = (appointment, date, time, notes) =>
  wrapEmail({
    preheader: `Your viewing request for ${propertyTitle(appointment)} is pending confirmation.`,
    title: 'Viewing Scheduled',
    subtitle: 'We received your appointment request',
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:16px;color:#122620;">Muraho,</p>
      <p style="margin:0 0 16px;color:#3d7a5f;">Thank you for booking a property viewing with ${BRAND}. Here are your request details:</p>
      ${detailCard([
        ['Property', propertyTitle(appointment)],
        ['Date', escapeHtml(formatDate(date))],
        ['Time', escapeHtml(time)],
        notes ? ['Notes', escapeHtml(notes)] : null,
        [
          'Status',
          `<span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:#fef3c7;color:#854d0e;">Pending</span>`,
        ],
      ])}
      <p style="margin:18px 0 6px;font-size:15px;font-weight:700;color:#1b3a2f;">What happens next?</p>
      ${bulletList(
        [
          'Our team will review and confirm your appointment shortly.',
          'You will receive another email once it is confirmed or updated.',
        ],
        'warn'
      )}
      ${ctaButton(`${SITE_URL()}/properties`, 'Browse more properties')}
    `,
  });

export const getEmailTemplate = (appointment, status) => {
  const style = statusStyles(status);
  const next =
    String(status).toLowerCase() === 'confirmed'
      ? {
          tone: 'success',
          items: [
            'Arrive about 10 minutes before your scheduled time.',
            'Bring a valid ID for the viewing.',
            'Our agent will meet you at the property.',
          ],
        }
      : String(status).toLowerCase() === 'cancelled'
        ? {
            tone: 'danger',
            items: [
              'This viewing has been cancelled.',
              'You can schedule another viewing anytime from our website.',
            ],
          }
        : {
            tone: 'warn',
            items: ['We will confirm your appointment shortly.'],
          };

  return wrapEmail({
    preheader: `Your appointment is now ${style.label.toLowerCase()}.`,
    title: `Appointment ${style.label}`,
    subtitle: 'Property viewing update',
    bodyHtml: `
      <p style="margin:0 0 16px;color:#3d7a5f;">Your viewing appointment status has been updated.</p>
      ${detailCard([
        ['Property', propertyTitle(appointment)],
        ['Date', escapeHtml(formatDate(appointment.date))],
        ['Time', escapeHtml(appointment.time)],
        [
          'Status',
          `<span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:${style.bg};color:${style.color};">${style.label}</span>`,
        ],
      ])}
      <p style="margin:18px 0 6px;font-size:15px;font-weight:700;color:#1b3a2f;">What's next?</p>
      ${bulletList(next.items, next.tone)}
      ${ctaButton(`${SITE_URL()}/contact`, 'Contact our team')}
    `,
  });
};

export const getNewsletterTemplate = (email) =>
  wrapEmail({
    preheader: `Welcome to the ${BRAND} newsletter.`,
    title: 'You are subscribed',
    subtitle: 'Property insights for Rwanda',
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:16px;color:#122620;">
        Hello <strong style="color:#1b3a2f;">${escapeHtml(email)}</strong>,
      </p>
      <p style="margin:0 0 16px;color:#3d7a5f;">
        Thank you for joining the ${BRAND} community. You will receive curated listings, market notes, and investment opportunities across Rwanda.
      </p>
      ${bulletList(
        [
          'Fresh property, plot, and car listings',
          'Kigali &amp; regional market updates',
          'Exclusive offers from our agents',
        ],
        'success'
      )}
      ${ctaButton(`${SITE_URL()}/properties`, 'Explore listings')}
      <p style="margin:20px 0 0;font-size:13px;color:#5d977d;">
        Tip: add <a href="mailto:${CONTACT_EMAIL()}" style="color:#1b3a2f;font-weight:600;text-decoration:none;">${CONTACT_EMAIL()}</a> to your contacts so our emails land in your inbox.
      </p>
    `,
  });

export const getWelcomeTemplate = (name) =>
  wrapEmail({
    preheader: `Welcome to ${BRAND} — your account is ready.`,
    title: 'Welcome aboard',
    subtitle: 'Your account is ready',
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:16px;color:#122620;">
        Muraho <strong style="color:#1b3a2f;">${escapeHtml(name)}</strong>,
      </p>
      <p style="margin:0 0 16px;color:#3d7a5f;">
        Your ${BRAND} account has been created. Start browsing verified properties, land plots, and cars across Rwanda.
      </p>
      ${bulletList(
        [
          'Browse and filter premium listings',
          'Save favourites and book viewings',
          'Get updates from our advisors',
        ],
        'success'
      )}
      ${ctaButton(`${SITE_URL()}/properties`, 'Start exploring')}
    `,
  });

export const getPasswordResetTemplate = (resetUrl) =>
  wrapEmail({
    preheader: 'Reset your NGENZI REALESTATE password. This link expires soon.',
    title: 'Reset your password',
    subtitle: 'Account security',
    bodyHtml: `
      <p style="margin:0 0 16px;color:#3d7a5f;">
        We received a request to reset the password for your ${BRAND} account. This link expires in <strong>10 minutes</strong>.
      </p>
      ${ctaButton(resetUrl, 'Reset password')}
      <div style="background:#fef3c7;border-left:4px solid #c4a574;border-radius:10px;padding:16px 18px;margin:22px 0 0;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#854d0e;">Security notice</p>
        ${bulletList(
          [
            'If you did not request this, you can safely ignore this email.',
            'Never share this link or your password with anyone.',
          ],
          'warn'
        )}
      </div>
      <p style="margin:18px 0 0;font-size:12px;color:#5d977d;word-break:break-all;">
        Button not working? Paste this URL into your browser:<br />
        <a href="${resetUrl}" style="color:#1b3a2f;">${escapeHtml(resetUrl)}</a>
      </p>
    `,
  });
