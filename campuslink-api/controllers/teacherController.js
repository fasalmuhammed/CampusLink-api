const Teacher = require("./../models/Teacher");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get Teacher
// @route GET /teacher/:id
// @access Private
const getTeacherById = asyncHandler(async (req, res) => {
  if (!req?.params?.id) return res.status(400).json({ message: "ID Missing" });

  const teacher = await Teacher.findById(req.params.id)
    .select("-password -_id -__v").populate({path:'department', select: 'deptname'})
    .lean();
  if (!teacher) {
    return res.status(404).json({ message: "No Teacher Found." });
  }
  res.json(teacher);
});

// @desc Get all Departments
// @route GET /department
// @access Private
const getAllTeachers = asyncHandler(async (req, res) => {
  const depts = await Teacher.find().select("-password -__v").populate({path:'department', select: 'deptname'}).lean();
  if (!depts?.length) {
    return res.status(400).json({ message: "No Teachers Found" });
  }
  res.json(depts);
});

// @desc Get count of all Departments
// @route GET /department/extra/count
// @access Private
const countTeachers = asyncHandler(async (req, res) => {
  const teacherCount = await Teacher.countDocuments();
  res.json({ count: teacherCount });
});

// @desc Create New Teacher
// @route POST /Teacher
// @access Private
const createNewTeacher = asyncHandler(async (req, res) => {
  const { name, email, department, username, password } = req.body;

  // Confirm Data
  if (!name || !email || !department || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for Duplicates
  const duplicate = await Teacher.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Username" });
  }

  // Hash Password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const teacherObj = {
    name,
    email,
    department,
    username,
    password: hashedPwd,
  };

  // Create and Store New teacher
  const teacher = await Teacher.create(teacherObj);

  if (teacher) {
    res.status(201).json({
      message: `New Teacher ${username} Registered`,
    });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

// @desc Update Teacher
// @route PATCH /teacher
// @access Private
const updateTeacher = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { name, email, department, username, password } = req.body;

  // Confirm Id
  if (!id) {
    return res.status(400).json({ message: "Teacher id not given" });
  }

  // Find Teacher
  const teacher = await Teacher.findById(id).exec();
  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  // Check for duplicate username
  if (username) {
    const duplicate = await Teacher.findOne({ username }).lean().exec();
    // Allow update to the current teacher
    if (duplicate && duplicate._id.toString() !== id) {
      return res.status(409).json({ message: "Duplicate username" });
    }
    teacher.username = username;
  }

  // Update teacher fields if provided
  if (name) teacher.name = name;
  if (email) teacher.email = email;
  if (department) teacher.department = department;

  // Update password if provided
  if (password) {
    try {
      // Hash Pwd
      teacher.password = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({ message: "Error updating password" });
    }
  }

  // Save the updated teacher
  const updatedTeacher = await teacher.save();

  res.json({ message: `Teacher ${updatedTeacher.username} Updated` });
});

// @desc Delete Teacher
// @route DELETE /Teacher
// @access Private
const deleteTeacher = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "Teacher ID Required" });
  }

  const teacher = await Teacher.findById(id).exec();

  if (!teacher) {
    return res.status(400).json({ message: "Teacher not found" });
  }

  const result = await teacher.deleteOne();

  res.json({ message: `${result.username} deleted` });
});

module.exports = {
  getTeacherById,
  createNewTeacher,
  updateTeacher,
  deleteTeacher,
  getAllTeachers,
  countTeachers,
};
