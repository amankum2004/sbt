const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true, // Ensure phone numbers are unique
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    usertype: {
        type: String,
        default: "customer",
        enum: ['customer', 'shopOwner', 'admin']
    }
}, {timestamps: true});

// Add index for phone field for faster queries
UserSchema.index({ phone: 1 });

const User = mongoose.model('User', UserSchema);
module.exports = User;



