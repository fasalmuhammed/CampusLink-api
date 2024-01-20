const Dept = require("./../models/Department");
const Semester = require("./../models/Semester");
const Teacher = require("./../models/Teacher");
const Student = require("./../models/Student");
const asyncHandler = require("express-async-handler");

// @desc Get Dept
// @route GET /Dept
// @access Private
const getDeptById = asyncHandler(async (req, res) => {
  if (!req?.params?.id) return res.status(400).json({ message: "ID Missing" });

  const dept = await Dept.findById(req.params.id).select("-_id -__v").exec();
  if (!dept) {
    return res.status(400).json({ message: "Department Not Found." });
  }
  res.json(dept);
});

// @desc Get all Departments
// @route GET /department
// @access Private
const getAllDept = asyncHandler(async (req, res) => {
  const depts = await Dept.find().select("-__v").lean();
  if (!depts?.length) {
    return res.status(400).json({ message: "No Departments Found" });
  }
  res.json(depts);
});

// @desc Get count of all Departments
// @route GET /department/extra/count
// @access Private
const countDept = asyncHandler(async (req, res) => {
  const deptCount = await Dept.countDocuments();
  res.json({ count: deptCount });
});

// @desc Create The Department with Semesters
// @route POST /Dept
// @access Private
const createDept = asyncHandler(async (req, res) => {
  const { deptname, semcount } = req.body;

  // Confirm Data
  if (!deptname || !semcount || isNaN(semcount) || semcount <= 0) {
    return res.status(400).json({ message: "Invalid data received" });
  }

  // Check for Duplicates
  const duplicate = await Dept.findOne({ deptname }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Department Name" });
  }

  // Create Department
  const deptObj = {
    deptname,
    semcount,
  };

  const department = await Dept.create(deptObj);

  // Create Semesters
  const semesterArray = Array.from({ length: semcount }, (_, index) => ({
    semnum: index + 1,
    department: department._id,
  }));

  const semesters = await Semester.create(semesterArray);

  if (department && semesters) {
    res.status(201).json({
      message: `${deptname} Department Created with ${semcount} Semesters`,
    });
  } else {
    res
      .status(400)
      .json({ message: "Error creating department and semesters" });
  }
});

// @desc Update Dept
// @route PATCH /Dept
// @access Private
const updateDept = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { deptname } = req.body;

  // Confirm Data
  if (!id || !deptname) {
    return res.status(400).json({ message: "Dept ID and Name are required" });
  }

  // Find Dept
  const dept = await Dept.findById(id).exec();

  if (!dept) {
    return res.status(400).json({ message: "Department not found" });
  }

  // Check for duplicate
  const duplicate = await Dept.findOne({ deptname }).lean().exec();

  // Allow Updates to original
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Department Name" });
  }

  dept.deptname = deptname;

  await dept.save();

  res.json({ message: "Department Name Updated" });
});

// @desc Delete Dept and associated Semesters, Teachers, and Students
// @route DELETE /Dept
// @access Private
const deleteDept = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "Department ID required" });
  }

  // Find semesters associated with the department
  const semestersToDelete = await Semester.find({ department: id })
    .select("_id")
    .exec();
  const semesterIdsToDelete = semestersToDelete.map((semester) => semester._id);

  // Delete associated semesters
  await Semester.deleteMany({ department: id }).exec();

  // Delete associated teachers
  await Teacher.deleteMany({ department: id }).exec();

  // Delete associated students
  await Student.deleteMany({ semester: { $in: semesterIdsToDelete } }).exec();

  // Delete the department
  const dept = await Dept.findById(id).exec();
  if (!dept) {
    return res.status(400).json({ message: "Dept not found" });
  }

  const result = await dept.deleteOne();

  res.json({
    message: `${result.deptname} and associated semesters, teachers, and students deleted`,
  });
});

module.exports = {
  getDeptById,
  createDept,
  updateDept,
  deleteDept,
  getAllDept,
  countDept
};
