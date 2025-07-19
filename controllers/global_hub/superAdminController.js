const superAdminModel = require("../../model/global_hub/superAdminModal");
const moment = require("moment");

// Create
exports.createSuperAdmin = async (req, res) => {
  try {
    const id = await superAdminModel.createSuperAdmin(req.body);
    return res.status(201).json({ message: "Super admin created", id });
  } catch (error) {
    console.error(
      "Controller:createSuperAdmin Error:",
      error,
      moment().format()
    );
    return res
      .status(500)
      .json({ message: "Server error while creating super admin" });
  }
};

// Get All
exports.getAllSuperAdmins = async (req, res) => {
  try {
    const data = await superAdminModel.getAllSuperAdmins();
    return res.json(data);
  } catch (error) {
    console.error(
      "Controller:getAllSuperAdmins Error:",
      error,
      moment().format()
    );
    return res
      .status(500)
      .json({ message: "Server error while fetching super admins" });
  }
};

// Update
exports.updateSuperAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await superAdminModel.updateSuperAdmin(id, req.body);
    return res.json({ message: "Super admin updated", result });
  } catch (error) {
    console.error(
      "Controller:updateSuperAdmin Error:",
      error,
      moment().format()
    );
    return res
      .status(500)
      .json({ message: "Server error while updating super admin" });
  }
};

// Delete
exports.deleteSuperAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await superAdminModel.deleteSuperAdmin(id);
    return res.json({ message: "Super admin deleted", result });
  } catch (error) {
    console.error(
      "Controller:deleteSuperAdmin Error:",
      error,
      moment().format()
    );
    return res
      .status(500)
      .json({ message: "Server error while deleting super admin" });
  }
};
