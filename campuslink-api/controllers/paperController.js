const Paper = require("../models/Paper");
const Student = require("../models/Student");
const Semester = require("../models/Semester");
const asyncHandler = require("express-async-handler");

// @desc Get Paper By Id
// @route GET /Paper
// @access Private
const getPaper = asyncHandler(async (req, res) => {
  const paperId = req.params.id;
  try {
    // Find the paper by ID
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.json(paper);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @desc Create Paper
// @route POST /Paper
// @access Private
const createPaper = asyncHandler(async (req, res) => {
  const { code, paper, semnum, department, teacher, students } = req.body;

  // Confirm Data
  if (!code || !paper || !semnum || !department || !teacher) {
    return res.status(400).json({ message: "Incomplete paper data" });
  }

  // Find the semester by semnum
  const semester = await Semester.findOne({ semnum }).lean().exec();

  if (!semester) {
    return res.status(400).json({ message: "Invalid semester" });
  }

  // Check for Duplicates
  const duplicate = await Paper.findOne({ code }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Paper Code" });
  }

  const paperObj = {
    code,
    paper,
    semester: semester._id, // Use the ID of the found semester
    department,
    teacher,
    students,
  };

  // Create and Store New Paper
  const newPaper = await Paper.create(paperObj);

  if (newPaper) {
    res.status(201).json({ message: `${code} Paper Created` });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});


// @desc Update Paper
// @route PATCH /Paper
// @access Private
const updatePaper = asyncHandler(async (req, res) => {
  const { code, paper, semester, department, teacher } = req.body;
  const id = req.params.id;
  // Confirm Data
  if (!id) {
    return res.status(400).json({ message: "Paper ID is required" });
  }

  // Find Paper
  const foundPaper = await Paper.findById(id).exec();

  if (!foundPaper) {
    return res.status(404).json({ message: "Paper not found" });
  }

  // Check for duplicate
  if (code) {
    const duplicate = await Paper.findOne({ code, _id: { $ne: id } }).lean().exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Paper Code" });
    }

    foundPaper.code = code;
  }

  // Update other attributes if provided
  if (paper) {
    foundPaper.paper = paper;
  }

  if (semester) {
    foundPaper.semester = semester;
  }

  if (department) {
    foundPaper.department = department;
  }

  if (teacher) {
    foundPaper.teacher = teacher;
  }

  await foundPaper.save();

  res.json({ message: "Paper Updated" });
});

// @desc Delete Paper
// @route DELETE /Paper
// @access Private
const deletePaper = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "Paper ID required" });
  }

  const foundPaper = await Paper.findById(id).exec();

  if (!foundPaper) {
    return res.status(400).json({ message: "Paper not found" });
  }

  const result = await foundPaper.deleteOne();

  res.json({ message: `${result.code} deleted` });
});

// @desc Get All Papers
// @route GET /paper/all
// @access Private
const getAllPapers = asyncHandler(async (req, res) => {
  const papers = await Paper.find().select("-__v").populate({path:'semester', select:'semnum'}).populate({path:'department',select:'deptname'}).populate({path:'teacher',select:'name'}).exec();
  res.json(papers);
});

// @desc Get count of all papers
// @route GET /papers/extra/count
// @access Private
const countPapers = asyncHandler(async (req, res) => {
  const paperCount = await Paper.countDocuments();
  res.json({ count: paperCount });
});

// @desc Get Papers by Department
// @route GET /papers/department/:departmentId
// @access Private
const getPapersByDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  const papers = await Paper.find({ department: departmentId })
    .populate("semester department teacher")
    .select("-__v")
    .exec();
  res.json(papers);
});

// @desc Get Papers by Semester
// @route GET /papers/semester/:semesterId
// @access Private
const getPapersBySemester = asyncHandler(async (req, res) => {
  const { semesterId } = req.params;
  const papers = await Paper.find({ semester: semesterId })
    .populate("semester department teacher")
    .select("-__v")
    .exec();
  res.json(papers);
});

// @desc Get Students Enrolled in a Paper
// @route GET /papers/:paperId/students
// @access Private
const getStudentsInPaper = asyncHandler(async (req, res) => {
  const paperId = req.params.paperId;

  try {
    // Find the paper by ID
    const paper = await Paper.findById(paperId);

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    // Find students for the paper's semester and department
    const students = await Student.find({
      semester: paper.semester,
    }).select("id rollno name ").exec();

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  getPaper,
  createPaper,
  updatePaper,
  deletePaper,
  getAllPapers,
  getPapersByDepartment,
  getPapersBySemester,
  getStudentsInPaper,
  countPapers
};
