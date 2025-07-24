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
router.delete("/delete/user/by/id/:id", userController.deleteUser);
router.post("/update/user/by/id/:id", userController.updateUserByAdmin);

router.post("/create/record", recordController.createRecord);
router.get("/get/all/records", recordController.getAllRecords);
router.get("/get/all/records/by/id", recordController.getAllRecords);
router.post("/update/record/by/id/:id", recordController.updateRecord);
router.delete("/delete/record/by/id/:id", recordController.deleteRecord);

// get admin and user by role and id
router.get("/get/admin/user/by/role/id", adminController.getUsersByRoleAndId);
router.delete("/delete/admin/user/by/id/:id", adminController.deleteAdmin);
router.post("/update/admin/:id", adminController.updateAdminThree);

router.get(
  "/download/csv/user/by/id",
  adminController.downloadUserRecordsExcel
);

// dashboardController
router.get("/stats", dashboardController.getDashboardStats);
router.get(
  "/static/dashboard",
  dashboardController.getSuperAdminAndAdminDetailsCount
);

// settings
// GET /api/lock-status
router.get("/lock-status", dashboardController.getLockStatus);

// POST /api/lock-status/toggle
router.post("/lock-status/toggle", dashboardController.getLockStatusToggle);
module.exports = router;
