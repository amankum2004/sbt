// const adminMiddleware = (req,res,next) => {
//     try {
//         console.log(req.user);
//         const adminRole = req.user.isAdmin;
//         if (!adminRole) {
//             return res.status(403).json({message:"Access Denied. User is not an Admin"})
//         }
//         // res.status(200).json({msg:req.user.isAdmin});
//         // IF USER IS AN ADMIN PROCEED TO NEXT MIDDLEWARE
//         next()
//     } catch (error) {
//         next(error);
//     }
// }

// module.exports = adminMiddleware;
