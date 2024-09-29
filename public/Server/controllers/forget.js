const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")
const secret =require("./auth-config")
const User = require("../models/user-model")


app.post("/forget", async(req,res) => {
    const {email} = req.body;

    try{
        const user = User.findOne({email})
        if(!user){
            return res.json({status: "User not exist for this email !!"});
        }
        const secr = secret.secret + user.password;
        const token = jwt.sign({email: user.email, id: user._id},secr,{expiresIn:"5m"});
        const link = `http://localhost:27017/reset-password/${user._id}/${token}`;
        console.log(link);
    }catch(error){

    }
});

app.get("/reset-password/:id/:token", async(req,res) => {
    const {id,token} = req.params;
    console.log(params);
    // res.send("Done")
    const user = await User.findOne({ _id: id });
    if (!user) {
        return res.json({ status: "User Not Exists!!" });
    }
    const secr = secret.secret + user.password;
    try {
        const verify = jwt.verify(token, secr);
        res.render("index", { email: verify.email, status: "Not Verified" });
    } catch (error) {
        console.log(error);
        res.send("Not Verified");
  }
})





