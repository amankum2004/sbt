const Shops = require("../models/registerShop-model")
const User = require("../models/user/user-model")
const bcrypt = require("bcrypt")

exports.registershop = async(req,res,next) => {
    try {
          const {name,email,phone,password,shopname,state,district,city,street,pin,bankname,bankbranch,ifsc,micr,account,services} = req.body;

          if (!name || !email || !password || !phone || !shopname|| !state || !district || !city || !street || !pin || !bankname || !bankbranch || !ifsc || !micr || !account || !services) {
            return res.status(403).json({
              success: false,
              message: 'All fields are required',
            });
          }

          const userExi = await Shops.findOne({email}) 
          if(userExi){
              return res.status(400).json({message: "Email already exists"})
          }

          const saltRound = 10;
          const hash_password = await bcrypt.hash(password,saltRound)

          const userExist = await User.findOne({email});
          if (!userExist) {
            return res.status(404).json({
              msg: "Invalid email"
            })
          }

          try {
            const user = await bcrypt.compare(password,userExist.password);
            // const user = await userExist.comparePassword(password)
            if (user) {
              res.status(201).json({
                    message: "Password is Correct",
                    // token: await userExist.generateToken(),
                    userId: userExist._id
                  })
              }else{
                res.status(401).json({message: "Invalid email or password"})
              }
            } catch (error) {
              console.log(error)
            } 
            
            // try {
              // Find the user by email
              // const user = await User.findOne({ email });
              // if (!user) {
              //   return res.status(404).json({ error: 'User not found' });
              // }
              // Update the userType to 'shopOwner'
              // user.usertype = 'shopOwner'; // Assuming this updates the userType field in User model
              // await user.save();
              // console.log("User type updated to shopOwner")
              // res.status(200).json({ message: 'User type updated to shopOwner' });
            // } catch (error) {
            //   console.error('Error registering shop:', error);
            //   res.status(500).json({ error: 'Internal server error' });
            // }
            
          try {  
            const user = await bcrypt.compare(password,userExist.password);
            if (user) { 
              const shopCreated =  await Shops.create({ 
                name,
                email,
                phone,
                password:hash_password,
                shopname,
                state,
                district,
                city,
                street,
                pin,
                bankname,
                bankbranch,
                ifsc,
                micr,
                account,
                services
              });
          console.log(req.body)
          // console.log(req.body)
          console.log("Shop registration successful")
          // res.status(201).json({   
            // message: " Shop registration successful",
            // // token: await shopCreated1.generateToken(),
            // userId: shopCreated1._id,
            // })
            // res.status(200).send(req.body)
            // res.status(200).send("Welcome to registration page through Controllers new")
          }
          } catch (error) {
            console.log(error);
          }
    } catch (err) {
        // res.status(404).json({message: "Page not found"})
        next(err)
    }
}

// Get all user services
// exports.getUserServices = async (req, res) => {
//     try {
//       // Retrieve all user service entries from the database
//       const userServices = await Shops.find();
//       // Send the retrieved entries as the response
//       res.status(200).send(userServices);
//     } catch (error) {
//       // Handle any errors during retrieval and send a 500 status with the error message
//       res.status(500).send(error);
//     }
// };

// Get a user service by ID
// exports.getUserServiceById = async (req, res) => {
//     try {
//       // Retrieve the user service entry with the specified ID from the database
//       const userService = await Shops.findById(req.params.id);
//       if (!userService) {
//         return res.status(404).send();
//       }
//       res.status(200).send(userService);
//     } catch (error) {
//       res.status(500).send(error);
//     }
// };

// Update a user service
// exports.updateUserService = async (req, res) => {
//     // Extract the required fields from the request body
//     const { name,email,phone,password,shopname,state,district,city,street,pin,bankname,bankbranch,ifsc,micr,account,services} = req.body;
  
//     try {
//       // Find the user service entry with the specified ID and update it with the new data
//       const userService = await Shops.findByIdAndUpdate(
//         req.params.id,
//         { name,email,phone,password,shopname,state,district,city,street,pin,bankname,bankbranch,ifsc,micr,account,services},
//         { new: true, runValidators: true }
//       );
  
//       // If the entry is not found, send a 404 status
//       if (!userService) {
//         return res.status(404).send();
//       }
//       // Send the updated entry as the response
//       res.status(200).send(userService);
//     } catch (error) {
//       // Handle any errors during update and send a 400 status with the error message
//       res.status(400).send(error);
//     }
// };

// Delete a user service
// exports.deleteUserService = async (req, res) => {
//     try {
//       // Find the user service entry with the specified ID and delete it from the database
//       const userService = await Shops.findByIdAndDelete(req.params.id);
//       // If the entry is not found, send a 404 status
//       if (!userService) {
//         return res.status(404).send();
//       }
//       // Send the deleted entry as the response
//       res.status(200).send(userService);
//     } catch (error) {
//       // Handle any errors during deletion and send a 500 status with the error message
//       res.status(500).send(error);
//     }
// };

// LOGIC TO GET ALL ShopList
exports.getAllShops = async(req,res) => {
  try {
      // const ShopLists = await Shops.find({},{password:0});
      // if(!ShopLists || ShopLists.length===0){
      //     return res.status(404).json({message:"No ShopLists found"});
      // }
      try {
        const { state, district, city } = req.query;
        const query = {};
        if (state) {
          query.state = { $regex: new RegExp(state, 'i') }; // Case-insensitive search for state
        }
        if (district) {
          query.district = { $regex: new RegExp(district, 'i') }; // Case-insensitive search for district
        }
        if (city) {
          query.city = { $regex: new RegExp(city, 'i') }; // Case-insensitive search for city
        }
        const shops = await Shops.find(query);
        res.json(shops);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching shops', error });
      }
      // return res.status(200).json(ShopLists);
  } catch (error) {
      // next(error);
      console.log("Error while getting all shops", error);
  }
}

// LOGIC TO GET SINGLE Shop DATA     
exports.getShopById = async(req,res) => {
  try {
      const id = req.params.id;
      const data = await Shops.findOne({_id: id}, {password: 0});
      // const data = await ShopList.findOne({_id: id}, {password: 0});
      return res.status(200).json(data);
      // return res.status(200).json({message:"User updated successfully"});
  } catch (error) {
      next(error)
  }
}

// Function to get shopId from user's email
exports.getShopByEmail = async (req, res) => {
  try {
      const shop = await Shops.findOne({ email: req.params.email });
      if (!shop) {
          return res.status(404).json({ message: 'Shop not found' });
      }
      res.status(200).json(shop);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching shop data', error });
  }
};

// update barber Profile by email
exports.updateBarberProfile = async (req, res) => {
  try {
    const { email } = req.body;  // Assuming the email is sent in the request body
    const updatedData = req.body;

    // Find and update the barber profile by email
    const updatedProfile = await Shops.findOneAndUpdate({ email }, updatedData, { new: true });

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};



