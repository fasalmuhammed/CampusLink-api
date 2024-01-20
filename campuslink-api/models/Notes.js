const mongoose = require("mongoose");
// const AutoIncrement = require("mongoose-sequence")(mongoose);

// Notes for Student
const notesSchema = new mongoose.Schema(
  {
    paper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paper",
    },
    text: {
      type: String,
      required: true,
    },
    // attachment: {
    //   type: File,
    //   default: null,
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notes", notesSchema);
