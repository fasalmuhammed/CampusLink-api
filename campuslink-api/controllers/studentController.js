const Student = require("./../models/Student");
const Paper = require("./../models/Paper");
const Semester = require("./../models/Semester");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get student by id
// @route GET /student/:id
// @access Private
const getStudentById = asyncHandler(async (req, res) => {
  if (!req?.params?.id) return res.status(400).json({ message: "ID Missing" });

  const student = await Student.findById(req.params.id)
    .select("-password -_id -__v").populate({path:'semester', select:'semnum'}).populate({path:'department',select:'deptname'})
    .exec();
  if (!student) {
    return res.status(400).json({ message: "Student Not Found." });
  }
  res.json(student);
});

// @desc Get all Students
// @route GET /student/
// @access Private
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().select("-__v -password").populate({path:'semester', select:'semnum'}).populate({path:'department',select:'deptname'}).lean();
  if (!students?.length) {
    return res.status(400).json({ message: "No Students Found" });
  }
  res.json(students);
});

// @desc Get count of all Students
// @route GET /students/extra/count
// @access Private
const countStudents = asyncHandler(async (req, res) => {
  const studentCount = await Student.countDocuments();
  res.json({ count: studentCount });
});

// @desc Create New Student
// @route POST /student
// @access Private
const createNewStudent = asyncHandler(async (req, res) => {
  const {
    name,
    admno,
    rollno,
    semnum, // Change: accept semnum in the request
    department,
    email,
    username,
    password,
  } = req.body;

  // Confirm Data
  if (
    !name ||
    !email ||
    !admno ||
    !rollno ||
    !semnum || // Change: check for semnum
    !department ||
    !username ||
    !password
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for Duplicates
  const duplicate = await Student.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Username" });
  }

  // Find the semester by semnum
  const semester = await Semester.findOne({ semnum }).lean().exec();

  if (!semester) {
    return res.status(400).json({ message: "Invalid semester" });
  }

  // Check if the chosen semester is of the chosen department
  const validSemester = await Semester.exists({
    _id: semester._id,
    department: department,
  });

  if (!validSemester) {
    return res
      .status(400)
      .json({ message: "Invalid semester for the chosen department" });
  }

  // Hash Password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const studentObj = {
    name,
    email,
    admno,
    rollno,
    semester: semester._id, // Use the ID of the found semester
    department,
    username,
    password: hashedPwd,
  };

  // Create and Store New student
  const student = await Student.create(studentObj);

  if (student) {
    res.status(201).json({ message: `New Student ${name} created` });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});


// @desc Update Student
// @route PATCH /student
// @access Private
const updateStudent = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const {
    name,
    admno,
    rollno,
    semester,
    department,
    email,
    username,
    password,
  } = req.body;
  // Confirm Data
  if (!id) {
    return res.status(400).json({ message: "Student id not given" });
  }

  // Find Student
  const student = await Student.findById(id).exec();

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Check for duplicate username
  if (username) {
    const duplicate = await Student.findOne({ username }).lean().exec();

    // Allow Updates to the current student
    if (duplicate && duplicate._id.toString() !== id) {
      return res.status(409).json({ message: "Duplicate Username" });
    }
    student.username = username;
  }

  // Update student fields if provided
  if (name) student.name = name;
  if (email) student.email = email;
  if (admno) student.admno = admno;
  if (rollno) student.rollno = rollno;
  if (department) student.department = department;

  // Check if the updated semester is of the current department
  if (semester) {
    const validSemester = await Semester.exists({
      _id: semester,
      department: student.department,
    });
    if (!validSemester) {
      return res
        .status(400)
        .json({ message: "Invalid semester for the current department" });
    }
    student.semester = semester;
  }

  // Update password if provided
  if (password) {
    try {
      // Hash Pwd
      student.password = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({ message: "Error updating password" });
    }
  }

  // Save the updated student
  await student.save();

  res.json({ message: "Student Updated" });
});

// @desc Delete Student
// @route DELETE /Student
// @access Private
const deleteStudent = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "Student ID required" });
  }

  const student = await Student.findById(id).exec();

  if (!student) {
    return res.status(400).json({ message: "Student not found" });
  }

  const result = await student.deleteOne();

  res.json({ message: `${result.username} deleted` });
});

module.exports = {
  getStudentById,
  getAllStudents,
  createNewStudent,
  updateStudent,
  deleteStudent,
  countStudents
};
