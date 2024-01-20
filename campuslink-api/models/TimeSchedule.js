const mongoose = require("mongoose");

// Schema for a day
const daySchema = new mongoose.Schema({
  monday: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
      default: [],
    },
  ],
  tuesday: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
      default: [],
    },
  ],
  wednesday: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
      default: [],
    },
  ],
  thursday: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
      default: [],
    },
  ],
  friday: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
      default: [],
    },
  ],
});

// Time Schedule of The Class
const timeScheduleSchema = new mongoose.Schema({
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Semester",
  },
  schedule: daySchema,
});

// Populate the 'papers' field and 'teacher' field of each 'Paper' when querying for a 'semester'
timeScheduleSchema.pre("findOne", function (next) {
  this.populate({
    path: "schedule.monday schedule.tuesday schedule.wednesday schedule.thursday schedule.friday",
    populate: {
      path: "teacher",
      model: "Teacher",
      select: "_id name",
    },
  });
  next();
});

module.exports = mongoose.model("Time_Schedule", timeScheduleSchema);
