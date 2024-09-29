const Appointment = require('../models/appointment-model');
const TimeSlot = require('../models/timeSlot-model');

exports.bookAppointment = async (req, res) => {
  const { username, email, phone, shop_owner_id } = req.body;
  // const { username, email, phone, shop_owner_id, shopname, time_slot_id } = req.body;
  try {
    const id = req.params.id;
    const timeSlot = await TimeSlot.findOne({_id: id});
    console.log("timeSlot",timeSlot)
    // const timeSlot = await TimeSlot.findById();
    if (!timeSlot || timeSlot.is_booked) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    const newAppointment = new Appointment({
      username,
      email,
      phone,
      shop_owner_id,
      // shopname,
      // time_slot_id,
    });
    timeSlot.is_booked = true;

    await newAppointment.save();
    await timeSlot.save();
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (error) {
    console.log("Eror from appointment controller")
    res.status(500).json({ message: error.message });
  }
};
