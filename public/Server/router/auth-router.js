const express = require("express")
const router = express.Router();
const authControllers = require("../controllers/auth-controllers")
const {signupSchema,loginSchema} = require("../validators/auth-validator")
const validate = require("../middlewares/validate-middleware")
const authMiddleware = require("../middlewares/auth-middleware")

// router.route("/").get((req,res) => {})
router.route("/").get(authControllers.home)

// router.get("/", (req,res)=>{
//     res.status(200).send("Welcome to MERN stack development through Router")
// })
// OR
// router.route("/").get((req,res)=>{
//     res.status(200).send("Welcome to MERN stack development through router")
// })

// router.get("/register", (req,res)=>{
//     res.status(200).send("Welcome to registration page through Router")
// })
router.route('/register').post( authControllers.register)
// router.route('/register').post(validate(signupSchema), authControllers.register)
router.route('/login').post(authControllers.login)
router.route('/update').post(authControllers.update)
// router.post('/update',authControllers.update);
// router.route('/login').post(validate(loginSchema),authControllers.login)

router.route('/user').get(authMiddleware, authControllers.user)

router.route('/usertype').get(authMiddleware, authControllers.getUserType)

router.route('/forget').post()


module.exports = router;
