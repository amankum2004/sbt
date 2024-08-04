const TimeSlot = require('../models/timeSlot-model');

exports.createTimeSlot = async (req, res) => {
  // const { shop_owner_id, start_time, end_time } = req.body;
  const {username, email, phone, start_time, end_time } = req.body;
  try {
    // const newTimeSlot = new TimeSlot({ shop_owner_id, start_time, end_time });
    const newTimeSlot = new TimeSlot({username, email, phone, start_time, end_time });
    await newTimeSlot.save();
    res.status(201).json({ message: 'Time slot created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const  id  = req.params.id;
    const timeSlots = await TimeSlot.find({}, {is_booked: false });
    if(!timeSlots || timeSlots.length===0){
      return res.status(404).json({message:"No time slots found"});
    }
    console.log(timeSlots);
    res.status(200).json(timeSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
