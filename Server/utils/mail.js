// const nodemailer = require('nodemailer');

// const sendConfirmationEmail = async (customerEmail, shopName, location, timeSlotDate, timeSlotTime) => {
//   // Step 1: Set up transporter (use your SMTP credentials)
//   const transporter = nodemailer.createTransport({
// service: 'gmail', // or any other email provider
// auth: {
//   user: process.env.EMAIL,
//   pass: process.env.PASSWORD,
// },
//   });

//   // Step 2: Create the email details
//   const mailOptions = {
//     from: process.env.EMAIL,
//     to: customerEmail,
//     subject: 'Payment Success - Appointment Confirmation',
//     html: `<h1>Payment Successful!</h1>
//            <p>Dear customer,</p>
//            <p>Thank you for your payment. Your appointment has been confirmed with the following details:</p>
//            <ul>
//              <li><strong>Shop Name:</strong> ${shopName}</li>
//              <li><strong>Location:</strong> ${location}</li>
//              <li><strong>Date:</strong> ${new Date(timeSlotDate).toLocaleDateString()}</li>
//              <li><strong>Time:</strong> ${new Date(timeSlotTime).toLocaleTimeString()}</li>
//            </ul>
//            <p>We look forward to seeing you!</p>`,
//   };

//   // Step 3: Send the email
//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Email sent successfully!');
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };


const { Resend } = require("resend");
const nodemailer = require("nodemailer");
const resend = new Resend(process.env.RESEND_API_KEY);

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST,
  port: process.env.BREVO_PORT,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

// ==========================================
// Appointment Booking Confirmation Email
// ==========================================
async function sendConfirmationEmail(customerEmail, customerName, shopName, location, selectedTimeSlots) {
  console.log("from send confirmation email");
  let transporter = nodemailer.createTransport({
    host: process.env.BREVO_HOST,
    port: process.env.BREVO_PORT,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS
    }
  });

  // Format the time slots properly
  const selectedTimeSlotHTML = selectedTimeSlots && selectedTimeSlots.length > 0
    ? selectedTimeSlots.map(slot => `
        Date: ${new Date(slot.showtimeDate).toLocaleDateString()},
        Time: ${new Date(slot.showtimeDate).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}
      `).join('\n')
    : "No time slot selected";

    // const htmlContent = `
    //   <p>Dear ${customerName},</p>
    //   <p>Your booking at <strong>${shopName}</strong>, located at <strong>${location}</strong>, has been successfully received.</p>
    //   <p>You have booked the following time slot:</p>
    //   <p>${selectedTimeSlotHTML}</p>
    //   <p>Thank you for choosing us!</p>
    //   <br>
    //   <p>Best regards,<br>Salon Booking Team</p>
    // `;
    // try {
    //   const result = await resend.emails.send({
    //     from: "Salon Hub <noreply@salonhub.co.in>", // can be replaced with verified domain
    //     to: customerEmail,
    //     subject: "Appointment Booking Confirmation",
    //     html: htmlContent,
    //   });

    //   console.log('Confirmation email sent successfully to:', customerEmail);
    //   return result;
    // } catch (emailError) {
    //   console.error('Failed to send confirmation email:', emailError);
    //   return null; // Don’t throw error so booking still succeeds
    // }

  const mailOptions = {
    from: process.env.BREVO_EMAIL, // sender address
    to: customerEmail,
    subject: 'Appointment Booking Confirmation',
    text: `Dear ${customerName},

  Your booking at ${shopName}, located at ${location}, has been successfully received.

  You have booked the following time slot:
  ${selectedTimeSlotHTML}

  Thank you for choosing us!

  Best regards,
  Salon Hub Team`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully to:', customerEmail);
    return result;
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError);
    // Don't throw the error - we don't want email failure to break the booking
    return null;
  }
}


// ==========================================
// Payment Success Email using resend service
// ==========================================
// const sendPaymentSuccessEmail = async (customerEmail, shopName, location, selectedTimeSlot) => {
//   const htmlContent = `
//     <p>Dear Customer,</p>
//     <p>Your payment for booking at <strong>${shopName}</strong>, located at <strong>${location}</strong>, has been successfully received.</p>
//     <p>You have booked the following time slot:</p>
//     <p>
//       Date: ${new Date(selectedTimeSlot.showtimeDate).toLocaleDateString()} <br>
//       Time: ${new Date(selectedTimeSlot.showtimeDate).toLocaleTimeString('en-US', {
//         hour: '2-digit',
//         minute: '2-digit',
//       })}
//     </p>
//     <p>Thank you for choosing us!</p>
//     <br>
//     <p>Best regards,<br>Salon Booking Team</p>
//   `;

//   try {
//     const result = await resend.emails.send({
//       from: "Salon Booking <onboarding@resend.dev>",
//       to: customerEmail,
//       subject: "Payment Successful - Salon Booking Confirmation",
//       html: htmlContent,
//     });

//     console.log("Payment success email sent:", result);
//   } catch (error) {
//     console.error("Error while sending payment success email:", error);
//   }
// };


// Function to send email
const sendPaymentSuccessEmail = (customerEmail, shopName, location, selectedTimeSlot) => {
  const mailOptions = {
    from: process.env.BREVO_EMAIL, // sender address
    to: customerEmail, // customer's email
    subject: 'Payment Successful - Salon Booking Confirmation',
    text: `Dear Customer,

Your payment for booking at ${shopName}, located at ${location}, has been successfully received.

You have booked the following time slot:
Date: ${new Date(selectedTimeSlot.showtimeDate).toLocaleDateString()}
Time: ${new Date(slot.showtimeDate).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}

Thank you for choosing us!

Best regards,
Salon Booking Team`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Error while sending email: ', error);
    }
    console.log('Email sent: ' + info.response);
  });
};

const mailOtp = async (otp, email, subject = 'OTP') => {
  console.log("from mail otp");
  const mailOptions = {
    from: process.env.BREVO_EMAIL,
    to: email,
    subject: subject,
    text: `Your OTP is ${otp}`
  }
  // const transporter = transporterSingleton.getTransporter()
  console.log("before sending mail");
  await transporter.sendMail(mailOptions);
  console.log("after sending mail");
}


// ==========================================
// OTP Email using resend service
// ==========================================
// const mailOtp = async (otp, email, subject = 'OTP') => {
//   console.log("from mail otp");

//   const htmlContent = `
//     <p>Your OTP is:</p>
//     <h2>${otp}</h2>
//   `;

//   console.log("before sending mail");
//   await resend.emails.send({
//     from: "Salon Hub <noreply@salonhub.co.in>",
//     to: email,
//     subject: subject,
//     html: htmlContent,
//   });
//   console.log("after sending mail");
// };


// ==========================================
// Donation Confirmation Email using resend service
// ==========================================
// const sendDonationConfirmationEmail = async (name, email, amount, message) => {
//   const htmlContent = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center; color: white;">
//             <h1 style="margin: 0; font-size: 28px;">Thank You for Your Donation!</h1>
//             <p style="margin: 10px 0 0 0; font-size: 16px;">Together we're building a greener future</p>
//         </div>
        
//         <div style="padding: 30px; background: #f9fafb;">
//             <h2 style="color: #065f46; margin-bottom: 20px;">Dear ${name},</h2>
            
//             <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
//                 We are incredibly grateful for your generous donation of <strong>₹${amount}</strong> 
//                 towards our environmental initiatives.
//             </p>
            
//             ${message ? `
//             <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #10B981; margin: 20px 0;">
//                 <p style="color: #374151; margin: 0; font-style: italic;">"${message}"</p>
//             </div>
//             ` : ''}
            
//             <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
//                 Your contribution will help us:
//             </p>
            
//             <ul style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
//                 <li>🌳 Plant trees in deforested areas</li>
//                 <li>♻️ Support waste management programs</li>
//                 <li>💧 Provide clean water solutions</li>
//                 <li>📚 Educate communities about sustainability</li>
//             </ul>
            
//             <div style="background: #d1fae5; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
//                 <p style="color: #065f46; margin: 0; font-weight: bold;">
//                     100% of your donation goes directly to environmental projects.
//                 </p>
//             </div>
            
//             <p style="color: #374151; line-height: 1.6;">
//                 We'll keep you updated on the impact of your donation. Thank you for being a part of 
//                 this important mission!
//             </p>
//         </div>
        
//         <div style="background: #374151; padding: 20px; text-align: center; color: white;">
//             <p style="margin: 0; font-size: 14px;">
//                 With gratitude,<br>
//                 <strong>The Environmental Initiative Team</strong>
//             </p>
//         </div>
//     </div>
//   `;

//   try {
//     const result = await resend.emails.send({
//       from: "Salon Hub <noreply@salonhub.co.in>",
//       to: email,
//       subject: "Thank You for Your Environmental Donation 🌱",
//       html: htmlContent,
//     });

//     console.log(`Donation confirmation email sent to ${email}`, result);
//   } catch (error) {
//     console.error("Error sending donation email:", error);
//   }
// };

const sendDonationConfirmationEmail = async (name, email, amount, message) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.BREVO_HOST,
      port: process.env.BREVO_PORT,
      secure: false,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS
      }
    });

    const mailOptions = {
      from: process.env.BREVO_EMAIL,
      to: email,
      subject: 'Thank You for Your Environmental Donation 🌱',
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
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
            `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Donation confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending donation email:', error);
    // Don't throw error - payment is still valid even if email fails
  }
};

module.exports = {
  sendPaymentSuccessEmail,
  mailOtp,
  sendConfirmationEmail,
  sendDonationConfirmationEmail
}

