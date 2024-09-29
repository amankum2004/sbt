// const nodemailer = require('nodemailer');

// const sendConfirmationEmail = async (customerEmail, shopName, location, timeSlotDate, timeSlotTime) => {
//   // Step 1: Set up transporter (use your SMTP credentials)
//   const transporter = nodemailer.createTransport({
//     service: 'gmail', // or any other email provider
//     auth: {
//       user: 'sbthelp123@gmail.com',
//       pass: 'cwpf ywjb qdrp dexv',
//     },
//   });

//   // Step 2: Create the email details
//   const mailOptions = {
//     from: 'sbthelp123@gmail.com',
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


const nodemailer = require('nodemailer');

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: 'sbthelp123@gmail.com',
    pass: 'cwpf ywjb qdrp dexv',
  },
});

// Function to send email
const sendPaymentSuccessEmail = (customerEmail, shopName, location, selectedTimeSlot) => {
  const mailOptions = {
    from: 'sbthelp123@gmail.com', // sender address
    to: customerEmail, // customer's email
    subject: 'Payment Successful - Salon Booking Confirmation',
    text: `Dear Customer,

Your payment for booking at ${shopName}, located at ${location}, has been successfully received.

You have booked the following time slot:
Date: ${new Date(selectedTimeSlot.showtimeDate).toLocaleDateString()}
Time: ${new Date(selectedTimeSlot.showtimeDate).toLocaleTimeString()}

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

