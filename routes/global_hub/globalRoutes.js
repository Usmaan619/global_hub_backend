const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/global_hub/adminController");
const superAdminController = require("../../controllers/global_hub/superAdminController");
const userController = require("../../controllers/global_hub/userController");
const recordController = require("../../controllers/global_hub/recordController");
const dashboardController = require("../../controllers/global_hub/dashboardController");
const { protect } = require("../../middlewares/authMiddleware");

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
router.post("/create/user", protect,userController.createUser);
router.get("/", userController.getAllUsers);
router.put("/:id", userController.updateUser);
router.delete("/delete/user/by/id/:id",protect, userController.deleteUser);
router.post("/update/user/by/id/:id",protect, userController.updateUserByAdmin);

router.post("/create/record",protect, recordController.createRecord);
router.get("/get/all/records",protect, recordController.getAllRecords);
router.get("/get/all/records/by/id",protect, recordController.getAllRecords);
router.post("/update/record/by/id/:id",protect, recordController.updateRecord);
router.delete("/delete/record/by/id/:id",protect, recordController.deleteRecord);

// get admin and user by role and id
router.get("/get/admin/user/by/role/id",protect, adminController.getUsersByRoleAndId);
router.delete("/delete/admin/user/by/id/:id",protect, adminController.deleteAdmin);
router.post("/update/admin/:id",protect, adminController.updateAdminThree);

router.get(
  "/download/csv/user/by/id",
  adminController.downloadUserRecordsExcel
);

// dashboardController
router.get("/stats",protect, dashboardController.getDashboardStats);
router.get(
  "/static/dashboard",protect,
  dashboardController.getSuperAdminAndAdminDetailsCount
);

// settings
// GET /api/lock-status
router.get("/lock-status", dashboardController.getLockStatus);

// POST /api/lock-status/toggle
router.post("/lock-status/toggle",protect, dashboardController.getLockStatusToggle);
module.exports = router;
