const mongoose=require('mongoose');
const jwt = require("jsonwebtoken")
const secret = require("../controllers/auth-config")

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    userType:{
        type:String,
        default: "customer",
        enum: ['customer', 'shopOwner'],
    }
});


// JSON web tokens
UserSchema.methods.generateToken = async function () {
    try {
        return jwt.sign({
            userId: this._id.toString(),
            email:this.email,
            isAdmin:this.isAdmin,
        },secret.secret,{expiresIn: "1h"});
    } catch (error) {
        console.error(error)
    }
};

const User = mongoose.model('User',UserSchema);


module.exports=User;

