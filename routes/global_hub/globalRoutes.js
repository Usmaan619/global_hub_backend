const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/global_hub/adminController");
const superAdminController = require("../../controllers/global_hub/superAdminController");
const userController = require("../../controllers/global_hub/userController");
const recordController = require("../../controllers/global_hub/recordController");
const dashboardController = require("../../controllers/global_hub/dashboardController");
const { protect } = require("../../middlewares/authMiddleware");
const { checkPortalLock } = require("../../middlewares/lockCheckingMiddleware");

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
router.post(
  "/create/user",
  protect,
  checkPortalLock,
  userController.createUser
);
router.get("/", userController.getAllUsers);
router.put("/:id", userController.updateUser);
router.delete(
  "/delete/user/by/id/:id",
  protect,
  checkPortalLock,
  userController.deleteUser
);
router.post(
  "/update/user/by/id/:id",
  protect,
  checkPortalLock,
  userController.updateUserByAdmin
);

router.post(
  "/create/record",
  protect,
  checkPortalLock,
  recordController.createRecord
);
router.get(
  "/get/all/records",
  protect,
  checkPortalLock,
  recordController.getAllRecords
);
router.get(
  "/get/all/records/by/id",
  protect,
  checkPortalLock,
  recordController.getAllRecords
);
router.post(
  "/update/record/by/id/:id",
  protect,
  checkPortalLock,
  recordController.updateRecord
);
router.delete(
  "/delete/record/by/id/:id",
  protect,
  checkPortalLock,
  recordController.deleteRecord
);

router.delete(
  "/delete/all/record/by/user/id/:id",
  protect,
  checkPortalLock,
  recordController.deleteRecordsByUserId
);

router.post(
  "/deleteAutoDetectAndrecord",
  protect,
  checkPortalLock,
  adminController.deleteAutoDetect
);

// deleteAutoDetect

// get admin and user by role and id
router.get(
  "/get/admin/user/by/role/id",
  protect,
  checkPortalLock,
  adminController.getUsersByRoleAndId
);

// --
// user delete

router.delete(
  "/delete/user/by/id/:id",
  protect,
  checkPortalLock,
  userController.deleteUser
);

// admin delete

router.delete(
  "/delete/admin/user/by/id/:id",
  protect,
  checkPortalLock,
  adminController.deleteAdmin
);

router.post(
  "/update/admin/:id",
  protect,
  checkPortalLock,
  adminController.updateAdminThree
);

router.get(
  "/download/csv/user/by/id",
  adminController.downloadUserRecordsExcel
);

// dashboardController
router.get(
  "/stats",
  protect,
  checkPortalLock,
  dashboardController.getDashboardStats
);
router.get(
  "/static/dashboard",
  protect,
  checkPortalLock,
  dashboardController.getSuperAdminAndAdminDetailsCount
);

// settings
// GET /api/lock-status
router.get("/lock-status", dashboardController.getLockStatus);

// POST /api/lock-status/toggle
router.post(
  "/lock-status/toggle",

  protect,
  dashboardController.getLockStatusToggle
);

// Lock/Unlock Admin + All Users
router.post("/admin/:id/lock", dashboardController.adminLockWithAllUsers);

// Lock/Unlock Single User
router.post("/user/:id/lock", dashboardController.usersLock);

module.exports = router;
