// ─── /api/contact.js ──────────────────────────────────────────────
// Vercel Serverless Function (Node runtime)

const FROM_EMAIL = 'Portfolio System <onboarding@resend.dev>';
const ACCENT_COLOR = '#00F5FF'; // Cyan accent to match your frontend

// ─── UTILITIES ────────────────────────────────────────────────────

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const sanitizeInput = (str) => (typeof str === 'string' ? str.trim() : '');

// ─── VALIDATION ENGINE ────────────────────────────────────────────

const validatePayload = (data) => {
  const { formType, name, email, siteFeedback, message } = data;

  if (!name || !email || !formType) {
    return 'Name, Email, and Form Type are required.';
  }

  // Stricter email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return 'Please provide a valid email address.';
  }

  if (formType === 'feedback' && (!siteFeedback || siteFeedback.length < 5)) {
    return 'Feedback must be at least 5 characters long.';
  }

  if (formType === 'collab' && (!message || message.length < 10)) {
    return 'Message must be at least 10 characters long.';
  }

  // Name length validation to prevent massive spam strings
  if (name.length > 80) return 'Name is too long.';
  if (email.length > 100) return 'Email is too long.';

  return null; // No errors
};

// ─── EMAIL TEMPLATE GENERATOR ─────────────────────────────────────

const buildEmailTemplate = (data) => {
  const {
    formType, name, email, rating, siteFeedback,
    suggestions, company, role, inquiryType, message
  } = data;

  const subject = formType === 'feedback'
    ? `[Portfolio] 💡 New Feedback from ${name}`
    : `[Portfolio] 🚀 New Inquiry from ${name}`;

  const isFeedback = formType === 'feedback';
  
  // Clean, dark-mode inspired corporate HTML email layout
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              
              <tr>
                <td style="background-color: #080814; padding: 30px; text-align: center; border-bottom: 3px solid ${ACCENT_COLOR};">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">
                    ${isFeedback ? 'NEW PEER FEEDBACK' : 'NEW WORK INQUIRY'}
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 30px 30px 15px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-bottom: 10px;">
                        <span style="font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">From</span><br>
                        <span style="font-size: 16px; color: #27272a; font-weight: 500;">${escapeHtml(name)}</span>
                      </td>
                      <td style="padding-bottom: 10px; text-align: right;">
                        <span style="font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Email</span><br>
                        <a href="mailto:${escapeHtml(email)}" style="font-size: 16px; color: ${ACCENT_COLOR}; font-weight: 500; text-decoration: none;">${escapeHtml(email)}</a>
                      </td>
                    </tr>
                  </table>
                  <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;">
                </td>
              </tr>

              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  ${isFeedback ? `
                    <div style="margin-bottom: 20px;">
                      <span style="font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Rating</span><br>
                      <span style="font-size: 18px; color: #27272a; font-weight: 600;">${escapeHtml(rating || 'N/A')} / 5</span>
                    </div>
                    <div style="margin-bottom: 20px;">
                      <span style="font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Feedback</span><br>
                      <p style="font-size: 15px; color: #3f3f46; line-height: 1.6; margin-top: 5px; white-space: pre-wrap;">${escapeHtml(siteFeedback)}</p>
                    </div>
                    ${suggestions ? `
                      <div style="margin-bottom: 20px;">
                        <span style="font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Suggestions</span><br>
                        <p style="font-size: 15px; color: #3f3f46; line-height: 1.6; margin-top: 5px; white-space: pre-wrap;">${escapeHtml(suggestions)}</p>
                      </div>
                    ` : ''}
                  ` : `
                    <div style="margin-bottom: 20px;">
                      <span style="font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Company / Org</span><br>
                      <span style="font-size: 16px; color: #27272a; font-weight: 500;">${escapeHtml(company || 'Not provided')}</span>
                    </div>
                    <div style="margin-bottom: 20px;">
                      <span style="font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Role / Intent</span><br>
                      <span style="font-size: 16px; color: #27272a; font-weight: 500;">${escapeHtml(role || 'N/A')} &rarr; ${escapeHtml(inquiryType || 'N/A')}</span>
                    </div>
                    <div style="margin-bottom: 20px;">
                      <span style="font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Message</span><br>
                      <div style="background-color: #f4f4f5; padding: 15px; border-radius: 6px; margin-top: 8px;">
                        <p style="font-size: 15px; color: #3f3f46; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
                      </div>
                    </div>
                  `}
                </td>
              </tr>

              <tr>
                <td style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #e4e4e7;">
                  <span style="font-size: 12px; color: #a1a1aa;">
                    System Notification • Sent ${new Date().toUTCString()}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, html };
};

// ─── MAIN HANDLER ─────────────────────────────────────────────────

export default async function handler(req, res) {
  // 1. CORS Headers (Standardized)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = req.body || {};

    // 2. Honeypot Check (Instant silent rejection for bots)
    if (body.website) {
      console.warn('Honeypot triggered. Silently dropping request.');
      return res.status(200).json({ success: true, message: 'Message sent.' });
    }

    // 3. Clean and Extract Payload
    const sanitizedData = {
      formType: sanitizeInput(body.formType),
      name: sanitizeInput(body.name),
      email: sanitizeInput(body.email),
      rating: sanitizeInput(body.rating),
      siteFeedback: sanitizeInput(body.siteFeedback),
      suggestions: sanitizeInput(body.suggestions),
      company: sanitizeInput(body.company),
      role: sanitizeInput(body.role),
      inquiryType: sanitizeInput(body.inquiryType),
      message: sanitizeInput(body.message),
    };

    // 4. Run Strict Validation
    const validationError = validatePayload(sanitizedData);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    // 5. Check Environment Variables
    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    
    if (!apiKey || !toEmail) {
      console.error('CRITICAL: Missing RESEND_API_KEY or CONTACT_TO_EMAIL env vars');
      return res.status(500).json({ success: false, error: 'Server configuration error.' });
    }

    // 6. Build the Email
    const { subject, html } = buildEmailTemplate(sanitizedData);

    // 7. Dispatch via Resend API
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        reply_to: sanitizedData.email, 
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error(`Resend API Error [${resendRes.status}]:`, errText);
      return res.status(502).json({ success: false, error: 'Email provider failed to dispatch.' });
    }

    // 8. Success Response
    return res.status(200).json({ success: true, message: 'Message successfully dispatched.' });

  } catch (err) {
    console.error('Unhandled Server Error in Contact API:', err);
    return res.status(500).json({ success: false, error: 'Internal server error processing your request.' });
  }
}