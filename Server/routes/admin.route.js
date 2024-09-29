const express = require("express");
const router = express.Router();
const adminController = require("@/controllers/admin-controller");
// const authMiddleware = require("@/middlewares/auth-middleware");
// const adminMiddleware = require("@/middlewares/admin-middleware");

// router.route('/users').get(authMiddleware,adminMiddleware,adminController.getAllUsers);
router.route('/users').get(adminController.getAllUsers);

// router.route("/users/:id").get(authMiddleware,adminMiddleware,adminController.getUserById);
router.route("/users/:id").get(adminController.getUserById);

// router.route("/users/update/:id").patch(authMiddleware,adminMiddleware,adminController.updateUserById);
router.route("/users/update/:id").patch(adminController.updateUserById);

// router.route("/users/delete/:id").delete(authMiddleware,adminMiddleware,adminController.deleteUserById);
router.route("/users/delete/:id").delete(adminController.deleteUserById);

// router.route('/contacts').get(authMiddleware,adminMiddleware,adminController.getAllContacts);
router.route('/contacts').get(adminController.getAllContacts);

// router.route("/contacts/delete/:id").delete(authMiddleware,adminMiddleware,adminController.deleteContactById);
router.route("/contacts/delete/:id").delete(adminController.deleteContactById);

// router.route('/shops').get(authMiddleware,adminMiddleware,adminController.getAllShops);
// router.route("/shops/:id").get(authMiddleware,adminMiddleware,adminController.getShopById);
// router.route("/shops/update/:id").patch(authMiddleware,adminMiddleware,adminController.updateShopById);
// router.route("/shops/delete/:id").delete(authMiddleware,adminMiddleware,adminController.deleteShopById);

// router.route('/shops').get(authMiddleware,adminMiddleware,adminController.getAllShops);
router.route('/shops').get(adminController.getAllShops);

// router.route("/shops/:id").get(authMiddleware,adminMiddleware,adminController.getShopById);
router.route("/shops/:id").get(adminController.getShopById);

// router.route("/shops/update/:id").patch(authMiddleware,adminMiddleware,adminController.updateShopById);
router.route("/shops/update/:id").patch(adminController.updateShopById);

// router.route("/shops/delete/:id").delete(authMiddleware,adminMiddleware,adminController.deleteShopById);
router.route("/shops/delete/:id").delete(adminController.deleteShopById);


module.exports = router;
