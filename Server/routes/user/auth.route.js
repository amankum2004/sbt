const express = require("express")
const router = express.Router();
const authControllers = require("@/controllers/user/auth-controllers")
// const {signupSchema,loginSchema} = require("../../validators/auth-validator")
// const validate = require("../../middlewares/validate-middleware")
// const authMiddleware = require("../../middlewares/auth-middleware")


router.route("/").get(authControllers.home)


// router.route('/register').post(validate(signupSchema), authControllers.register)
// router.route('/login').post(validate(loginSchema),authControllers.login)
// router.post('/update',authControllers.update);
router.route('/register').post( authControllers.register)
router.route('/login').post(authControllers.login)
router.route('/update').post(authControllers.update)
router.route('/user').get( authControllers.user)

// router.route('/user').get(authMiddleware, authControllers.user)
// router.route('/usertype').get(authMiddleware, authControllers.getUserType)
// router.route('/forget').post()


module.exports = router;
