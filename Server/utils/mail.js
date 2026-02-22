const axios = require('axios');

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API;
const BREVO_SENDER_EMAIL = process.env.BREVO_EMAIL;
const BREVO_SENDER_NAME = 'SalonHub';
const Email = 'salonhub.business@gmail.com';
const FRONTEND_BASE_URL = (process.env.FRONTEND_URL || 'https://www.salonhub.co.in').replace(/\/+$/, '');
const SALONHUB_LOGO_URL = process.env.SALONHUB_LOGO_URL || `${FRONTEND_BASE_URL}/salonHub-logo.svg`;

const CURRENT_YEAR = new Date().getFullYear();

const withSalonHubLogo = (htmlContent = '', options = {}) => {
  const {
    accent = '#0ea5e9',
    background = 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 65%, #fff7ed 100%)',
    footerText = `Need help? Contact us at ${Email} • © ${CURRENT_YEAR} SalonHub`,
  } = options;

  return `
    <div style="margin: 0; padding: 28px 12px; background: ${background};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
          <td align="center">
            <div style="max-width: 680px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 14px;">
                <div style="display: inline-block; background: #ffffff; border: 1px solid #dbeafe; border-radius: 16px; padding: 12px 18px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);">
                  <img
                    src="${SALONHUB_LOGO_URL}"
                    alt="SalonHub Logo"
                    style="width: 148px; max-width: 76%; height: auto; display: inline-block;"
                  />
                  <div style="margin-top: 8px; color: #0f172a; font-size: 12px; font-weight: 700; letter-spacing: 1.4px;">
                    SALONHUB
                  </div>
                  <div style="margin-top: 2px; color: #64748b; font-size: 11px;">
                    Premium Salon Booking Experience
                  </div>
                </div>
              </div>
              <div style="background: #ffffff; border-radius: 24px; border: 1px solid #dbeafe; overflow: hidden; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.14);">
                <div style="height: 5px; background: ${accent};"></div>
                <div style="padding: 12px;">
                  ${htmlContent}
                </div>
              </div>
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

// ==========================================
// Appointment Booking Confirmation Email
// ==========================================
const sendConfirmationEmail = async (customerEmail, customerName, shopName, location, selectedTimeSlots) => {
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
    const response = await axios.get(
      'https://api.brevo.com/v3/account',
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );
    
    console.log('✅ Brevo API key verified successfully');
    console.log('📧 Account:', response.data.email);
    console.log('🏢 Company:', response.data.company);
    console.log('📊 Plan:', response.data.plan?.[0]?.type);
    return true;
  } catch (error) {
    console.error('❌ Brevo API key verification failed:');
    console.error('Error:', error.response?.data || error.message);
    return false;
  }
};

// ==========================================
// Shop Status Change Notification Email
// ==========================================
const sendShopStatusNotification = async (customerEmail, customerName, shopName, newStatus, appointmentDate) => {
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

module.exports = {
  sendPaymentSuccessEmail,
  mailOtp,
  sendConfirmationEmail,
  sendDonationConfirmationEmail,
  sendShopStatusNotification, // Add this
  sendCancellationEmail, // Add this
  sendShopOwnerCancellationNotification, // Add this
  testEmailService,
  verifyBrevoApiKey
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

