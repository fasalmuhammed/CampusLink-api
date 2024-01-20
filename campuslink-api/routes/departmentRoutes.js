const express = require("express");
const router = express.Router();
const deptController = require("./../controllers/deptController");

router
  .route("/")
  .get(deptController.getAllDept)
  .post(deptController.createDept)
  .patch(deptController.updateDept)
  .delete(deptController.deleteDept);

router.route("/:id").get(deptController.getDeptById);

router.route("/extra/count").get(deptController.countDept);

module.exports = router;
