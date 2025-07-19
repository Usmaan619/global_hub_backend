const adminModel = require("../../model/global_hub/adminModal");
const moment = require("moment");

// Create Admin
exports.createAdmin = async (req, res) => {
  try {
    const id = await adminModel.createAdmin(req.body);
    return res.status(201).json({ message: "Admin created successfully", id });
  } catch (error) {
    console.error("Controller:createAdmin Error:", error, moment().format());
    return res.status(500).json({
      message: "Server error while creating admin",
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
    });
  }
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await adminModel.getAllAdmins();
    return res.json(admins);
  } catch (error) {
    console.error("Controller:getAllAdmins Error:", error, moment().format());
    return res.status(500).json({
      message: "Server error while fetching admins",
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
    });
  }
};

// Update Admin
exports.updateAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await adminModel.updateAdmin(id, req.body);
    return res.json({ message: "Admin updated", result });
  } catch (error) {
    console.error("Controller:updateAdmin Error:", error, moment().format());
    return res.status(500).json({
      message: "Server error while updating admin",
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
    });
  }
};

// Delete Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await adminModel.deleteAdmin(id);
    return res.json({ message: "Admin deleted", result });
  } catch (error) {
    console.error("Controller:deleteAdmin Error:", error, moment().format());
    return res.status(500).json({
      message: "Server error while deleting admin",
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
    });
  }
};
