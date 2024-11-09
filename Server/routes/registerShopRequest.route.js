// // routes/shopRegistration.js
// const express = require('express');
// const router = express.Router();
// const ShopRegistrationRequest = require('../models/registerShopRequest-model');
// const Shop = require('../models/registerShop-model');

// // Endpoint for shop owners to submit registration requests
// router.post('/register-shop', async (req, res) => {
//     try {
//         const request = new ShopRegistrationRequest(req.body);
//         await request.save();
//         res.status(201).json({ message: 'Shop registration request submitted successfully. Awaiting admin approval.' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error submitting registration request.', error });
//     }
// });

// // Endpoint for admin to approve a shop registration request
// router.post('/approve-shop/:id', async (req, res) => {
//     try {
//         const requestId = req.params.id;
//         const request = await ShopRegistrationRequest.findById(requestId);

//         if (!request) {
//             return res.status(404).json({ message: 'Registration request not found.' });
//         }

//         if (req.body.approve) {
//             const newShop = new Shop({
//                 name: request.name,
//                 email: request.email,
//                 phone: request.phone,
//                 password: request.password,
//                 shopname: request.shopname,
//                 state: request.state,
//                 district: request.district,
//                 city: request.city,
//                 street: request.street,
//                 pin: request.pin,
//                 bankname: request.bankname,
//                 bankbranch: request.bankbranch,
//                 ifsc: request.ifsc,
//                 micr: request.micr,
//                 account: request.account,
//                 services: request.services,
//             });

//             await newShop.save();
//             await ShopRegistrationRequest.findByIdAndDelete(requestId);

//             res.status(200).json({ message: 'Shop registration approved and saved to the database.' });
//         } else {
//             await ShopRegistrationRequest.findByIdAndDelete(requestId);
//             res.status(200).json({ message: 'Shop registration request rejected.' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Error processing registration request.', error });
//     }
// });

// module.exports = router;
