const Time_Schedule = require("./../models/TimeSchedule");
const Semester = require("./../models/Semester");
const asyncHandler = require("express-async-handler");

// @desc Get Time Schedule for a Semester
// @route GET /time-schedule/:sem_id
// @access Public
const getTimeSchedule = asyncHandler(async (req, res) => {
  const { sem_id } = req.params;

  // Check if the semester exists
  const semester = await Semester.findById(sem_id).exec();

  if (!semester) {
    return res.status(404).json({ message: "Semester not found" });
  }

  // Find the time schedule for the given semester
  const timeSchedule = await Time_Schedule.findOne({ semester: sem_id }).exec();

  if (!timeSchedule) {
    return res.status(404).json({ message: "Time schedule not found for the specified semester" });
  }

  res.json(timeSchedule);
});

// @desc Add Time Schedule for a Semester
// @route POST /time-schedule
// @access Private
const addTimeSchedule = asyncHandler(async (req, res) => {
  const { semester, schedule } = req.body;

  // Check if the semester exists
  const existingSemester = await Semester.findById(semester).exec();

  if (!existingSemester) {
    return res.status(404).json({ message: "Semester not found" });
  }

  // Check if a time schedule already exists for the given semester
  const existingTimeSchedule = await Time_Schedule.findOne({ semester }).exec();

  if (existingTimeSchedule) {
    return res.status(400).json({ message: "Time schedule already exists for the specified semester" });
  }

  // Create and store the time schedule for the given semester
  await Time_Schedule.create({
    semester,
    schedule,
  });

  res.status(201).json({ message: "Time schedule added successfully" });
});


// @desc Patch (Update) Time Schedule for a Semester
// @route PATCH /time-schedule/:sem_id
// @access Private
const updateTimeSchedule = asyncHandler(async (req, res) => {
  const { sem_id } = req.params;
  const { schedule } = req.body;

  // Check if the semester exists
  const existingSemester = await Semester.findById(sem_id).exec();

  if (!existingSemester) {
    return res.status(404).json({ message: "Semester not found" });
  }

  // Check if a time schedule already exists for the given semester
  const existingTimeSchedule = await Time_Schedule.findOne({ semester: sem_id }).exec();

  if (!existingTimeSchedule) {
    return res.status(404).json({ message: "Time schedule not found for the specified semester" });
  }

  // Update specific values in the schedule array
  Object.keys(schedule).forEach(day => {
    if (existingTimeSchedule.schedule[day]) {
      schedule[day].forEach((value, index) => {
        if (value !== "") {
          existingTimeSchedule.schedule[day][index] = value;
        }
      });
    }
  });

  // Save the updated time schedule
  await existingTimeSchedule.save();

  res.json({ message: "Time schedule updated successfully" });
});



// @desc Delete Time Schedule for a Semester
// @route DELETE /time-schedule/:sem_id
// @access Private
const deleteTimeSchedule = asyncHandler(async (req, res) => {
  const { sem_id } = req.params;

  // Check if the semester exists
  const semester = await Semester.findById(sem_id).exec();

  if (!semester) {
    return res.status(404).json({ message: "Semester not found" });
  }

  // Find and delete the time schedule for the given semester
  const timeSchedule = await Time_Schedule.findOneAndDelete({ semester: sem_id }).exec();

  if (!timeSchedule) {
    return res.status(404).json({ message: "Time schedule not found for the specified semester" });
  }

  res.json({ message: "Time schedule deleted successfully" });
});

module.exports = {
  getTimeSchedule,
  addTimeSchedule,
  updateTimeSchedule,
  deleteTimeSchedule,
};
