const express = require("express")
const app = express();
const bodyParser = require("body-parser")
const cors = require("cors")
const authRoute = require("../Server/router/auth-router")
const contactRoute = require("../Server/router/contact-router")
const serviceRoute = require("../Server/router/service-router")
const registerShopRoute = require("../Server/router/registerShop-router")
const adminRoute = require("../Server/router/admin-router")
const otpRouter = require("../Server/router/otp-router")
const connectDB = require("../Server/utils/db")
const timeSlotRoute = require("../Server/router/timeSlot-router")
const appointmentRoute = require("../Server/router/appointment-router")
// const errorMiddleware = require("../Server/middlewares/error-middleware")
// const { createServer }= require( "http");
// const https = createServer(app);

// const PORT = import.meta.env.VITE_LOCAL_PORT;

// let's tackle cors 
const corsOptions={
    origin:"http://localhost:5173",
    methods:"GET,POST,PUT,DELETE,PATCH,HEAD",
    credentials:true
}
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use(express.json())
app.use("/api/auth",authRoute)
app.use("/api/form",contactRoute)
app.use("/api/data",serviceRoute)
app.use("/api/shop",registerShopRoute)
app.use("/otp",otpRouter)
app.use("/api",timeSlotRoute)
app.use("/api",appointmentRoute)


// let's define admin route
app.use("/api/admin",adminRoute)

// app.use(errorMiddleware)

// app.get("/", (req,res)=>{
    //     res.status(200).send("Welcome to MERN stack development")
    // })
    // app.get("/register", (req,res)=>{
    //     res.status(200).send("Welcome to registration page")
// })

const PORT = 27017
connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running at port: ${PORT}`)
    })
});