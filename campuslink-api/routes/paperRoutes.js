const express = require("express");
const router = express.Router();
const paperController = require("./../controllers/paperController");

router.route("/").post(paperController.createPaper);

router
  .route("/:id")
  .get(paperController.getPaper)
  .patch(paperController.updatePaper)
  .delete(paperController.deletePaper);

router.route("/").get(paperController.getAllPapers);
router.route("/extra/count").get(paperController.countPapers);

router
  .route("/department/:departmentId")
  .get(paperController.getPapersByDepartment);

router.route("/semester/:semesterId").get(paperController.getPapersBySemester);

router.route("/:paperId/students").get(paperController.getStudentsInPaper);

module.exports = router;
