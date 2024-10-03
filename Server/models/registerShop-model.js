const mongoose = require("mongoose")
// const bcrypt = require("bcrypt")
// const jwt = require("jsonwebtoken")

const shopSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    shopname:{
        type:String,
        required:true,
    },
    state:{
        type:String,
        required:true,
    },
    district:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
    street:{
        type:String,
        required:true,
    },
    pin:{
        type:String,
        required:true,
    },
    bankname:{
        type:String,
        required:true,
    },
    bankbranch:{
        type:String,
        required:true,
    },
    ifsc:{
        type:String,
        required:true,
    },
    micr:{
        type:String,
        required:true,
    },
    account:{
        type:String,
        required:true,
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

const Shop = new mongoose.model("Shop",shopSchema)

module.exports = Shop;

// shopSchema.pre('save',async function(next){
//     const shop = this
//     if (!shop.isModified("password")) {
//         next();
//     }
//     try {
//         const saltRound = await bcrypt.genSalt(10)
//         const hash_password = bcrypt.hash(shop.password,saltRound)
//         shop.password = hash_password
//     } catch (error) {
//         next(error)
//     }
// })

// shopSchema.methods.comparePassword = async function(password) {
//     return bcrypt.compare(password,this.password);
// }

// shopSchema.methods.generateToken = async function () {
//     try {
//         return jwt.sign({
//             shopId: this._id.toString(),
//             email:this.email,
//             isAdmin:this.isAdmin,
//         },secret.secret,{expiresIn: "1h"});
//     } catch (error) {
//         console.error(error)
//     }
// };



