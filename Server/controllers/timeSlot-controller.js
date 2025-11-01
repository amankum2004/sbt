const TimeSlot = require('../models/timeSlot-model');
const Template = require('../models/timeSlotTemplate-model');
// const moment = require("moment");
const mongoose = require('mongoose');
const moment = require('moment-timezone');
// const Shops = require('../models/timeSlot-model')
// const {getShopByEmail} = require('../controllers/registerShop-controller')


// TimeSlots CRUD Operations

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


// Template CRUD Operations
exports.createTemplate = async (req, res) => {
  try {
    const template = await Template.create(req.body);

    // Trigger immediate generation for next 7 days with timezone
    await exports.generateSlotsFor7Days(template);

    res.status(201).json({
      success: true,  // Make sure this is included
      data: template,
      message: 'Template created successfully and time slots generated'
    });
    // res.status(201).json(template);
  } catch (err) {
    console.error("Template creation failed:", err);
    res.status(500).json({ 
      success: false,  // Make sure this is included
      error: "Failed to create template" 
    });
    // res.status(500).json({ error: "Failed to create template" });
  }
};


exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('🔄 Updating template with ID:', id);
        console.log('📝 Update data:', updateData);

        // Get the old template first to compare changes
        const oldTemplate = await Template.findById(id);
        if (!oldTemplate) {
            return res.status(404).json({ 
                success: false, 
                message: 'Template not found' 
            });
        }

        console.log('📋 Old template working days:', oldTemplate.workingDays);
        console.log('📋 New template working days:', updateData.workingDays);

        // Check if working days changed
        const workingDaysChanged = 
            JSON.stringify(oldTemplate.workingDays.sort()) !== 
            JSON.stringify(updateData.workingDays.sort());

        // Update the template
        const updatedTemplate = await Template.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true,
                runValidators: true 
            }
        );

        console.log('✅ Template updated successfully');

        // Trigger slot regeneration with the updated template
        console.log('🔄 Starting slot regeneration...');
        const regenerationResult = await exports.generateSlotsFor7Days(updatedTemplate);

        let message = 'Template updated successfully';
        if (workingDaysChanged) {
            const oldDaysCount = oldTemplate.workingDays.length;
            const newDaysCount = updatedTemplate.workingDays.length;
            message += `. Working days changed from ${oldDaysCount} to ${newDaysCount} days.`;
            
            if (regenerationResult.deletedSlotsForNonWorkingDays > 0) {
                message += ` Removed ${regenerationResult.deletedSlotsForNonWorkingDays} slots for non-working days.`;
            }
        }

        message += ` Generated ${regenerationResult.totalSlotsCreated} new time slots.`;

        res.status(200).json({
            success: true,
            data: updatedTemplate,
            regenerationResult: regenerationResult,
            workingDaysChanged: workingDaysChanged,
            message: message
        });

    } catch (error) {
        console.error('❌ Error updating template:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating template',
            error: error.message
        });
    }
};

// exports.updateTemplate = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updateData = req.body;

//         console.log('🔄 Updating template with ID:', id);
//         console.log('📝 Update data:', updateData);

//         // First, check if the ID is valid
//         if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//             console.log('❌ Invalid template ID format:', id);
//             return res.status(400).json({ 
//                 success: false, 
//                 message: 'Invalid template ID format' 
//             });
//         }

//          // Try to find the template first to see if it exists
//         const existingTemplate = await Template.findById(id);

//         if (!existingTemplate) {
//             console.log('❌ Template not found with ID:', id);
//             // Let's see what templates exist for this shop
//             const shopTemplates = await Template.find({ shop_owner_id: updateData.shop_owner_id });
//             console.log('🔍 Available templates for this shop:', shopTemplates.map(t => ({
//                 _id: t._id,
//                 workingDays: t.workingDays
//             })));
            
//             return res.status(404).json({ 
//                 success: false, 
//                 message: `Template not found with ID: ${id}`,
//                 availableTemplates: shopTemplates.map(t => t._id)
//             });
//         }

//         console.log('✅ Found existing template:', {
//             _id: existingTemplate._id,
//             workingDays: existingTemplate.workingDays,
//             startTime: existingTemplate.startTime,
//             endTime: existingTemplate.endTime,
//             slotInterval: existingTemplate.slotInterval
//         });

//         // Update the template
//         const updatedTemplate = await Template.findByIdAndUpdate(
//             id,
//             updateData,
//             { 
//                 new: true,
//                 runValidators: true 
//             }
//         );

//         console.log('✅ Template updated successfully');
//         console.log('📋 Updated template:', {
//             workingDays: updatedTemplate.workingDays,
//             startTime: updatedTemplate.startTime,
//             endTime: updatedTemplate.endTime,
//             slotInterval: updatedTemplate.slotInterval
//         });

//         // Trigger slot regeneration with the updated template
//         console.log('🔄 Starting slot regeneration...');
//         const regenerationResult = await exports.generateSlotsFor7Days(updatedTemplate);

//         res.status(200).json({
//             success: true,
//             data: updatedTemplate,
//             regenerationResult: regenerationResult,
//             message: 'Template updated successfully and time slots regenerated'
//         });

//     } catch (error) {
//         console.error('❌ Error updating template:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error updating template',
//             error: error.message
//         });
//     }
// };

// In your timeSlot-controller.js
exports.getTemplateByShopId = async (req, res) => {
    try {
        const { shopId } = req.params;

        console.log('🔍 Searching for template with shop ID:', shopId);

        // Validate shop ID
        if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shop ID format'
            });
        }

        // Find template by shop_owner_id
        const template = await Template.findOne({ shop_owner_id: shopId });

        if (!template) {
            console.log('❌ No template found for shop ID:', shopId);
            return res.status(404).json({
                success: false,
                message: 'No template found for this shop'
            });
        }

        console.log('✅ Template found:', {
            _id: template._id,
            shop_owner_id: template.shop_owner_id,
            workingDays: template.workingDays,
            startTime: template.startTime,
            endTime: template.endTime,
            slotInterval: template.slotInterval
        });

        res.status(200).json({
            success: true,
            data: template,
            message: 'Template found successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching template by shop ID:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching template',
            error: error.message
        });
    }
};



// AUTOMATIC TIMESLOT CREATION  
const generateShowtimes = (date, startTime, endTime, slotInterval, timezone = 'Asia/Kolkata') => {
  const showtimes = [];
  
  console.log('🕒 Generating showtimes with:', { date, startTime, endTime, slotInterval, timezone });
  
  // Use timezone-aware parsing
  const start = moment.tz(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm', timezone);
  const end = moment.tz(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm', timezone);

  console.log('📅 Parsed times - Start:', start.format(), 'End:', end.format());
  console.log('⏱️ Time difference (minutes):', end.diff(start, 'minutes'));

  if (!start.isValid() || !end.isValid()) {
    console.error('❌ Invalid times:', { startValid: start.isValid(), endValid: end.isValid() });
    throw new Error("Invalid startTime or endTime format");
  }

  if (start >= end) {
    console.error('❌ Start time is after end time');
    return [];
  }

  let slotCount = 0;
  const current = start.clone();
  
  while (current < end) {
    showtimes.push({ 
      date: current.clone().utc().toDate(),
      is_booked: false 
    });
    current.add(slotInterval, "minutes");
    slotCount++;
    
    // Safety check to prevent infinite loop
    if (slotCount > 500) {
      console.error('❌ Too many slots, breaking loop');
      break;
    }
  }

  console.log(`✅ Generated ${slotCount} slots`);
  
  if (showtimes.length > 0) {
    console.log('📊 First slot:', moment(showtimes[0].date).format('YYYY-MM-DD HH:mm'));
    console.log('📊 Last slot:', moment(showtimes[showtimes.length-1].date).format('YYYY-MM-DD HH:mm'));
  } else {
    console.log('❌ No slots generated!');
  }

  return showtimes;
};


exports.generateSlotsFor7Days = async (singleTemplate = null) => {
  try {
    const templates = singleTemplate ? [singleTemplate] : await Template.find();
    const today = moment().tz('Asia/Kolkata').startOf("day");
    const cutoffFuture = today.clone().add(7, "days").endOf("day");

    console.log('🔍 Starting slot regeneration process...');
    console.log('📅 Date range:', today.format('YYYY-MM-DD'), 'to', cutoffFuture.format('YYYY-MM-DD'));
    console.log('🏪 Templates to process:', templates.length);

    let totalSlotsCreated = 0;
    let totalDaysProcessed = 0;
    let deletedSlotsCount = 0;

    for (let template of templates) {
      console.log(`\n🔄 Processing template for shop: ${template.shop_owner_id}`);
      console.log('📋 Template working days:', template.workingDays);
      console.log('⏰ Template times:', {
        startTime: template.startTime,
        endTime: template.endTime,
        slotInterval: template.slotInterval
      });

      // Step 1: Delete time slots for days that are no longer working days
      const futureSlots = await TimeSlot.find({
        shop_owner_id: template.shop_owner_id,
        date: { 
          $gte: today.utc().toDate(),
          $lte: cutoffFuture.utc().toDate()
        }
      });

      console.log(`🔍 Found ${futureSlots.length} existing future slots`);

      // Identify slots to delete (for days that are no longer working days)
      const slotsToDelete = [];
      for (let slot of futureSlots) {
        const slotDate = moment(slot.date).tz('Asia/Kolkata');
        const dayName = slotDate.format("dddd");
        const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        
        if (!template.workingDays.includes(capitalizedDayName)) {
          slotsToDelete.push(slot._id);
          console.log(`🗑️ Marking slot for deletion: ${slotDate.format('YYYY-MM-DD')} (${capitalizedDayName}) - no longer a working day`);
        }
      }

      // Delete the identified slots
      if (slotsToDelete.length > 0) {
        const deleteResult = await TimeSlot.deleteMany({
          _id: { $in: slotsToDelete }
        });
        deletedSlotsCount += deleteResult.deletedCount;
        console.log(`✅ Deleted ${deleteResult.deletedCount} slots for non-working days`);
      }

      // Step 2: Generate new slots for current working days
      for (let i = 0; i < 7; i++) {
        const targetDate = today.clone().add(i, "days");
        const dayName = targetDate.format("dddd");
        const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        const dateString = targetDate.format("YYYY-MM-DD");

        console.log(`\n📅 Checking ${dateString} (${capitalizedDayName})`);

        if (!template.workingDays.includes(capitalizedDayName)) {
          console.log(`⏭️ Skipping ${dateString} (${capitalizedDayName}) - not a working day`);
          continue;
        }

        console.log(`✅ ${dateString} (${capitalizedDayName}) is a working day! Processing...`);

        const dateISO = targetDate.format("YYYY-MM-DD");
        const utcDate = targetDate.utc().startOf('day').toDate();

        let timeslotDoc = await TimeSlot.findOne({
          shop_owner_id: template.shop_owner_id,
          date: utcDate
        });

        console.log('🔍 Existing timeslot document:', timeslotDoc ? `Found (${timeslotDoc._id})` : 'Not found');

        const newShowtimes = generateShowtimes(
          dateISO,
          template.startTime,
          template.endTime,
          template.slotInterval,
          'Asia/Kolkata'
        );

        console.log(`🕒 Generated ${newShowtimes.length} slots for ${dateString}`);

        if (!timeslotDoc) {
          const newTimeslot = await TimeSlot.create({
            shop_owner_id: template.shop_owner_id,
            name: template.name,
            email: template.email,
            phone: template.phone,
            date: utcDate,
            showtimes: newShowtimes
          });
          console.log('✅ Created new timeslot document:', newTimeslot._id);
          totalSlotsCreated += newShowtimes.length;
        } else {
          // Replace all showtimes with new ones (in case times changed)
          timeslotDoc.showtimes = newShowtimes;
          const savedDoc = await timeslotDoc.save();
          console.log('✅ Updated existing timeslot document:', savedDoc._id);
          totalSlotsCreated += newShowtimes.length;
        }
        
        totalDaysProcessed++;
      }
    }
    
    console.log(`\n🎉 Slot regeneration completed!`);
    console.log(`📊 Summary: ${totalDaysProcessed} days processed, ${totalSlotsCreated} total slots created/updated`);
    console.log(`🗑️ Deleted ${deletedSlotsCount} slots for non-working days`);
    
    return {
      success: true,
      deletedSlotsForNonWorkingDays: deletedSlotsCount,
      templatesProcessed: templates.length,
      daysProcessed: totalDaysProcessed,
      totalSlotsCreated: totalSlotsCreated
    };
  } catch (error) {
    console.error("❌ Slot generation failed:", error);
    throw error;
  }
};

// exports.generateSlotsFor7Days = async (singleTemplate = null) => {
//   try {
//     const templates = singleTemplate ? [singleTemplate] : await Template.find();
//     const today = moment().tz('Asia/Kolkata').startOf("day");
//     const cutoffFuture = today.clone().add(7, "days").endOf("day");

//     console.log('🔍 Starting slot regeneration process...');
//     console.log('📅 Date range:', today.format('YYYY-MM-DD'), 'to', cutoffFuture.format('YYYY-MM-DD'));
//     console.log('🏪 Templates to process:', templates.length);

//     // Delete outdated or extra future slots for the specific template(s)
//     const shopOwnerIds = templates.map(t => t.shop_owner_id);
    
//     console.log('🗑️ Deleting old slots for shop IDs:', shopOwnerIds);
    
//     const deleteResult = await TimeSlot.deleteMany({
//       shop_owner_id: { $in: shopOwnerIds },
//       $or: [
//         { date: { $lt: today.utc().toDate() } },
//         { date: { $gt: cutoffFuture.utc().toDate() } }
//       ]
//     });

//     console.log('✅ Deleted old slots count:', deleteResult.deletedCount);

//     let totalSlotsCreated = 0;
//     let totalDaysProcessed = 0;

//     const normalizeDayName = (dayName) => {
//       return dayName.toLowerCase();
//     };

//     for (let template of templates) {
//       console.log(`\n🔄 Processing template for shop: ${template.shop_owner_id}`);
//       console.log('📋 Template details:', {
//         workingDays: template.workingDays,
//         startTime: template.startTime,
//         endTime: template.endTime,
//         slotInterval: template.slotInterval
//       });
      
//       for (let i = 0; i < 7; i++) {
//         const targetDate = today.clone().add(i, "days");
//         const dayName = targetDate.format("dddd"); // This returns "sunday", "monday", etc (lowercase)
//         const normalizedDayName = normalizeDayName(dayName);
//         const normalizedWorkingDays = template.workingDays.map(day => normalizeDayName(day));
        
//         // const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1); // Capitalize it
//         const dateString = targetDate.format("YYYY-MM-DD");
//         // console.log(`📅 Checking ${dateString} (${dayName} -> ${capitalizedDayName}) against:`, template.workingDays);
        
//         console.log(`📅 Checking ${dateString} (${dayName}) against:`, template.workingDays);
//         console.log(`🔍 Normalized: ${normalizedDayName} vs`, normalizedWorkingDays);

//         if (!normalizedWorkingDays.includes(normalizedDayName)) {
//           console.log(`⏭️ Skipping ${dateString} (${dayName}) - not in working days`);
//           continue;
//         }

//         const dateISO = targetDate.format("YYYY-MM-DD");
//         const utcDate = targetDate.utc().startOf('day').toDate();

//         let timeslotDoc = await TimeSlot.findOne({
//           shop_owner_id: template.shop_owner_id,
//           date: utcDate
//         });

//         console.log('🔍 Existing timeslot document:', timeslotDoc ? 'Found' : 'Not found');

//         const newShowtimes = generateShowtimes(
//           dateISO,
//           template.startTime,
//           template.endTime,
//           template.slotInterval,
//           'Asia/Kolkata'
//         );

//         console.log(`🕒 Generated ${newShowtimes.length} slots for ${dateString}`);
        
//         if (newShowtimes.length > 0) {
//           console.log('📊 Sample slots:', newShowtimes.slice(0, 3).map(s => 
//             moment(s.date).format('HH:mm')
//           ));
//         } else {
//           console.log('❌ No slots generated! Check time range and interval');
//         }

//         if (!timeslotDoc) {
//           const newTimeslot = await TimeSlot.create({
//             shop_owner_id: template.shop_owner_id,
//             name: template.name,
//             email: template.email,
//             phone: template.phone,
//             date: utcDate,
//             showtimes: newShowtimes
//           });
//           console.log('✅ Created new timeslot document:', newTimeslot._id);
//           console.log('📄 Document details:', {
//             date: newTimeslot.date,
//             showtimesCount: newTimeslot.showtimes.length
//           });
//           totalSlotsCreated += newShowtimes.length;
//         } else {
//           // Replace all showtimes with new ones
//           timeslotDoc.showtimes = newShowtimes;
//           const savedDoc = await timeslotDoc.save();
//           console.log('✅ Updated existing timeslot document:', savedDoc._id);
//           console.log('📄 Updated details:', {
//             date: savedDoc.date,
//             showtimesCount: savedDoc.showtimes.length
//           });
//           totalSlotsCreated += newShowtimes.length;
//         }
        
//         totalDaysProcessed++;
//       }
//     }
    
//     console.log(`\n🎉 Slot regeneration completed!`);
//     console.log(`📊 Summary: ${totalDaysProcessed} days processed, ${totalSlotsCreated} total slots created/updated`);
    
//     return {
//       success: true,
//       deletedOldOrExtraSlots: deleteResult.deletedCount,
//       templatesProcessed: templates.length,
//       daysProcessed: totalDaysProcessed,
//       totalSlotsCreated: totalSlotsCreated
//     };
//   } catch (error) {
//     console.error("❌ Slot generation failed:", error);
//     throw error;
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



