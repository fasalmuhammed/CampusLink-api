const mongoose = require("mongoose");

//Department Detailes
const deptSchema = new mongoose.Schema({
  deptname: {
    type: String,
    required: true,
  },
  semcount: {
    type: Number,
    default: 6,
  },
});

module.exports = mongoose.model("Department", deptSchema);
