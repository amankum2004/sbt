const express = require('express')
const router = express.Router()


const authRoute = require('@/routes/user/auth.route')
const contactRoute = require('@/routes/contact.route')
const serviceRoute = require('@/routes/service.route')
const registerShopRoute = require('@/routes/registerShop.route')
const adminRoute = require('@/routes/admin.route')
const otpRouter = require('@/routes/user/otp.route')
const timeSlotRoute = require('@/routes/timeSlot.route')
const appointmentRoute = require('@/routes/appointment.route')
const userRouter = require('@/routes/user/user.route')
const paymentRoute = require('@/routes/user/payment')

router.use('/auth',authRoute)
router.use('/user',userRouter)
router.use('/otp',otpRouter)

router.use('/form',contactRoute)
router.use('/data',serviceRoute)
router.use('/shop',registerShopRoute)
router.use('/admin',adminRoute)
router.use('/time',timeSlotRoute)
router.use('/appoint',appointmentRoute)
router.use('/pay',paymentRoute)


module.exports = router
