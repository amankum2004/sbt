const Shops = require("../models/registerShop-model")
const User = require("../models/user/user-model")
const bcrypt = require("bcrypt")
const Appointment = require("../models/appointment-model")
const { sendShopStatusNotification } = require("../utils/mail");


exports.registershop = async (req, res, next) => {
  try {
    const {
      name, email, phone, password,
      shopname, state, district, city, street, pin,
      services,
      lat, lng,
      latString, lngString // Add the new string coordinates
    } = req.body;

    // Required fields for all cases
    const requiredFields = [
      'name', 'email', 'phone', 'shopname', 'state', 'district',
      'city', 'street', 'pin', 'services'
    ];

    // Validate required fields including coordinates
    if (!lat || !lng) {
      return res.status(400).json({
        message: "Shop location coordinates are required"
      });
    }

    // Use string coordinates if provided, otherwise convert number coordinates to strings
    const finalLatString = latString || lat.toString();
    const finalLngString = lngString || lng.toString();

    // Validate coordinate ranges for number coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        message: "Invalid coordinates provided"
      });
    }

    // Validate string coordinates format
    const latRegex = /^-?\d{1,3}\.\d+$/;
    const lngRegex = /^-?\d{1,3}\.\d+$/;
    
    if (!latRegex.test(finalLatString) || !lngRegex.test(finalLngString)) {
      return res.status(400).json({
        message: "Invalid coordinate format"
      });
    }

    // Check for missing required fields
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(200).json({
          success: false,
          message: `${field} is required`,
          extraDetails: `Missing required field: ${field}`
        });
      }
    }

    // Check if shop with this email already exists
    const shopExists = await Shops.findOne({ email });
    if (shopExists) {
      return res.status(200).json({
        success: false,
        message: "Shop with this email already exists"
      });
    }

    // For non-admin registrations (regular shop owners)
    let hash_password;
    if (password) {
      // Verify user credentials only for shop owners (not for admin-created shops)
      const userExist = await User.findOne({ email });
      if (!userExist) {
        return res.status(200).json({
          success: false,
          message: "No user found with this email"
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, userExist.password);
      if (!isPasswordValid) {
        return res.status(200).json({
          success: false,
          message: "Invalid password"
        });
      }

      // Hash the password before saving
      const saltRound = 10;
      hash_password = await bcrypt.hash(password, saltRound);
    }

    // Create the shop (works for both admin and shop owner cases)
    const newShop = await Shops.create({
      name,
      email,
      phone,
      password: hash_password || undefined, // Only store password for shop owners
      shopname,
      state,
      district,
      city,
      street,
      pin,
      services,
      // Store as numbers for backward compatibility
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      // Store as strings for full precision
      latString: finalLatString,
      lngString: finalLngString,
      isApproved: !password // Auto-approve if created by admin (no password)
    });

    console.log("Shop registered with full precision coordinates:", {
      latNumber: newShop.lat,
      lngNumber: newShop.lng,
      latString: newShop.latString,
      lngString: newShop.lngString,
      stringLength: {
        lat: newShop.latString.length,
        lng: newShop.lngString.length
      }
    });

    return res.status(201).json({
      success: true,
      message: password 
        ? "Shop registered successfully. Awaiting admin approval."
        : "Shop created by admin successfully",
      data: {
        shopId: newShop._id,
        name: newShop.name,
        email: newShop.email,
        isApproved: newShop.isApproved,
        location: {
          lat: newShop.lat,
          lng: newShop.lng,
          latString: newShop.latString, // Include string coordinates in response
          lngString: newShop.lngString
        }
      }
    });

  } catch (err) {
    console.error("Shop registration error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

// Check if shop exists by email
exports.checkShopExists = async (req, res) => {
  try {
    const { email } = req.params;

    const shop = await Shops.findOne({ email: email.toLowerCase() });
    
    if (shop) {
      return res.status(200).json({ 
        exists: true, 
        shop: shop,
        isApproved: shop.isApproved 
      });
    } else {
      return res.status(200).json({ 
        exists: false 
      });
    }
  } catch (error) {
    console.error("Error checking shop existence:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Get all approved shops (for customers)
exports.getAllApprovedShops = async(req, res) => {
  try {
    const { state, district, city } = req.query;
    const query = { isApproved: true }; // Only fetch approved shops
    
    if (state) {
      query.state = { $regex: new RegExp(state, 'i') };
    }
    if (district) {
      query.district = { $regex: new RegExp(district, 'i') };
    }
    if (city) {
      query.city = { $regex: new RegExp(city, 'i') };
    }

    const shops = await Shops.find(query);
    if(!shops || shops.length === 0) {
      return res.status(200).json({ 
        message: 'No approved shops found' 
      });
    }

    res.json(shops);
  } catch (error) {
    console.log("Error while getting all shops", error);
    res.status(500).json({ 
      message: 'Error fetching shops',
      error: error.message // Better to send the error message
    });
  }
}

// LOGIC TO GET SINGLE Shop DATA     
exports.getShopById = async(req,res) => {
  try {
      const id = req.params.id;
      const data = await Shops.findOne({_id: id}, {password: 0});
      return res.status(200).json(data);
      // return res.status(200).json({message:"User updated successfully"});
    } catch (error) {
      next(error)
    }
  }
  
  // Function to get shopId from user's email
  exports.getShopByEmail = async (req, res) => {
    try {
      const email = req.params.email;
      const shop = await Shops.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      
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



// Update shop status
exports.updateShopStatus = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['open', 'closed', 'break'].includes(status)) {
      return res.status(200).json({
        success: false,
        message: 'Invalid status. Must be: open, closed, or break'
      });
    }

    const updatedShop = await Shops.findByIdAndUpdate(
      shopId,
      { 
        status,
        statusLastUpdated: new Date()
      },
      { new: true }
    );

    if (!updatedShop) {
      return res.status(200).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Notify customers with upcoming appointments
    await notifyCustomersAboutStatusChange(updatedShop, status);

    res.status(200).json({
      success: true,
      message: `Shop status updated to ${status}`,
      data: {
        shopId: updatedShop._id,
        status: updatedShop.status,
        statusLastUpdated: updatedShop.statusLastUpdated
      }
    });

  } catch (error) {
    console.error('Error updating shop status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get shop status
exports.getShopStatus = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shops.findById(shopId).select('status statusLastUpdated shopname name');
    
    if (!shop) {
      return res.status(200).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: shop.status,
        statusLastUpdated: shop.statusLastUpdated,
        shopname: shop.shopname,
        name: shop.name
      }
    });

  } catch (error) {
    console.error('Error fetching shop status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to notify customers
const notifyCustomersAboutStatusChange = async (shop, newStatus) => {
  try {
    // Find upcoming appointments for this shop (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingAppointments = await Appointment.find({
      shopId: shop._id,
      'showtimes.date': { 
        $gte: new Date(), 
        $lte: sevenDaysFromNow 
      },
      status: { $in: ['confirmed', 'pending'] }
    }).populate('userId', 'email name');

    if (upcomingAppointments.length === 0) {
      console.log('No upcoming appointments to notify');
      return;
    }

    // Send email notifications
    for (const appointment of upcomingAppointments) {
      await sendShopStatusNotification(
        appointment.userId.email,
        appointment.userId.name,
        shop.shopname,
        newStatus,
        appointment.showtimes[0]?.date
      );
    }

    console.log(`Notified ${upcomingAppointments.length} customers about shop status change`);

  } catch (error) {
    console.error('Error notifying customers:', error);
  }
};




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