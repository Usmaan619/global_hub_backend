const express = require("express");
const router = express.Router();
const authController = require("../../controllers/global_hub/authController");

// Super Admin
router.post("/superadmin/register", authController.superAdminRegister);
router.post("/superadmin/login", authController.superAdminLogin);

// Admin
router.post("/admin/register", authController.adminRegister);
router.post("/admin/login", authController.adminLogin);

// User
router.post("/user/register", authController.userRegister);
router.post("/user/login", authController.userLogin);

// login api
router.post("/login", authController.loginAutoDetect);

// register
router.post("/register", authController.registerAutoDetect);

module.exports = router;
