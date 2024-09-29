const TimeSlot = require('../models/timeSlot-model');
// const Shops = require('../models/timeSlot-model')
// const {getShopByEmail} = require('../controllers/registerShop-controller')

// exports.createTimeSlot = async (req, res) => {
//   // const { shop_owner_id, start_time, end_time } = req.body;
//   const {shop_owner_id, name, email, phone, date ,showtimes} = req.body;
//   try {
//     // const newTimeSlot = new TimeSlot({ shop_owner_id, start_time, end_time });
//     const newTimeSlot = new TimeSlot({shop_owner_id, name, email, phone, date, showtimes });
//     await newTimeSlot.save();
//     res.status(201).json({ message: 'Time slot created successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getTimeSlots = async (req, res) => {
//   try {
//     // const  id  = req.params.id;
//     // const timeSlots = await TimeSlot.find({}, {is_booked: false });
//     const timeSlots = await TimeSlot.find();
//     if(!timeSlots || timeSlots.length===0){
//       return res.status(404).json({message:"No time slots found"});
//     }
//     console.log(timeSlots);
//     res.status(200).json(timeSlots);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.updateTimeSlot = async (req, res) => {
//   const { id } = req.params
//   try {
//     const updatedTimeSlot = await TimeSlot.findByIdAndUpdate(id, req.body, {
//       new: true
//     })
//     res.json(updatedTimeSlot)
//   } catch (error) {
//     console.error('Error updating time:', error)
//     res.status(500).json({ error: 'Error updating time' })
//   }
// }

// exports.deleteTimeSlot = async (req, res) => {
//   try {
//     const timeId = req.params.id
//     const result = await TimeSlot.findByIdAndDelete(timeId)

//     res.json(result)
//   } catch (error) {
//     console.error('Error deleting timeSlot:', error)
//     res.status(500).json({ error: 'Error deleting timeSlot' })
//   }
// }


exports.createTimeSlot = async (req, res) => {
  try {
    const { shop_owner_id, name, email, phone, date, showtimes } = req.body;

    // Get the shopId using the user's email
    // const shopId = await getShopByEmail(email);

    const newTimeSlot = new TimeSlot({
      shop_owner_id,
      name,
      email,
      phone,
      date,
      showtimes
    });

    const savedTimeSlot = await newTimeSlot.save();
    res.status(201).json(savedTimeSlot);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create time slot', error });
  }
};

// exports.getTimeSlots = async (req, res) => {
//   try {
//     const { shopOwnerId } = req.params;
//     const timeSlots = await TimeSlot.find({ shop_owner_id: shopOwnerId });
//     res.status(200).json(timeSlots);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to retrieve time slots', error });
//   }
// };

exports.getTimeSlots = async (req, res) => {
  try {
    const { shopOwnerId } = req.params;

    // Check if shopOwnerId is provided
    if (!shopOwnerId) {
      return res.status(400).json({ message: 'shopOwnerId is required' });
    }
    // Find all time slots for the shop owner
    const timeSlots = await TimeSlot.find({ shop_owner_id: shopOwnerId });
    if (!timeSlots || timeSlots.length === 0) {
      return res.status(404).json({ message: 'No time slots found for this shop' });
    }
    console.log('shopOwnerId:', shopOwnerId);
    res.status(200).json(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({ message: 'Failed to fetch time slots', error: error.message });
  }
};


// exports.getTimeSlots = async (req, res) => {
//   try {
//     const { shopOwnerId, date } = req.query;

//     // Find all time slots for the shop owner on the given date
//     const timeSlots = await TimeSlot.findOne({
//       shop_owner_id: shopOwnerId,
//       date: new Date(date)
//     });

//     if (!timeSlots) {
//       return res.status(404).json({ message: 'No time slots found for the selected date.' });
//     }

//     // Filter out booked showtimes
//     const availableShowtimes = timeSlots.flatMap((slot) =>
//       slot.showtimes.filter((showtime) => !showtime.is_booked)
//     );

//     res.status(200).json(availableShowtimes);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch available showtimes', error });
//   }
// };

// // Book a specific showtime
// exports.bookShowtime = async (req, res) => {
//   try {
//     const { slotId, showtimeId } = req.body;

//     // Find the time slot and the specific showtime
//     const timeSlot = await TimeSlot.findById(slotId);
//     if (!timeSlot) {
//       return res.status(404).json({ message: 'Time slot not found' });
//     }

//     const showtime = timeSlot.showtimes.id(showtimeId);
//     if (!showtime) {
//       return res.status(404).json({ message: 'Showtime not found' });
//     }

//     if (showtime.is_booked) {
//       return res.status(400).json({ message: 'Showtime already booked' });
//     }

//     // Mark the showtime as booked
//     showtime.is_booked = true;
//     await timeSlot.save();

//     res.status(200).json({ message: 'Showtime booked successfully', showtime });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to book showtime', error });
//   }
// };

// Get a specific time slot by ID
exports.getTimeSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const timeSlot = await TimeSlot.findById(id);
    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }
    res.status(200).json(timeSlot);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve time slot', error });
  }
};

// Update a time slot by ID
exports.updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTimeSlot = await TimeSlot.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedTimeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }
    res.status(200).json(updatedTimeSlot);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update time slot', error });
  }
};

// Delete a time slot by ID
exports.deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTimeSlot = await TimeSlot.findByIdAndDelete(id);
    if (!deletedTimeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }
    res.status(200).json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete time slot', error });
  }
};



