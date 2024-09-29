// const jwt = require("jsonwebtoken");
// // const secret = require("@/controllers/auth-config");
// const User = require("@/models/user/user-model");

// const authMiddleware = async(req,res,next) => {
//     const token = req.header("Authorization");

//     if (!token) {
//         return res.status(401).json({msg:"Unauthorised HTTP, token not provided"})
//     }
    
//     // Assuming token is in the format "Bearer <jwt token>", remove the Bearer prefix and spaces
//     const jwtToken = token.replace("Bearer","").trim(); 
//     // console.log("token from auth middleware:",jwtToken);

//     try {
//         const isVerified = jwt.verify(jwtToken,secret.secret);
//         // console.log(isVerified);
//         const userData = await User.findOne({email: isVerified.email}).select({password:0})
//         console.log(userData);
//         req.user = userData;
//         req.token = token;
//         req.userID = userData._id;
//         next();
//     } catch (error) {
//         return res.status(401).json({message:"Unauthorised, invalid token from userMiddleware"})
//     }
// }

// module.exports = authMiddleware;