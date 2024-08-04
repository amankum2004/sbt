const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin-controller");
const authMiddleware = require("../middlewares/auth-middleware");
const adminMiddleware = require("../middlewares/admin-middleware");

router.route('/users').get(authMiddleware,adminMiddleware,adminController.getAllUsers);

router.route("/users/:id").get(authMiddleware,adminMiddleware,adminController.getUserById);

router.route("/users/update/:id").patch(authMiddleware,adminMiddleware,adminController.updateUserById);

router.route("/users/delete/:id").delete(authMiddleware,adminMiddleware,adminController.deleteUserById);

router.route('/contacts').get(authMiddleware,adminMiddleware,adminController.getAllContacts);

router.route("/contacts/delete/:id").delete(authMiddleware,adminMiddleware,adminController.deleteContactById);

// router.route('/shops').get(authMiddleware,adminMiddleware,adminController.getAllShops);
// router.route("/shops/:id").get(authMiddleware,adminMiddleware,adminController.getShopById);
// router.route("/shops/update/:id").patch(authMiddleware,adminMiddleware,adminController.updateShopById);
// router.route("/shops/delete/:id").delete(authMiddleware,adminMiddleware,adminController.deleteShopById);

router.route('/shops').get(authMiddleware,adminMiddleware,adminController.getAllShops);

router.route("/shops/:id").get(authMiddleware,adminMiddleware,adminController.getShopById);

router.route("/shops/update/:id").patch(authMiddleware,adminMiddleware,adminController.updateShopById);

router.route("/shops/delete/:id").delete(authMiddleware,adminMiddleware,adminController.deleteShopById);


module.exports = router;
