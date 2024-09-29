const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const secret = require("../controllers/auth-config")

const shopSchema = new mongoose.Schema({
    username:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
    },
    phone:{
        type:String,
        require:true,
    },
    password:{
        type:String,
        require:true,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    shopname:{
        type:String,
        require:true,
    },
    state:{
        type:String,
        require:true,
    },
    district:{
        type:String,
        require:true,
    },
    city:{
        type:String,
        require:true,
    },
    street:{
        type:String,
        require:true,
    },
    pin:{
        type:String,
        require:true,
    },
    bankname:{
        type:String,
        require:true,
    },
    bankbranch:{
        type:String,
        require:true,
    },
    ifsc:{
        type:String,
        require:true,
    },
    micr:{
        type:String,
        require:true,
    },
    account:{
        type:String,
        require:true,
    },
    services: [
        {
          service: {
            type: String,
            required: true
          },
          price: {
            type: String,
            required: true
          }
        }
    ]
    
})


// SECURE THE PSW WITH BCRYPT
shopSchema.pre('save',async function(next){
    const shop = this
    if (!shop.isModified("password")) {
        next();
    }
    try {
        const saltRound = await bcrypt.genSalt(10)
        const hash_password = bcrypt.hash(shop.password,saltRound)
        shop.password = hash_password
    } catch (error) {
        next(error)
    }
})

// Compare the password
shopSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password,this.password);
}

// JSON web tokens
shopSchema.methods.generateToken = async function () {
    try {
        return jwt.sign({
            shopId: this._id.toString(),
            email:this.email,
            isAdmin:this.isAdmin,
        },secret.secret,{expiresIn: "1h"});
    } catch (error) {
        console.error(error)
    }
};

const Shop = new mongoose.model("Shop",shopSchema)

module.exports = Shop;


