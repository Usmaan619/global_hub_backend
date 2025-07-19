const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/global_hub/adminController");
const superAdminController = require("../../controllers/global_hub/superAdminController");
const userController = require("../../controllers/global_hub/userController");
const recordController = require("../../controllers/global_hub/recordController");
const dashboardController = require("../../controllers/global_hub/dashboardController");

// adminController
router.post("/", adminController.createAdmin);
router.get("/", adminController.getAllAdmins);
router.put("/:id", adminController.updateAdmin);
router.delete("/:id", adminController.deleteAdmin);

// superAdminController
router.post("/", superAdminController.createSuperAdmin);
router.get("/", superAdminController.getAllSuperAdmins);
router.put("/:id", superAdminController.updateSuperAdmin);
router.delete("/:id", superAdminController.deleteSuperAdmin);

// userController
router.post("/create/user", userController.createUser);
router.get("/", userController.getAllUsers);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

router.post("/create/record", recordController.createRecord);
router.get("/get/all/records", recordController.getAllRecords);
router.get("/get/all/records/by/id", recordController.getAllRecords);
router.post("/update/record/by/id/:id", recordController.updateRecord);
router.delete("/delete/record/by/id/:id", recordController.deleteRecord);

// dashboardController
router.get("/stats", dashboardController.getDashboardStats);
module.exports = router;
