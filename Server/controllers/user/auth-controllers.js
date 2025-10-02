const User = require("@/models/user/user-model")
const bcrypt = require("bcrypt")
const OTP = require("@/models/user/otp-model")
const jwt = require("jsonwebtoken")
const Shop = require("../../models/registerShop-model")

const home = async(req,res) => {
    try {
        res.status(200).send("Welcome to Salon Booking Time platform ")
    } catch (error) {
        console.log(error)
    }
}

const register = async(req,res) => {
    try {
        const { name, phone, password, otp, email, usertype} = req.body;
        // Check if all details are provided
        if (!name || !email || !password || !otp || !phone || !usertype) {
          return res.status(403).json({
            success: false,
            message: 'All fields are required',
          });
        }
    
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'User already exists',
          });
        }
    
        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (response.length === 0 || otp !== response[0].otp) {
          return res.status(400).json({
            success: false,
            message: 'The OTP is not valid',
          });
        }
      
        let hashedPassword;
        try {
          hashedPassword = await bcrypt.hash(password, 10);
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: `Hashing password error for ${password}: ` + error.message,
          });
        }
        const newUser = await User.create({
          name,
          email: email.toLowerCase(),
          phone,
          password: hashedPassword,
          usertype
        });
        console.log(req.body)
        return res.status(201).json({
          success: true,
          message: 'User registered successfully',
          user: newUser,
          // message: "Registration successful",
          // token: await newUser.generateToken(),
          // userId: newUser._id
        });
      } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
      }
}

// login using email or phone and password
const login = async (req, res) => {
    const { email, phone, password, contactType } = req.body;
    
    try {
        // Validate input
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        if (!contactType || (contactType !== 'email' && contactType !== 'phone')) {
            return res.status(400).json({ error: "Valid contact type (email or phone) is required" });
        }

        if (contactType === 'email' && !email) {
            return res.status(400).json({ error: "Email is required" });
        }

        if (contactType === 'phone' && !phone) {
            return res.status(400).json({ error: "Phone number is required" });
        }

        // Find user by email or phone
        let user;
        if (contactType === 'email') {
            user = await User.findOne({ email: email.toLowerCase() });
        } else {
            user = await User.findOne({ phone: phone });
        }

        if (!user) {
            return res.status(404).json({ 
                error: "User not found" 
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

         // ADD THIS: Find shop if user is shopOwner
        let shop = null;
        if (user.usertype === 'shopOwner') {
            shop = await Shop.findOne({ email: user.email });
            console.log('Found shop for shopOwner:', shop);
        }

        const token = jwt.sign({ 
            userId: user._id,
            email: user.email,
            usertype: user.usertype || 'customer',
            name: user.name || 'user',
            phone: user.phone || ''
        }, 
        `${process.env.JWT_SECRET || 'secret'}`,
        {
            expiresIn: '24h'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            user: {
                userId: user._id,
                email: user.email,
                usertype: user.usertype || 'customer',
                name: user.name || 'user',
                phone: user.phone || '',
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
                shop: shop // ADD THIS LINE
            }
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// const login = async (req,res) =>{
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email:email.toLowerCase() });
//         if (!user) {
//           return res.status(404).json({ 
//             error: "User not found" 
//           });
//         }
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//         return res.status(401).json({ error: "Invalid email or password" });
//         }
//         const token = jwt.sign({ 
//           userId: user._id ,
//           email: user.email,
//           usertype: user.usertype || 'customer',
//           name: user.name || 'user',
//           phone: user.phone || ''
//         }, 
//         `${process.env.JWT_SECRET || 'secret'}`,
//       {
//         expiresIn: '24h'
//       })
//       res.cookie('token', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'Lax',
//         maxAge: 24 * 60 * 60 * 1000
//       })
//       res.status(200).json({
//         userId: user._id,
//         email: user.email,
//         usertype: user.usertype || 'customer',
//         name: user.name || 'user',
//         phone: user.phone || '',
//         exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
//       })
//     } catch (error) {
//         console.error("Error during login:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

const update = async(req,res) => {
    try {
    const {email,password, otp} = req.body;
    console.log(req.body);
    // Check if all details are provided
    if ( !email || !password || !otp) {
      console.log('input error');
      return res.status(403).json({
        success: false,
        message: 'All fields are required',
      });
    }
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      console.log('otp error');
      return res.status(400).json({
        success: false,
        message: 'The OTP is not valid',
      });
    }
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);

    } catch (error) {
      console.log('password error');
      return res.status(500).json({
        success: false,
        message: `Hashing password error for ${password}: ` + error.message,
      });
    }
    
    const user = await User.findOne({ email });

    if (!user) {
      console.log('user error');
      return res.status(404).json({ error: "User not found" });
    }
    user.password=hashedPassword;
    await user.save();
     
    res.status(200).json({ 
      success:true,
      message: "Password updated successfully" 
    });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// LOGIC TO SEND USER DATA IN CONTACT US FORM
const user = async(req,res) => {
    try {
        const userData = req.user;
        console.log(userData);
        return res.status(200).json({userData})
    } catch (error) {
        console.log(`Error from the user route: ${error}`);
    }
}

// const getUserType = async (req,res) => {
//   try {
//     // console.log('User from middleware:', req.user); 
//     const user = req.user; // Get user details from session or JWT token
//     if (!user) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }
//     res.json({
//       name: user.username,
//       email: user.email,
//       userType: user.usertype, // Assuming this is how userType is stored in your User model
//     });
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }



module.exports = {home,register,login,user,update};