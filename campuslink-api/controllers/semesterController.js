const Semester = require("./../models/Semester");
const asyncHandler = require("express-async-handler");

// @desc Get Semester
// @route GET /Semester
// @access Private
const getSemesterById = asyncHandler(async (req, res) => {
  if (!req?.params?.id) return res.status(400).json({ message: "ID Missing" });

  const semester = await Semester.findById(req.params.id)
    .select("-_id -__v")
    .exec();
  if (!semester) {
    return res.status(400).json({ message: "Semester Not Found." });
  }
  res.json(semester);
});

// @desc Get Semesters by Department
// @route GET /Semester/byDepartment/:deptId
// @access Private
const getSemestersByDepartment = asyncHandler(async (req, res) => {
  const { deptId } = req.params;

  if (!deptId) {
    return res.status(400).json({ message: "Department ID missing" });
  }

  const semesters = await Semester.find({ department: deptId })
    .select("-__v")
    .exec();

  if (!semesters || semesters.length === 0) {
    return res
      .status(404)
      .json({ message: "No semesters found for the specified department" });
  }

  res.json(semesters);
});

// @desc Get Semester by Department and Semnum
// @route GET /Semester/byDepartmentAndSemnum/:deptId/:semnum
// @access Private
const getSemesterByDepartmentAndSemnum = asyncHandler(async (req, res) => {
  const { deptId, semnum } = req.params;

  if (!deptId || !semnum || isNaN(semnum)) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const semester = await Semester.findOne({ department: deptId, semnum })
    .select("-__v")
    .exec();

  if (!semester) {
    return res.status(404).json({
      message: "Semester not found for the specified department and semnum",
    });
  }

  res.json(semester);
});

module.exports = {
  getSemesterById,
  getSemestersByDepartment,
  getSemesterByDepartmentAndSemnum,
};
