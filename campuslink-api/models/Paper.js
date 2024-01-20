const mongoose = require("mongoose");

// Individual Paper in a Semester
const paperSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  paper: {
    type: String,
    required: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },
});
const Paper = mongoose.models.Paper || mongoose.model("Paper", paperSchema);
module.exports = Paper;
