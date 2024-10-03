// const Shop = require('../models/BarberProfile');

// exports.updateBarberProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedData = req.body;
    
//     // Update barber profile
//     const updatedProfile = await Shop.findByIdAndUpdate(id, updatedData, { new: true });
    
//     if (!updatedProfile) {
//       return res.status(404).json({ message: "Profile not found" });
//     }

//     res.status(200).json(updatedProfile);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating profile", error });
//   }
// };
