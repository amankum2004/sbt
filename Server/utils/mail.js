const axios = require('axios');
const { formatPhoneForSms, normalizePhone } = require('./phone');

// Brevo API configuration
const BREVO_API_KEY = (
  process.env.BREVO_SMS_API_KEY ||
  process.env.BREVO_API_KEY ||
  process.env.BREVO_API ||
  ''
).trim();
const BREVO_SENDER_EMAIL = process.env.BREVO_EMAIL;
const BREVO_SENDER_NAME = 'SalonHub';
const BREVO_SMS_SENDER = (process.env.BREVO_SMS_SENDER || 'SalonHub').trim().slice(0, 11);
const TWILIO_ACCOUNT_SID = (process.env.TWILIO_ACCOUNT_SID || '').trim();
const TWILIO_AUTH_TOKEN = (process.env.TWILIO_AUTH_TOKEN || '').trim();
const TWILIO_FROM_NUMBER = (
  process.env.TWILIO_FROM_NUMBER ||
  process.env.TWILIO_PHONE_NUMBER ||
  ''
).trim();
const TWILIO_MESSAGING_SERVICE_SID = (process.env.TWILIO_MESSAGING_SERVICE_SID || '').trim();
const Email = 'salonhub.business@gmail.com';
const ADMIN_NOTIFICATION_EMAIL = (
  process.env.ADMIN_NOTIFICATION_EMAIL ||
  'salonhub.business@gmail.com'
).trim().toLowerCase();
const DEFAULT_PUBLIC_FRONTEND_URL = 'https://www.salonhub.co.in';
const configuredFrontendUrl = (process.env.FRONTEND_URL || DEFAULT_PUBLIC_FRONTEND_URL).trim();
const normalizedConfiguredFrontendUrl = configuredFrontendUrl.replace(/\/+$/, '');
const isLocalOrPrivateFrontendUrl =
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.)/i.test(normalizedConfiguredFrontendUrl);

const FRONTEND_BASE_URL = isLocalOrPrivateFrontendUrl
  ? DEFAULT_PUBLIC_FRONTEND_URL
  : normalizedConfiguredFrontendUrl;

const CURRENT_YEAR = new Date().getFullYear();

const normalizeTwilioFromNumber = (value = '') => {
  const trimmedValue = String(value || '').trim();
  if (!trimmedValue) return '';

  if (/^\+\d{8,15}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const digits = trimmedValue.replace(/\D/g, '');
  if (digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }

  return trimmedValue;
};

const resolveTwilioSender = (feature = 'Twilio SMS') => {
  const fromNumber = normalizeTwilioFromNumber(TWILIO_FROM_NUMBER);
  const messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
  const hasValidMessagingServiceSid = /^MG[a-zA-Z0-9]{32}$/.test(messagingServiceSid);
  const hasConfiguredMessagingServiceSid = Boolean(messagingServiceSid);
  const hasValidFromNumber = /^\+\d{8,15}$/.test(fromNumber);

  if (hasValidMessagingServiceSid) {
    return { type: 'messagingService', value: messagingServiceSid };
  }

  if (hasConfiguredMessagingServiceSid) {
    const sidPrefix = messagingServiceSid.slice(0, 2) || 'unknown';
    const validationMessage =
      `TWILIO_MESSAGING_SERVICE_SID is invalid for ${feature}. Twilio Messaging Service SIDs must start with "MG", but the configured value starts with "${sidPrefix}".`;

    if (hasValidFromNumber) {
      console.warn(`⚠️ ${validationMessage} Falling back to TWILIO_FROM_NUMBER.`);
      return { type: 'from', value: fromNumber };
    }

    throw new Error(`${validationMessage} Clear it or replace it with a valid "MG..." SID.`);
  }

  if (hasValidFromNumber) {
    return { type: 'from', value: fromNumber };
  }

  if (fromNumber) {
    throw new Error(
      `TWILIO_FROM_NUMBER is invalid for ${feature}. Use E.164 format, for example "+15551234567".`
    );
  }

  throw new Error(
    `Missing Twilio sender for ${feature}. Set TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID.`
  );
};

const assertBrevoApiKey = (feature = 'Brevo API') => {
  if (!BREVO_API_KEY) {
    throw new Error(
      `Missing Brevo API key for ${feature}. Set BREVO_SMS_API_KEY or BREVO_API_KEY with a Brevo API key that starts with "xkeysib-".`
    );
  }

  if (BREVO_API_KEY.startsWith('xsmtpsib-')) {
    throw new Error(
      `Invalid Brevo key for ${feature}. The configured key starts with "xsmtpsib-", which is an SMTP key. Use a Brevo API key from Settings > SMTP & API that starts with "xkeysib-".`
    );
  }

  if (!BREVO_API_KEY.startsWith('xkeysib-')) {
    console.warn(
      `⚠️ Brevo key format looks unusual for ${feature}. Expected a key that starts with "xkeysib-".`
    );
  }

  return BREVO_API_KEY;
};

const assertTwilioConfig = (feature = 'Twilio SMS') => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error(
      `Missing Twilio credentials for ${feature}. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.`
    );
  }
  resolveTwilioSender(feature);

  return {
    accountSid: TWILIO_ACCOUNT_SID,
    authToken: TWILIO_AUTH_TOKEN,
  };
};

const formatSmsDateTime = (dateValue) => {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return '';

  const datePart = parsedDate.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const timePart = parsedDate.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${datePart}, ${timePart}`;
};

const summarizeSlotsForSms = (selectedTimeSlots = []) => {
  const slots = Array.isArray(selectedTimeSlots) ? selectedTimeSlots : [];
  if (!slots.length) return 'schedule not available';

  const labels = slots
    .map((slot) => formatSmsDateTime(slot?.showtimeDate || slot?.date))
    .filter(Boolean);

  if (!labels.length) return 'schedule not available';
  if (labels.length === 1) return labels[0];

  return `${labels[0]} (+${labels.length - 1} more)`;
};

const buildTwilioMessageBody = (lines = []) =>
  lines
    .map((line) => String(line || '').trim())
    .filter(Boolean)
    .join('\n');

const sendTwilioSms = async ({ to, body, feature = 'Twilio SMS' }) => {
  const normalizedPhone = normalizePhone(to);
  const smsRecipient = formatPhoneForSms(normalizedPhone);

  if (!normalizedPhone || !smsRecipient) {
    throw new Error(`Valid phone number is required for ${feature}`);
  }

  const { accountSid, authToken } = assertTwilioConfig(feature);
  const senderConfig = resolveTwilioSender(feature);
  const messagePayload = new URLSearchParams({
    To: smsRecipient,
    Body: body,
  });

  if (senderConfig.type === 'messagingService') {
    messagePayload.set('MessagingServiceSid', senderConfig.value);
  } else {
    messagePayload.set('From', senderConfig.value);
  }

  console.log(`📱 Sending ${feature} to: ${normalizedPhone}`);

  try {
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      messagePayload.toString(),
      {
        auth: {
          username: accountSid,
          password: authToken,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log(`✅ ${feature} sent successfully via Twilio`);
    return response.data;
  } catch (error) {
    const twilioMessage =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message;

    console.error(`❌ Failed to send ${feature} via Twilio:`, error.response?.data || error.message);

    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(
        `Twilio rejected the ${feature} request. Please verify TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and your sender configuration.`
      );
    }

    throw new Error(twilioMessage || `Failed to send ${feature}`);
  }
};

const withSalonHubLogo = (htmlContent = '', options = {}) => {
  const {
    accent = '#0ea5e9',
    background = 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 65%, #fff7ed 100%)',
    footerText = `Need help? Contact us at ${Email} • © ${CURRENT_YEAR} SalonHub`,
  } = options;

  return `
    <div style="margin: 0; padding: 30px 12px; background: ${background};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
          <td align="center">
            <div style="max-width: 700px; margin: 0 auto;">
              <div style="height: 4px; width: 140px; margin: 0 auto 14px auto; border-radius: 999px; background: ${accent};"></div>
              ${htmlContent}
              <div style="margin-top: 14px; text-align: center; color: #64748b; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 12px; line-height: 1.65;">
                ${footerText}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatIndianDateTime = (dateValue) => {
  const parsedDate = new Date(dateValue || Date.now());
  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const buildDashboardLink = (path = '/admin') => {
  if (!path.startsWith('/')) {
    return `${FRONTEND_BASE_URL}/${path}`;
  }
  return `${FRONTEND_BASE_URL}${path}`;
};

const sendAdminAlertEmail = async ({
  subject,
  title,
  intro,
  details = [],
  accent = '#0ea5e9',
  dashboardPath = '/admin',
  footerText = `Admin alert from SalonHub • © ${CURRENT_YEAR} SalonHub`,
}) => {
  const sanitizedDetails = Array.isArray(details)
    ? details.filter((detail) => detail && detail.label)
    : [];

  const detailRowsHtml = sanitizedDetails
    .map((detail) => {
      const label = escapeHtml(detail.label);
      const value = escapeHtml(detail.value ?? '-');
      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; width: 38%; color: #334155; font-weight: 700; vertical-align: top;">
            ${label}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #0f172a; line-height: 1.55; word-break: break-word;">
            ${value}
          </td>
        </tr>
      `;
    })
    .join('');

  const detailText = sanitizedDetails
    .map((detail) => `${detail.label}: ${detail.value ?? '-'}`)
    .join('\n');

  const dashboardUrl = buildDashboardLink(dashboardPath);

  const emailData = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL,
    },
    to: [
      {
        email: ADMIN_NOTIFICATION_EMAIL,
        name: 'SalonHub Admin',
      },
    ],
    subject,
    htmlContent: withSalonHubLogo(
      `
      <div style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #dbeafe; border-radius: 18px; overflow: hidden; background: #ffffff;">
        <div style="padding: 22px; background: linear-gradient(135deg, ${accent} 0%, #0f172a 100%); color: #ffffff;">
          <p style="margin: 0; font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; opacity: 0.9;">Admin Notification</p>
          <h2 style="margin: 8px 0 0 0; font-size: 24px; line-height: 1.35;">${escapeHtml(title)}</h2>
        </div>
        <div style="padding: 22px;">
          <p style="margin: 0 0 16px 0; color: #475569; line-height: 1.65;">
            ${escapeHtml(intro)}
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <tbody>
              ${detailRowsHtml || `
                <tr>
                  <td style="padding: 12px; color: #334155;">No additional details available.</td>
                </tr>
              `}
            </tbody>
          </table>
          <div style="margin-top: 18px;">
            <a href="${dashboardUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 10px; font-weight: 700;">
              Open Admin Dashboard
            </a>
          </div>
        </div>
      </div>
      `,
      {
        accent,
        background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 72%, #ffffff 100%)',
        footerText,
      }
    ),
    textContent: `${title}\n\n${intro}\n\n${detailText}\n\nAdmin dashboard: ${dashboardUrl}`,
  };

  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    console.log(`✅ Admin alert email sent: ${subject}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send admin alert email:', error.response?.data || error.message);
    return null;
  }
};

const sendAdminContactNotification = async (contact = {}) => {
  const contactName = (contact.name || '').trim() || '-';
  const contactPhone = (contact.phone || '').trim() || '-';
  const contactEmail = (contact.email || '').trim() || '-';
  const contactMessage = (contact.message || '').trim() || '-';

  return sendAdminAlertEmail({
    subject: 'New Contact Message Received - SalonHub',
    title: 'New Contact Form Submission',
    intro: 'A new contact message was submitted by a user on the Contact page.',
    accent: '#0284c7',
    dashboardPath: '/admin/contacts',
    details: [
      { label: 'Name', value: contactName },
      { label: 'Phone', value: contactPhone },
      { label: 'Email', value: contactEmail },
      { label: 'Message', value: contactMessage },
      { label: 'Submitted At (IST)', value: formatIndianDateTime(contact.createdAt || new Date()) },
    ],
    footerText: `Contact inbox update for SalonHub admin • © ${CURRENT_YEAR} SalonHub`,
  });
};

const sendAdminDonationNotification = async (donation = {}) => {
  const donorName = (donation.donorName || donation.name || '').trim() || '-';
  const donorPhone = (donation.donorPhone || donation.phone || '').trim() || '-';
  const donorEmail = (donation.donorEmail || donation.email || '').trim() || '-';
  const donationAmount = Number(donation.amount);
  const amountLabel = Number.isFinite(donationAmount) ? `₹${donationAmount.toFixed(2)}` : '-';
  const donationMessage = (donation.message || '').trim() || '-';
  const paymentId = donation.payment_id || '-';
  const orderId = donation.order_id || '-';

  return sendAdminAlertEmail({
    subject: 'New Donation Received - SalonHub',
    title: 'Donation Payment Completed',
    intro: 'A successful donation has been recorded in SalonHub.',
    accent: '#16a34a',
    dashboardPath: '/admin/donations',
    details: [
      { label: 'Donor Name', value: donorName },
      { label: 'Donor Mobile', value: donorPhone },
      { label: 'Donor Email', value: donorEmail },
      { label: 'Amount', value: amountLabel },
      { label: 'Message', value: donationMessage },
      { label: 'Payment ID', value: paymentId },
      { label: 'Order ID', value: orderId },
      { label: 'Donated At (IST)', value: formatIndianDateTime(donation.donatedAt || donation.createdAt || new Date()) },
    ],
    footerText: `Donation alert for SalonHub admin • © ${CURRENT_YEAR} SalonHub`,
  });
};

const sendAdminPendingShopNotification = async (shop = {}) => {
  const shopName = (shop.shopname || '').trim() || '-';
  const ownerName = (shop.name || '').trim() || '-';
  const ownerEmail = (shop.email || '').trim() || '-';
  const ownerPhone = (shop.phone || '').trim() || '-';
  const locationText =
    [
      shop.street,
      shop.city,
      shop.district,
      shop.state,
      shop.pin,
    ]
      .map((value) => (value || '').toString().trim())
      .filter(Boolean)
      .join(', ') || '-';

  const latitude = Number(shop.lat);
  const longitude = Number(shop.lng);
  const coordinateText =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? `${latitude}, ${longitude}`
      : '-';

  return sendAdminAlertEmail({
    subject: 'New Shop Registration Pending Approval - SalonHub',
    title: 'New Shop Approval Request',
    intro: 'A new shop owner registration requires admin review and approval.',
    accent: '#f59e0b',
    dashboardPath: '/admin/requests',
    details: [
      { label: 'Shop Name', value: shopName },
      { label: 'Owner Name', value: ownerName },
      { label: 'Owner Email', value: ownerEmail },
      { label: 'Owner Phone', value: ownerPhone },
      { label: 'Address', value: locationText },
      { label: 'Coordinates', value: coordinateText },
      { label: 'Coordinate Source', value: shop.coordinatesSource || '-' },
      { label: 'Pending Since (IST)', value: formatIndianDateTime(shop.createdAt || new Date()) },
      { label: 'Shop ID', value: shop._id ? String(shop._id) : '-' },
    ],
    footerText: `Pending approval queue alert • © ${CURRENT_YEAR} SalonHub`,
  });
};

// ==========================================
// OTP Email Function (Brevo API)
// ==========================================
const mailOtp = async (otp, email, subject = 'OTP Verification') => {
  console.log(`📧 Sending OTP to: ${email}`);
  
  const emailData = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL
    },
    to: [
      {
        email: email,
        name: email.split('@')[0] // Use username as name
      }
    ],
    subject: subject,
    htmlContent: withSalonHubLogo(`
      <div style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 18px; background: #ffffff;">
        <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white;">
          <h1 style="margin: 0;">SalonHub</h1>
          <p style="margin: 5px 0 0 0;">Your Beauty & Wellness Partner</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; text-align: center;">OTP Verification</h2>
          <p style="color: #666; text-align: center;">Use the following OTP to verify your account:</p>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 25px 0; border-radius: 8px; border: 2px dashed #667eea;">
            ${otp}
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center;">
            This OTP is valid for 10 minutes. Do not share it with anyone.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            If you didn't request this OTP, please ignore this email.
          </p>
        </div>
      </div>
    `, {
      accent: '#7c3aed',
      background: 'linear-gradient(180deg, #f5f3ff 0%, #eff6ff 70%, #ffffff 100%)',
      footerText: `Secure verification email from SalonHub • © ${CURRENT_YEAR} SalonHub`,
    }),
    textContent: `Your OTP is: ${otp}. This OTP is valid for 10 minutes. Do not share it with anyone.`
  };

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      emailData,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log('✅ OTP email sent successfully via Brevo API');
    console.log('📨 Message ID:', response.data.messageId);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send OTP email via Brevo API:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid Brevo API key. Please check your API key.');
    } else if (error.response?.status === 402) {
      throw new Error('Payment required. Please check your Brevo account balance.');
    } else if (error.response?.status === 403) {
      throw new Error('Access forbidden. Please check your Brevo account permissions.');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else {
      throw new Error(`Brevo API Error: ${error.response?.data?.message || error.message}`);
    }
  }
};

const sendOtpSms = async (otp, phone) => {
  return sendTwilioSms({
    to: phone,
    body: `${otp} is your SalonHub verification code. It is valid for 10 minutes.`,
    feature: 'OTP SMS',
  });
};

const sendConfirmationSms = async (customerPhone, customerName, shopName, location, selectedTimeSlots) => {
  if (!customerPhone) {
    console.log('Skipping booking confirmation SMS because customer phone is unavailable.');
    return null;
  }

  const slotSummary = summarizeSlotsForSms(selectedTimeSlots);
  const smsBody = buildTwilioMessageBody([
    `Hi ${customerName || 'Customer'}, your SalonHub booking is confirmed.`,
    `Salon: ${shopName}`,
    `When: ${slotSummary}`,
    location ? `Location: ${location}` : '',
    'Please arrive 5-10 minutes early.',
  ]);

  return sendTwilioSms({
    to: customerPhone,
    body: smsBody,
    feature: 'booking confirmation SMS',
  });
};

const sendPaymentSuccessSms = async (
  customerPhone,
  customerName,
  shopName,
  location,
  selectedTimeSlots,
  totalAmount
) => {
  if (!customerPhone) {
    console.log('Skipping payment success SMS because customer phone is unavailable.');
    return null;
  }

  const slotSummary = summarizeSlotsForSms(selectedTimeSlots);
  const amountText = Number.isFinite(Number(totalAmount)) ? `Amount: Rs. ${Number(totalAmount).toFixed(0)}` : '';

  const smsBody = buildTwilioMessageBody([
    `Hi ${customerName || 'Customer'}, payment received and your SalonHub booking is confirmed.`,
    `Salon: ${shopName}`,
    `When: ${slotSummary}`,
    amountText,
    location ? `Location: ${location}` : '',
  ]);

  return sendTwilioSms({
    to: customerPhone,
    body: smsBody,
    feature: 'payment success SMS',
  });
};

const sendShopStatusSms = async (customerPhone, customerName, shopName, newStatus, appointmentDate) => {
  if (!customerPhone) {
    console.log('Skipping shop status SMS because customer phone is unavailable.');
    return null;
  }

  const appointmentText = appointmentDate
    ? `Upcoming appointment: ${formatSmsDateTime(appointmentDate)}`
    : 'You have an upcoming appointment at this salon.';

  const smsBody = buildTwilioMessageBody([
    `Hi ${customerName || 'Customer'}, status update from SalonHub.`,
    `${shopName} is currently ${newStatus}.`,
    appointmentText,
    'Please check your dashboard before visiting.',
  ]);

  return sendTwilioSms({
    to: customerPhone,
    body: smsBody,
    feature: 'shop status SMS',
  });
};

const sendCancellationSms = async (customerPhone, customerName, shopName, location, appointmentDetails) => {
  if (!customerPhone) {
    console.log('Skipping cancellation SMS because customer phone is unavailable.');
    return null;
  }

  const slotSummary = summarizeSlotsForSms(
    Array.isArray(appointmentDetails?.showtimes)
      ? appointmentDetails.showtimes.map((showtime) => ({ showtimeDate: showtime.date }))
      : []
  );

  const smsBody = buildTwilioMessageBody([
    `Hi ${customerName || 'Customer'}, your SalonHub appointment has been cancelled.`,
    `Salon: ${shopName}`,
    `When: ${slotSummary}`,
    location ? `Location: ${location}` : '',
    'The time slot is now released.',
  ]);

  return sendTwilioSms({
    to: customerPhone,
    body: smsBody,
    feature: 'cancellation SMS',
  });
};

const sendShopOwnerCancellationSms = async (
  shopOwnerPhone,
  shopName,
  customerName,
  customerPhone,
  appointmentDetails
) => {
  if (!shopOwnerPhone) {
    console.log('Skipping shop owner cancellation SMS because owner phone is unavailable.');
    return null;
  }

  const slotSummary = summarizeSlotsForSms(
    Array.isArray(appointmentDetails?.showtimes)
      ? appointmentDetails.showtimes.map((showtime) => ({ showtimeDate: showtime.date }))
      : []
  );

  const smsBody = buildTwilioMessageBody([
    `SalonHub alert for ${shopName}.`,
    `${customerName || 'A customer'} cancelled an appointment.`,
    customerPhone ? `Customer phone: ${formatPhoneForSms(customerPhone)}` : '',
    `When: ${slotSummary}`,
    'The slot is now available for booking.',
  ]);

  return sendTwilioSms({
    to: shopOwnerPhone,
    body: smsBody,
    feature: 'shop owner cancellation SMS',
  });
};

// ==========================================
// Appointment Booking Confirmation Email
// ==========================================
const sendConfirmationEmail = async (customerEmail, customerName, shopName, location, selectedTimeSlots) => {
  if (!customerEmail) {
    console.log("Skipping booking confirmation email because customer email is unavailable.");
    return null;
  }
  console.log("📧 Sending booking confirmation to:", customerEmail);
  
  // Format the time slots properly
  const selectedTimeSlotHTML = selectedTimeSlots && selectedTimeSlots.length > 0
    ? selectedTimeSlots.map(slot => {
      // Parse the date string
        const dateObj = new Date(slot.showtimeDate);
        
        // Debug log to see what we're working with
        console.log('Email - Raw date string:', slot.showtimeDate);
        console.log('Email - Date object:', dateObj);
        console.log('Email - UTC:', dateObj.toUTCString());
        console.log('Email - Local:', dateObj.toLocaleString());
        
        // Format for Indian timezone (IST)
        const options = {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        };
        
        const dateStr = dateObj.toLocaleDateString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        const timeStr = dateObj.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        return `
          <li style="margin-bottom: 8px;">
            📅 Date: ${dateStr}<br>
            ⏰ Time: ${timeStr}
          </li>
        `;
      }).join('')
    : "<li>No time slot selected</li>";

    //   `
    //     <li style="margin-bottom: 8px;">
    //       📅 Date: ${new Date(slot.showtimeDate).toLocaleDateString('en-IN')}<br>
    //       ⏰ Time: ${new Date(slot.showtimeDate).toLocaleTimeString('en-US', {
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         hour12: true
    //       })}
    //     </li>
    //   `).join('')
    // : "<li>No time slot selected</li>";

  const emailData = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL
    },
    to: [
      {
        email: customerEmail,
        name: customerName
      }
    ],
    subject: 'Appointment Booking Confirmation - SalonHub',
    htmlContent: withSalonHubLogo(`
      <div style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 18px; background: #ffffff;">
        <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white;">
          <h1 style="margin: 0;">SalonHub</h1>
          <p style="margin: 5px 0 0 0;">Booking Confirmation</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Hello ${customerName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Your booking has been successfully received! Here are your appointment details:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 Appointment Details</h3>
            <p><strong>🏪 Shop Name:</strong> ${shopName}</p>
            <p><strong>📍 Location:</strong> ${location}</p>
            <p><strong>📅 Selected Time Slots:</strong></p>
            <ul style="color: #666;">
              ${selectedTimeSlotHTML}
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for choosing SalonHub! We look forward to serving you.
          </p>
          
          <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0066cc; font-size: 14px;">
              💡 <strong>Reminder:</strong> Please arrive 5-10 minutes before your scheduled time.
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            Need help? Contact us at salonhub.business@gmail.com
          </p>
        </div>
      </div>
    `, {
      accent: '#0284c7',
      background: 'linear-gradient(180deg, #ecfeff 0%, #eff6ff 70%, #ffffff 100%)',
      footerText: `Manage your booking anytime from SalonHub dashboard • © ${CURRENT_YEAR} SalonHub`,
    })
  };

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      emailData,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Booking confirmation email sent to:', customerEmail);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send booking confirmation email:', error.response?.data || error.message);
    return null;
  }
};

// ==========================================
// Payment Success Email
// ==========================================
const sendPaymentSuccessEmail = async (customerEmail, customerName, shopName, location, selectedTimeSlot) => {
  if (!customerEmail) {
    console.log("Skipping payment success email because customer email is unavailable.");
    return null;
  }
  console.log("📧 Sending payment success email to:", customerEmail);

  const emailData = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL
    },
    to: [
      {
        email: customerEmail,
        name: customerName
      }
    ],
    subject: 'Payment Successful - Salon Booking Confirmation',
    htmlContent: withSalonHubLogo(`
      <div style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 18px; background: #ffffff;">
        <div style="text-align: center; background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white;">
          <h1 style="margin: 0;">✅ Payment Successful</h1>
          <p style="margin: 5px 0 0 0;">SalonHub Booking Confirmed</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Hello ${customerName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Your payment has been successfully processed! Your booking is now confirmed.
          </p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
            <h3 style="color: #333; margin-top: 0;">🎉 Booking Confirmed</h3>
            <p><strong>🏪 Shop:</strong> ${shopName}</p>
            <p><strong>📍 Location:</strong> ${location}</p>
            <p><strong>📅 Date:</strong> ${new Date(selectedTimeSlot.showtimeDate).toLocaleDateString('en-IN')}</p>
            <p><strong>⏰ Time:</strong> ${new Date(selectedTimeSlot.showtimeDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}</p>
          </div>
          
          <div style="background: #d1fae5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-weight: bold;">
              ✅ Your appointment is confirmed and payment is received!
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            Thank you for choosing SalonHub! We look forward to serving you.
          </p>
        </div>
      </div>
    `, {
      accent: '#059669',
      background: 'linear-gradient(180deg, #ecfdf5 0%, #f0f9ff 75%, #ffffff 100%)',
      footerText: `Payment receipt generated by SalonHub • © ${CURRENT_YEAR} SalonHub`,
    })
  };

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      emailData,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Payment success email sent to:', customerEmail);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send payment success email:', error.response?.data || error.message);
    return null;
  }
};

// ==========================================
// Donation Confirmation Email
// ==========================================
const sendDonationConfirmationEmail = async (name, email, amount, message) => {
  console.log(`📧 Sending donation confirmation to: ${email}`);

  const emailData = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL
    },
    to: [
      {
        email: email,
        name: name
      }
    ],
    subject: 'Thank You for Your Environmental Donation 🌱',
    htmlContent: withSalonHubLogo(`
      <div style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Thank You for Your Donation!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Together we're building a greener future</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #065f46; margin-bottom: 20px;">Dear ${name},</h2>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
            We are incredibly grateful for your generous donation of <strong>₹${amount}</strong> 
            towards our environmental initiatives.
          </p>
          
          ${message ? `
          <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #10B981; margin: 20px 0;">
            <p style="color: #374151; margin: 0; font-style: italic;">"${message}"</p>
          </div>
          ` : ''}
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
            Your contribution will help us:
          </p>
          
          <ul style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            <li>🌳 Plant trees in deforested areas</li>
            <li>♻️ Support waste management programs</li>
            <li>💧 Provide clean water solutions</li>
            <li>📚 Educate communities about sustainability</li>
          </ul>
          
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <p style="color: #065f46; margin: 0; font-weight: bold;">
              100% of your donation goes directly to environmental projects.
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            We'll keep you updated on the impact of your donation. Thank you for being a part of 
            this important mission!
          </p>
        </div>
        
        <div style="background: #374151; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">
            With gratitude,<br>
            <strong>The Environmental Initiative Team</strong>
          </p>
        </div>
      </div>
    `, {
      accent: '#16a34a',
      background: 'linear-gradient(180deg, #f0fdf4 0%, #ecfeff 75%, #ffffff 100%)',
      footerText: `Together for a greener tomorrow • © ${CURRENT_YEAR} SalonHub`,
    })
  };

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      emailData,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log(`✅ Donation confirmation email sent to ${email}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send donation email:', error.response?.data || error.message);
    return null;
  }
};

// ==========================================
// Test Email Function
// ==========================================
const testEmailService = async (testEmail = 'test@example.com') => {
  console.log('🧪 Testing email service...');
  
  try {
    // Test OTP email
    await mailOtp('123456', testEmail, 'Test OTP - SalonHub');
    console.log('✅ Email service test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
    return false;
  }
};

// ==========================================
// Verify Brevo API Key
// ==========================================
const verifyBrevoApiKey = async () => {
  try {
    const brevoApiKey = assertBrevoApiKey('Brevo account verification');
    const response = await axios.get(
      'https://api.brevo.com/v3/account',
      {
        headers: {
          'api-key': brevoApiKey,
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );
    
    console.log('✅ Brevo API key verified successfully');
    console.log('📧 Account:', response.data.email);
    console.log('🏢 Company:', response.data.company);
    console.log('📊 Plan:', response.data.plan?.[0]?.type);
    console.log('📱 SMS Sender:', BREVO_SMS_SENDER || '(not set)');
    return true;
  } catch (error) {
    console.error('❌ Brevo API key verification failed:');
    console.error('Error:', error.response?.data || error.message);
    return false;
  }
};

const verifyTwilioConfig = async () => {
  try {
    if (!TWILIO_ACCOUNT_SID && !TWILIO_AUTH_TOKEN && !TWILIO_FROM_NUMBER && !TWILIO_MESSAGING_SERVICE_SID) {
      console.log('ℹ️ Twilio SMS is not configured; skipping Twilio verification.');
      return false;
    }

    const { accountSid, authToken } = assertTwilioConfig('Twilio account verification');
    const senderConfig = resolveTwilioSender('Twilio account verification');
    const response = await axios.get(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      {
        auth: {
          username: accountSid,
          password: authToken,
        },
        headers: {
          Accept: 'application/json',
        },
        timeout: 5000,
      }
    );

    console.log('✅ Twilio credentials verified successfully');
    console.log('📱 Twilio Account:', response.data.friendly_name || response.data.sid);
    console.log(
      '📨 Twilio Sender:',
      senderConfig.value || '(not set)'
    );
    return true;
  } catch (error) {
    console.error('❌ Twilio configuration verification failed:');
    console.error('Error:', error.response?.data || error.message);
    return false;
  }
};

// ==========================================
// Shop Status Change Notification Email
// ==========================================
const sendShopStatusNotification = async (customerEmail, customerName, shopName, newStatus, appointmentDate) => {
  if (!customerEmail) {
    console.log("Skipping shop status email because customer email is unavailable.");
    return null;
  }
  console.log(`📧 Sending shop status notification to: ${customerEmail}`);

  const statusConfig = {
    open: {
      color: '#10B981',
      icon: '✅',
      title: 'Shop is Now Open',
      message: 'is now open and ready to serve you!'
    },
    closed: {
      color: '#EF4444',
      icon: '❌',
      title: 'Shop is Temporarily Closed',
      message: 'is temporarily closed. We apologize for any inconvenience.'
    },
    break: {
      color: '#F59E0B',
      icon: '⏸️',
      title: 'Shop is on Break',
      message: 'is currently on a break. We will be back soon!'
    }
  };

  const config = statusConfig[newStatus] || statusConfig.closed;

  const emailData = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL
    },
    to: [
      {
        email: customerEmail,
        name: customerName
      }
    ],
    subject: `${config.icon} Shop Status Update - ${shopName}`,
    htmlContent: withSalonHubLogo(`
      <div style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 18px; background: #ffffff;">
        <div style="text-align: center; background: linear-gradient(135deg, ${config.color} 0%, ${config.color}99 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white;">
          <h1 style="margin: 0;">${config.icon} ${config.title}</h1>
          <p style="margin: 5px 0 0 0;">SalonHub Status Update</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Hello ${customerName},</h2>
          <p style="color: #666; line-height: 1.6;">
            This is to inform you that <strong>${shopName}</strong> ${config.message}
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${config.color};">
            <h3 style="color: #333; margin-top: 0;">📋 Your Upcoming Appointment</h3>
            ${appointmentDate ? `
              <p><strong>📅 Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-IN')}</p>
              <p><strong>⏰ Time:</strong> ${new Date(appointmentDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}</p>
            ` : '<p>You have an upcoming appointment at this shop.</p>'}
          </div>
          
          <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0066cc; font-size: 14px;">
              💡 <strong>Note:</strong> You can check the current shop status anytime in your appointment details.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for choosing SalonHub! We appreciate your understanding.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            Need to reschedule? Contact the shop directly or visit your dashboard.
          </p>
        </div>
      </div>
    `, {
      accent: config.color,
      background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 75%, #ffffff 100%)',
      footerText: `Real-time status update from SalonHub • © ${CURRENT_YEAR} SalonHub`,
    })
  };

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      emailData,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log(`✅ Shop status notification sent to: ${customerEmail}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send shop status notification:', error.response?.data || error.message);
    return null;
  }
};

// ==========================================
// Appointment Cancellation Email
// ==========================================
// ==========================================
// Appointment Cancellation Email
// ==========================================
const sendCancellationEmail = async (customerEmail, customerName, shopName, location, appointmentDetails) => {
  if (!customerEmail) {
    console.log("Skipping cancellation email because customer email is unavailable.");
    return null;
  }
  console.log(`📧 Sending cancellation email to: ${customerEmail}`);
  
  // Format the appointment details
  let appointmentDateHTML = '';
  let servicesHTML = '';
  
  // Format showtimes
  if (appointmentDetails.showtimes && appointmentDetails.showtimes.length > 0) {
    appointmentDetails.showtimes.forEach((showtime, index) => {
      const dateObj = new Date(showtime.date);
      
      // Format for Indian timezone (IST)
      const dateStr = dateObj.toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const timeStr = dateObj.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      appointmentDateHTML += `
        <li style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
          <strong>Appointment ${index + 1}:</strong><br>
          📅 Date: ${dateStr}<br>
          ⏰ Time: ${timeStr}
          ${showtime.service ? `
            <br>💇 Service: ${showtime.service.name}
            <br>💰 Price: ₹${showtime.service.price}
          ` : ''}
        </li>
      `;
    });
  }

  // Format services if available separately
  if (appointmentDetails.services && appointmentDetails.services.length > 0) {
    servicesHTML = `
      <div style="margin: 15px 0;">
        <strong>Services Booked:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${appointmentDetails.services.map(service => `
            <li>${service.name} - ₹${service.price}</li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  const emailData = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL
    },
    to: [
      {
        email: customerEmail,
        name: customerName
      }
    ],
    subject: 'Appointment Cancellation Confirmation - SalonHub',
    htmlContent: withSalonHubLogo(`
      <div style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 18px; background: #ffffff;">
        <div style="text-align: center; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white;">
          <h1 style="margin: 0;">❌ Appointment Cancelled</h1>
          <p style="margin: 5px 0 0 0;">SalonHub Cancellation Confirmation</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Hello ${customerName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Your appointment has been successfully cancelled. Here are the details:
          </p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <h3 style="color: #333; margin-top: 0;">📋 Cancelled Appointment Details</h3>
            <p><strong>🏪 Shop Name:</strong> ${shopName}</p>
            <p><strong>📅 Appointment Time(s):</strong></p>
            <ul style="color: #666; padding-left: 0; list-style: none;">
              ${appointmentDateHTML || '<li>No time slot information available</li>'}
            </ul>
            
            ${appointmentDetails.totalAmount ? `
              <p><strong>💰 Total Amount:</strong> ₹${appointmentDetails.totalAmount}</p>
            ` : ''}
            
            ${servicesHTML}
    
            <p><strong>📅 Booked On:</strong> ${appointmentDetails.bookedAt ? 
              new Date(appointmentDetails.bookedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : 
              'N/A'}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            We're sorry to see you go! If you'd like to book another appointment, we'd be happy to welcome you back.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://salonhub.co.in'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              📅 Book New Appointment
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px; text-align: center;">
            Need help? Contact us at ${Email}
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            We hope to serve you again soon!
          </p>
        </div>
      </div>
    `, {
      accent: '#dc2626',
      background: 'linear-gradient(180deg, #fef2f2 0%, #f8fafc 75%, #ffffff 100%)',
      footerText: `Cancellation update from SalonHub • © ${CURRENT_YEAR} SalonHub`,
    }),
    textContent: `
      Appointment Cancellation Confirmation
      
      Hello ${customerName},
      
      Your appointment has been successfully cancelled.
      
      Cancelled Appointment Details:
      - Shop Name: ${shopName}
      - Location: ${location}
      - Reference ID: ${appointmentDetails.appointmentId || 'N/A'}
      - Total Amount: ${appointmentDetails.totalAmount ? `₹${appointmentDetails.totalAmount}` : 'N/A'}
      
      Appointment Time(s):
      ${appointmentDetails.showtimes?.map((st, i) => `
        Appointment ${i + 1}:
        Date: ${new Date(st.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
        Time: ${new Date(st.date).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}
        ${st.service ? `Service: ${st.service.name} - ₹${st.service.price}` : ''}
      `).join('')}
      
      We're sorry to see you go! If you'd like to book another appointment, 
      visit: ${process.env.FRONTEND_URL || 'https://salonhub.co.in'}
      
      Need help? Contact us at ${Email}
      
      Thank you,
      SalonHub Team
    `
  };

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      emailData,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Cancellation email sent successfully:', customerEmail);
    console.log('📨 Message ID:', response.data.messageId);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send cancellation email:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    return null;
  }
};

// Also add to shop owner notification function
// ==========================================
// Shop Owner Cancellation Notification
// ==========================================
const sendShopOwnerCancellationNotification = async (shopOwnerEmail, shopName, customerName, customerEmail, appointmentDetails) => {
  console.log(`📧 Sending cancellation notification to shop owner: ${shopOwnerEmail}`);
  
  let appointmentDateHTML = '';
  
  if (appointmentDetails.showtimes && appointmentDetails.showtimes.length > 0) {
    appointmentDetails.showtimes.forEach(showtime => {
      const dateObj = new Date(showtime.date);
      
      const dateStr = dateObj.toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const timeStr = dateObj.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      appointmentDateHTML += `
        <li style="margin-bottom: 8px;">
          📅 Date: ${dateStr}<br>
          ⏰ Time: ${timeStr}
        </li>
      `;
    });
  }

  const emailData = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL
    },
    to: [
      {
        email: shopOwnerEmail,
        name: `${shopName} Owner`
      }
    ],
    subject: `❌ Appointment Cancelled - ${customerName}`,
    htmlContent: withSalonHubLogo(`
      <div style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden; background: #ffffff;">
        <div style="background: #EF4444; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Appointment Cancellation</h1>
          <p style="margin: 5px 0 0 0;">Customer: ${customerName}</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151;">Appointment Cancelled</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #EF4444; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Cancelled Appointment Details</h3>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Appointment Time:</strong></p>
            <ul>
              ${appointmentDateHTML || '<li>No time slot available</li>'}
            </ul>
            <p><strong>Appointment ID:</strong> ${appointmentDetails.appointmentId || 'N/A'}</p>
            <p><strong>Cancelled At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              ⚠️ <strong>Note:</strong> The time slot has been marked as available for new bookings.
            </p>
          </div>
        </div>
        
        <div style="background: #374151; padding: 15px; text-align: center; color: white; font-size: 12px;">
          <p style="margin: 0;">
            This is an automated notification from SalonHub
          </p>
        </div>
      </div>
    `, {
      accent: '#ea580c',
      background: 'linear-gradient(180deg, #fff7ed 0%, #f8fafc 75%, #ffffff 100%)',
      footerText: `Shop owner alert from SalonHub • © ${CURRENT_YEAR} SalonHub`,
    })
  };

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      emailData,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log(`✅ Shop owner notification sent to: ${shopOwnerEmail}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send shop owner notification:', error.response?.data || error.message);
    return null;
  }
};


// Verify API key on startup
verifyBrevoApiKey();
verifyTwilioConfig();

module.exports = {
  sendPaymentSuccessEmail,
  mailOtp,
  sendOtpSms,
  sendConfirmationSms,
  sendPaymentSuccessSms,
  sendShopStatusSms,
  sendCancellationSms,
  sendShopOwnerCancellationSms,
  sendConfirmationEmail,
  sendDonationConfirmationEmail,
  sendAdminContactNotification,
  sendAdminDonationNotification,
  sendAdminPendingShopNotification,
  sendShopStatusNotification, // Add this
  sendCancellationEmail, // Add this
  sendShopOwnerCancellationNotification, // Add this
  testEmailService,
  verifyBrevoApiKey,
  verifyTwilioConfig
};






// // const nodemailer = require('nodemailer');
// // const sendConfirmationEmail = async (customerEmail, shopName, location, timeSlotDate, timeSlotTime) => {
// //   // Step 1: Set up transporter (use your SMTP credentials)
// //   const transporter = nodemailer.createTransport({
// // service: 'gmail', // or any other email provider
// // auth: {
// //   user: process.env.EMAIL,
// //   pass: process.env.PASSWORD,
// // },
// //   });

// //   // Step 2: Create the email details
// //   const mailOptions = {
// //     from: process.env.EMAIL,
// //     to: customerEmail,
// //     subject: 'Payment Success - Appointment Confirmation',
// //     html: `<h1>Payment Successful!</h1>
// //            <p>Dear customer,</p>
// //            <p>Thank you for your payment. Your appointment has been confirmed with the following details:</p>
// //            <ul>
// //              <li><strong>Shop Name:</strong> ${shopName}</li>
// //              <li><strong>Location:</strong> ${location}</li>
// //              <li><strong>Date:</strong> ${new Date(timeSlotDate).toLocaleDateString()}</li>
// //              <li><strong>Time:</strong> ${new Date(timeSlotTime).toLocaleTimeString()}</li>
// //            </ul>
// //            <p>We look forward to seeing you!</p>`,
// //   };

// //   // Step 3: Send the email
// //   try {
// //     await transporter.sendMail(mailOptions);
// //     console.log('Email sent successfully!');
// //   } catch (error) {
// //     console.error('Error sending email:', error);
// //   }
// // };


// // const { Resend } = require("resend");
// const nodemailer = require("nodemailer");
// // const resend = new Resend(process.env.RESEND_API_KEY);

// // Create a reusable transporter object using SMTP transport
// const transporter = nodemailer.createTransport({
//   host: process.env.BREVO_HOST,
//   port: process.env.BREVO_PORT,
//   secure: false,
//   auth: {
//     user: process.env.BREVO_USER,
//     pass: process.env.BREVO_PASS
//   }
// });

// // ==========================================
// // Appointment Booking Confirmation Email
// // ==========================================
// async function sendConfirmationEmail(customerEmail, customerName, shopName, location, selectedTimeSlots) {
//   console.log("from send confirmation email");
//   let transporter = nodemailer.createTransport({
//     host: process.env.BREVO_HOST,
//     port: process.env.BREVO_PORT,
//     secure: false,
//     auth: {
//       user: process.env.BREVO_USER,
//       pass: process.env.BREVO_PASS
//     }
//   });

//   // Format the time slots properly
//   const selectedTimeSlotHTML = selectedTimeSlots && selectedTimeSlots.length > 0
//     ? selectedTimeSlots.map(slot => `
//         Date: ${new Date(slot.showtimeDate).toLocaleDateString()},
//         Time: ${new Date(slot.showtimeDate).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//     })}
//       `).join('\n')
//     : "No time slot selected";

//     // const htmlContent = `
//     //   <p>Dear ${customerName},</p>
//     //   <p>Your booking at <strong>${shopName}</strong>, located at <strong>${location}</strong>, has been successfully received.</p>
//     //   <p>You have booked the following time slot:</p>
//     //   <p>${selectedTimeSlotHTML}</p>
//     //   <p>Thank you for choosing us!</p>
//     //   <br>
//     //   <p>Best regards,<br>Salon Booking Team</p>
//     // `;
//     // try {
//     //   const result = await resend.emails.send({
//     //     from: "Salon Hub <noreply@salonhub.co.in>", // can be replaced with verified domain
//     //     to: customerEmail,
//     //     subject: "Appointment Booking Confirmation",
//     //     html: htmlContent,
//     //   });

//     //   console.log('Confirmation email sent successfully to:', customerEmail);
//     //   return result;
//     // } catch (emailError) {
//     //   console.error('Failed to send confirmation email:', emailError);
//     //   return null; // Don’t throw error so booking still succeeds
//     // }

//   const mailOptions = {
//     from: process.env.BREVO_EMAIL, // sender address
//     to: customerEmail,
//     subject: 'Appointment Booking Confirmation',
//     text: `Dear ${customerName},

//   Your booking at ${shopName}, located at ${location}, has been successfully received.

//   You have booked the following time slot:
//   ${selectedTimeSlotHTML}

//   Thank you for choosing us!

//   Best regards,
//   Salon Hub Team`,
//   };

//   try {
//     const result = await transporter.sendMail(mailOptions);
//     console.log('Confirmation email sent successfully to:', customerEmail);
//     return result;
//   } catch (emailError) {
//     console.error('Failed to send confirmation email:', emailError);
//     // Don't throw the error - we don't want email failure to break the booking
//     return null;
//   }
// }


// // ==========================================
// // Payment Success Email using resend service
// // ==========================================
// // const sendPaymentSuccessEmail = async (customerEmail, shopName, location, selectedTimeSlot) => {
// //   const htmlContent = `
// //     <p>Dear Customer,</p>
// //     <p>Your payment for booking at <strong>${shopName}</strong>, located at <strong>${location}</strong>, has been successfully received.</p>
// //     <p>You have booked the following time slot:</p>
// //     <p>
// //       Date: ${new Date(selectedTimeSlot.showtimeDate).toLocaleDateString()} <br>
// //       Time: ${new Date(selectedTimeSlot.showtimeDate).toLocaleTimeString('en-US', {
// //         hour: '2-digit',
// //         minute: '2-digit',
// //       })}
// //     </p>
// //     <p>Thank you for choosing us!</p>
// //     <br>
// //     <p>Best regards,<br>Salon Booking Team</p>
// //   `;

// //   try {
// //     const result = await resend.emails.send({
// //       from: "Salon Booking <onboarding@resend.dev>",
// //       to: customerEmail,
// //       subject: "Payment Successful - Salon Booking Confirmation",
// //       html: htmlContent,
// //     });

// //     console.log("Payment success email sent:", result);
// //   } catch (error) {
// //     console.error("Error while sending payment success email:", error);
// //   }
// // };


// // Function to send email
// const sendPaymentSuccessEmail = (customerEmail, shopName, location, selectedTimeSlot) => {
//   const mailOptions = {
//     from: process.env.BREVO_EMAIL, // sender address
//     to: customerEmail, // customer's email
//     subject: 'Payment Successful - Salon Booking Confirmation',
//     text: `Dear Customer,

// Your payment for booking at ${shopName}, located at ${location}, has been successfully received.

// You have booked the following time slot:
// Date: ${new Date(selectedTimeSlot.showtimeDate).toLocaleDateString()}
// Time: ${new Date(slot.showtimeDate).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//     })}

// Thank you for choosing us!

// Best regards,
// Salon Booking Team`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       return console.log('Error while sending email: ', error);
//     }
//     console.log('Email sent: ' + info.response);
//   });
// };

// // const mailOtp = async (otp, email, subject = 'OTP') => {
// //   console.log("from mail otp");
// //   const mailOptions = {
// //     from: process.env.BREVO_EMAIL,
// //     to: email,
// //     subject: subject,
// //     text: `Your OTP is ${otp}`
// //   }
// //   // const transporter = transporterSingleton.getTransporter()
// //   console.log("before sending mail");
// //   await transporter.sendMail(mailOptions);
// //   console.log("after sending mail");
// // }



// // ==========================================
// // OTP Email using resend service
// // ==========================================
// // const mailOtp = async (otp, email, subject = 'OTP') => {
// //   console.log("from mail otp");

// //   const htmlContent = `
// //     <p>Your OTP is:</p>
// //     <h2>${otp}</h2>
// //   `;

// //   console.log("before sending mail");
// //   await resend.emails.send({
// //     from: "Salon Hub <noreply@salonhub.co.in>",
// //     to: email,
// //     subject: subject,
// //     html: htmlContent,
// //   });
// //   console.log("after sending mail");
// // };


// // ==========================================
// // Donation Confirmation Email using resend service
// // ==========================================
// // const sendDonationConfirmationEmail = async (name, email, amount, message) => {
// //   const htmlContent = `
// //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
// //         <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center; color: white;">
// //             <h1 style="margin: 0; font-size: 28px;">Thank You for Your Donation!</h1>
// //             <p style="margin: 10px 0 0 0; font-size: 16px;">Together we're building a greener future</p>
// //         </div>
        
// //         <div style="padding: 30px; background: #f9fafb;">
// //             <h2 style="color: #065f46; margin-bottom: 20px;">Dear ${name},</h2>
            
// //             <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
// //                 We are incredibly grateful for your generous donation of <strong>₹${amount}</strong> 
// //                 towards our environmental initiatives.
// //             </p>
            
// //             ${message ? `
// //             <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #10B981; margin: 20px 0;">
// //                 <p style="color: #374151; margin: 0; font-style: italic;">"${message}"</p>
// //             </div>
// //             ` : ''}
            
// //             <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
// //                 Your contribution will help us:
// //             </p>
            
// //             <ul style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
// //                 <li>🌳 Plant trees in deforested areas</li>
// //                 <li>♻️ Support waste management programs</li>
// //                 <li>💧 Provide clean water solutions</li>
// //                 <li>📚 Educate communities about sustainability</li>
// //             </ul>
            
// //             <div style="background: #d1fae5; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
// //                 <p style="color: #065f46; margin: 0; font-weight: bold;">
// //                     100% of your donation goes directly to environmental projects.
// //                 </p>
// //             </div>
            
// //             <p style="color: #374151; line-height: 1.6;">
// //                 We'll keep you updated on the impact of your donation. Thank you for being a part of 
// //                 this important mission!
// //             </p>
// //         </div>
        
// //         <div style="background: #374151; padding: 20px; text-align: center; color: white;">
// //             <p style="margin: 0; font-size: 14px;">
// //                 With gratitude,<br>
// //                 <strong>The Environmental Initiative Team</strong>
// //             </p>
// //         </div>
// //     </div>
// //   `;

// //   try {
// //     const result = await resend.emails.send({
// //       from: "Salon Hub <noreply@salonhub.co.in>",
// //       to: email,
// //       subject: "Thank You for Your Environmental Donation 🌱",
// //       html: htmlContent,
// //     });

// //     console.log(`Donation confirmation email sent to ${email}`, result);
// //   } catch (error) {
// //     console.error("Error sending donation email:", error);
// //   }
// // };

// const sendDonationConfirmationEmail = async (name, email, amount, message) => {
//   try {
//     let transporter = nodemailer.createTransport({
//       host: process.env.BREVO_HOST,
//       port: process.env.BREVO_PORT,
//       secure: false,
//       auth: {
//         user: process.env.BREVO_USER,
//         pass: process.env.BREVO_PASS
//       }
//     });

//     const mailOptions = {
//       from: process.env.BREVO_EMAIL,
//       to: email,
//       subject: 'Thank You for Your Environmental Donation 🌱',
//       html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//                     <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center; color: white;">
//                         <h1 style="margin: 0; font-size: 28px;">Thank You for Your Donation!</h1>
//                         <p style="margin: 10px 0 0 0; font-size: 16px;">Together we're building a greener future</p>
//                     </div>
                    
//                     <div style="padding: 30px; background: #f9fafb;">
//                         <h2 style="color: #065f46; margin-bottom: 20px;">Dear ${name},</h2>
                        
//                         <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
//                             We are incredibly grateful for your generous donation of <strong>₹${amount}</strong> 
//                             towards our environmental initiatives.
//                         </p>
                        
//                         ${message ? `
//                         <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #10B981; margin: 20px 0;">
//                             <p style="color: #374151; margin: 0; font-style: italic;">"${message}"</p>
//                         </div>
//                         ` : ''}
                        
//                         <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
//                             Your contribution will help us:
//                         </p>
                        
//                         <ul style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
//                             <li>🌳 Plant trees in deforested areas</li>
//                             <li>♻️ Support waste management programs</li>
//                             <li>💧 Provide clean water solutions</li>
//                             <li>📚 Educate communities about sustainability</li>
//                         </ul>
                        
//                         <div style="background: #d1fae5; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
//                             <p style="color: #065f46; margin: 0; font-weight: bold;">
//                                 100% of your donation goes directly to environmental projects.
//                             </p>
//                         </div>
                        
//                         <p style="color: #374151; line-height: 1.6;">
//                             We'll keep you updated on the impact of your donation. Thank you for being a part of 
//                             this important mission!
//                         </p>
//                     </div>
                    
//                     <div style="background: #374151; padding: 20px; text-align: center; color: white;">
//                         <p style="margin: 0; font-size: 14px;">
//                             With gratitude,<br>
//                             <strong>The Environmental Initiative Team</strong>
//                         </p>
//                     </div>
//                 </div>
//             `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`Donation confirmation email sent to ${email}`);
//   } catch (error) {
//     console.error('Error sending donation email:', error);
//     // Don't throw error - payment is still valid even if email fails
//   }
// };

// module.exports = {
//   sendPaymentSuccessEmail,
//   mailOtp,
//   sendConfirmationEmail,
//   sendDonationConfirmationEmail
// }

