const userModel = require("../../model/global_hub/userModal");
const moment = require("moment");

// Create
exports.createUser = async (req, res) => {
  try {
    const id = await userModel.createUser(req.body);
    return res.status(201).json({ success: true, message: "User created", id });
  } catch (error) {
    console.error("Controller:createUser Error:", error, moment().format());
    return res
      .status(500)
      .json({ message: "Server error while creating user" });
  }
};

// Read
exports.getAllUsers = async (req, res) => {
  try {
    const data = await userModel.getAllUsers();
    return res.json(data);
  } catch (error) {
    console.error("Controller:getAllUsers Error:", error, moment().format());
    return res
      .status(500)
      .json({ message: "Server error while fetching users" });
  }
};

// Update
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await userModel.updateUser(id, req.body);
    return res.json({ message: "User updated", result });
  } catch (error) {
    console.error("Controller:updateUser Error:", error, moment().format());
    return res
      .status(500)
      .json({ message: "Server error while updating user" });
  }
};

// Delete
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await userModel.deleteUser(id);
    return res.json({ message: "User deleted", result });
  } catch (error) {
    console.error("Controller:deleteUser Error:", error, moment().format());
    return res
      .status(500)
      .json({ message: "Server error while deleting user" });
  }
};
