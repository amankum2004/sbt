// models/donation-model.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donorName: {
        type: String,
        required: [true, 'Donor name is required'],
        trim: true
    },
    donorEmail: {
        type: String,
        required: [true, 'Donor email is required'],
        lowercase: true,
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Donation amount is required'],
        min: [1, 'Donation amount must be at least ₹1']
    },
    message: {
        type: String,
        default: '',
        trim: true
    },
    payment_id: {
        type: String,
        required: true
    },
    order_id: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    donatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);