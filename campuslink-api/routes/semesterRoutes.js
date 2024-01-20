const express = require("express");
const router = express.Router();
const semesterController = require("./../controllers/semesterController");

router.route("/dept/:deptId").get(semesterController.getSemestersByDepartment);
router
  .route("/dept/:deptId/:semnum")
  .get(semesterController.getSemesterByDepartmentAndSemnum);
router.route("/:id").get(semesterController.getSemesterById);
module.exports = router;
