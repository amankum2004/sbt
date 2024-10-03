const express = require("express")
const router = express.Router();
const registershopController = require("@/controllers/registerShop-controller")
// const {shopSchema} = require("../validators/auth-validator");
// const validate = require("../middlewares/validate-middleware");
// const authMiddleware = require("../middlewares/auth-middleware")

// router.route('/registershop').post(validate(shopSchema), registershopController.registershop)
router.route('/registershop').post( registershopController.registershop)

// router.route('/services').post(registershopController.addService)
// router.route('/shop-services').get(registershopController.getUserServices)
// router.route('/shop-services/:id').get(registershopController.getUserServiceById)
// router.route('/shop-services/:id').put(registershopController.updateUserService)
// router.route('/shop-services/:id').delete(registershopController.deleteUserService)

router.route('/shoplists').get(registershopController.getAllShops);
router.route("/shoplists/:id").get(registershopController.getShopById);
router.get('/by-email/:email', registershopController.getShopByEmail);

router.patch('/update', registershopController.updateBarberProfile);


module.exports = router;