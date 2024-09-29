const {z} = require("zod")

const loginSchema = z.object({
    email:z
    .string({required_error:"Email is required"})
    .trim()
    .email({message:"Invalid email address"})
    .min(9,{message: "Email must be of atleast 9 characters" })
    .max(50,{message:"Email must not have more than 50 characters"}),

    password:z
    .string({required_error:"Password is required"})
    .min(6,{message: "password must be of atleast 6 characters" })
    .max(50,{message:"Password must not have more than 50 characters"})

})

// Creating an object Schema
const signupSchema = loginSchema.extend({
    username:z
    .string({required_error:"Name is required"})
    .trim()
    .min(2,{message: "Name must be of atleast 2 characters" })
    .max(50,{message:"Name must not have more than 50 characters"}),
    
    phone:z
    .string({required_error:"Phone is required"})
    .trim()
    .min(10,{message: "phone must be of atleast 10 characters" })
    .max(12,{message:"phone must not have more than 12 characters"})
    
})

const shopSchema = signupSchema.extend({
    shopname:z
    .string({required_error:"Saloon name is required"})
    .min(2,{message: "Saloon name must be of atleast 4 characters" })
    .max(50,{message:"Saloon name must not have more than 50 characters"}),

    state:z
    .string({required_error:"State is required"}),

    district:z
    .string({required_error:"District is required"}),

    city:z.
    string({required_error:"City is required"}),

    street:z.
    string({required_error:"Street is required"}),

    pin:z
    .string({required_error:"Pin is required"})

})

module.exports = {signupSchema,loginSchema,shopSchema}

