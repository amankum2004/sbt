// // models/ShopRegistrationRequest.js
// const mongoose = require('mongoose');

// const shopRegistrationRequestSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//     password: { type: String, required: true },
//     shopname: { type: String, required: true },
//     state: { type: String, required: true },
//     district: { type: String, required: true },
//     city: { type: String, required: true },
//     street: { type: String, required: true },
//     pin: { type: String, required: true },
//     bankname: { type: String, required: true },
//     bankbranch: { type: String, required: true },
//     ifsc: { type: String, required: true },
//     micr: { type: String, required: true },
//     account: { type: String, required: true },
//     services: [
//         {
//             service: { type: String, required: true },
//             price: { type: String, required: true }
//         }
//     ],
//     isApproved: { type: Boolean, default: false },
//     createdAt: { type: Date, default: Date.now }
// });

// const ShopRegistrationRequest = mongoose.model('ShopRegistrationRequest', shopRegistrationRequestSchema);

// module.exports = ShopRegistrationRequest;
