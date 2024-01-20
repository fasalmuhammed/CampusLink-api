const Admin = require("./../models/Admin");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get Admin
// @route GET /Admin
// @access Private
const getAdminById = asyncHandler(async (req, res) => {
  if (!req?.params?.id) return res.status(400).json({ message: "ID Missing" });

  const admin = await Admin.findById(req.params.id)
    .select("-password -_id -__v")
    .exec();
  if (!admin) {
    return res.status(400).json({ message: "Admin Not Found." });
  }
  res.json(admin);
});

// @desc Create The Admin
// @route POST /Admin
// @access Private
const createAdmin = asyncHandler(async (req, res) => {
  const { name, username, password } = req.body;

  // Confirm Data
  if (!name || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for Duplicates
  const duplicate = await Admin.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Admin Name" });
  }

  // Hash Password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const adminObj = {
    name,
    username,
    password: hashedPwd,
  };

  // Create and Store New admin
  const admin = await Admin.create(adminObj);

  if (admin) {
    res.status(201).json({ message: `New Admin ${name} created` });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

// @desc Update Admin
// @route PATCH /Admin
// @access Private
const updateAdmin = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { name, username, password } = req.body;

  // Confirm Data
  if (!id || !name || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find Admin
  const admin = await Admin.findById(id).exec();

  if (!admin) {
    return res.status(400).json({ message: "Admin not found" });
  }

  // Check for duplicate
  const duplicate = await Admin.findOne({ username }).lean().exec();

  // Allow Updates to original
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Admin Name" });
  }

  admin.name = name;
  admin.username = username;

  if (password) {
    // Hash Pwd
    admin.password = await bcrypt.hash(password, 10);
  }

  await admin.save();

  res.json({ message: `Admin ${name} Updated` });
});

// @desc Delete Admin
// @route DELETE /Admin
// @access Private
const deleteAdmin = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "Admin ID required" });
  }

  const admin = await Admin.findById(id).exec();

  if (!admin) {
    return res.status(400).json({ message: "Admin not found" });
  }

  const result = await admin.deleteOne();

  res.json({ message: `${result.username} deleted` });
});

module.exports = {
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
