const nodemailer = require('nodemailer');
const otpGenerator = require( 'otp-generator');
const OTP = require('@/models/user/otp-model');
const User = require('@/models/user/user-model');
const {mailOtp} = require('../../utils/mail')

exports.userOTP=async (req, res) => {

  const { email} = req.body;
  try {
    const user = await User.findOne({ email:email.toLowerCase() });
    if (user) {
      return res.status(401).json({ error: "User already exists please login" });
    }
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    })

    await OTP.create({ email: email.toLowerCase(), otp })
    // res.status(200).json({ message: "User not found" });
    await mailOtp(otp, email.toLowerCase())
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    })
  }
  catch(error){
    console.error('Error sending OTP:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again later.'
    });
  }
};

// exports.userOTP1=async (req, res) => {

//   const { email} = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (user) {
//       return res.status(200).json({ message: "Userfound" });
      
//     }
//     res.status(401).json({ error: "User not found please signup" });
//   }
//   catch(error){
//     console.error("Error during fetch:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// exports.sendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // Generate OTP
//     const otp = otpGenerator.generate(6, {
//       upperCaseAlphabets: false,
//       lowerCaseAlphabets: false,
//       specialChars: false,
//     });

//     // Save OTP in the database
//     await OTP.create({ email, otp });

//     // Create Nodemailer transporter
//     const transporter = nodemailer.createTransport({
//       service: "gmail", // e.g., 'Gmail'
//       // port:587,
//       // secure:false,
//       auth: {
//         // user: process.env.VITE_APP_EMAIL,
//         // pass: process.env.VITE_APP_PASSWORD,
//         user: 'sbthelp123@gmail.com',
//         pass: 'cwpf ywjb qdrp dexv',
//       },
//       debug: true, // enable debug output
//       logger: true // log information to console
//     });

//     const mailOptions = {
//       from: 'sbthelp123@gmail.com',
//       // from: process.env.REACT_APP_EMAIL,
//       to: email,
//       subject: 'Verify your Email Address',
//       html:`<h3>Please confirm your OTP</h3>
//       <p>Here is your OTP code: <b>${otp}</b></p>`,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({
//       success: true,
//       message: 'OTP sent successfully',
//     });
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to send OTP. Please try again later.',
//     });
//   }
// };

exports.sendOTPforgot = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await OTP.create({ email, otp });
    
    await mailOtp(otp, email.toLowerCase(), 'Password Reset')
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    })

    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: 'sbthelp123@gmail.com',
    //     pass: 'cwpf ywjb qdrp dexv',
    //   },
    // });
    // const mailOptions = {
    //   from: 'sbthelp123@gmail.com',
    //   to: email,
    //   subject: 'Password Reset',
    //   html:`<h1>Please confirm your OTP</h1>
    //   <p>Here is your OTP code: ${otp}</p>`,
    // };
    // await transporter.sendMail(mailOptions);
    // res.status(200).json({
    //   success: true,
    //   message: 'OTP sent successfully',
    // });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again later.',
    });
  }
};