const { default: mongoose } = require("mongoose");
const Internal = require("./../models/Internal");
const asyncHandler = require("express-async-handler");

// @desc Get Internal Result
// @route GET /internal/:paper
// @access Everyone
const getInternal = asyncHandler(async (req, res) => {
  if (!req?.params?.paper) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }
  const internal = await Internal.findOne({
    paper: req.params.paper,
  }).populate({
    path: "marks._id",
    model: "Student", 
    select: "_id rollno name "
  })
  .populate({
    path: "paper",
    model: "Paper",
    select: "paper", 
  }).exec();
  if (!internal) {
    return res.status(404).json({
      message: "No Existing Record(s) found. Add New Record.",
    });
  }
  res.json(internal);
});

// @desc Get Internal Result
// @route GET /internal/student/:studentId
// @access Everyone
const getInternalStudent = asyncHandler(async (req, res) => {
  if (!req?.params?.studentId) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }

  try {
    const internal = await Internal.findOne({ "marks._id": req.params.studentId })
      .populate({
        path: "marks._id",
        model: "Student", 
        select: "_id rollno name "
      })
      .populate({
        path: "paper",
        model: "Paper",
        select: "paper", 
      })
      .exec();

    if (!internal) {
      return res.status(404).json({
        message: "No Records Found.",
      });
    }

    res.json(internal);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error.",
    });
  }
});


// @desc Add Internal
// @route POST /Internal
// @access Private
const addInternal = asyncHandler(async (req, res) => {
  const paper = req.params.paper;
  const { marks } = req.body;

  // Confirm Data
  if (!paper || !marks) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Fields Missing" });
  }
  // Check for Duplicates
  const duplicate = await Internal.findOne({
    paper: req.params.paper,
  })
    .lean()
    .exec();
  if (duplicate) {
    return res.status(409).json({ message: "Internal record already exists" });
  }

  const InternalObj = {
    paper,
    marks,
  };
  // Create and Store New teacher
  const record = await Internal.create(InternalObj);
  if (record) {
    res.status(201).json({
      message: `Internal Record  Added`,
    });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

// @desc Update Internal
// @route PATCH /Internal
// @access Private
const updateInternal = asyncHandler(async (req, res) => {
  const paperId = req.params.paper;
  const { marks } = req.body;

  // Confirm Data
  if (!paperId || !marks) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find Record
  const record = await Internal.findOne({ paper: paperId }).exec();
  if (!record) {
    return res.status(404).json({ message: "Internal record doesn't exist" });
  }

  record.marks = marks;

  const save = await record.save();
  if (save) {
    res.json({
      message: `Internal Record Updated`,
    });
  } else {
    res.json({ message: "Save Failed" });
  }
});

// @desc Delete Teacher
// @route DELETE /Teacher
// @access Private
const deleteInternal = asyncHandler(async (req, res) => {
  const id = req.params.paper;

  if (!id) {
    return res.status(400).json({ message: "Internal ID required" });
  }

  const record = await Internal.findById(id).exec();
  if (!record) {
    return res.status(404).json({ message: "Internal Record not found" });
  }

  await record.deleteOne();
  res.json({
    message: `Internal Record deleted`,
  });
});

module.exports = {
  getInternal,
  getInternalStudent,
  addInternal,
  updateInternal,
  deleteInternal,
};
