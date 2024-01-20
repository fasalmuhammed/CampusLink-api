const express = require("express");
const router = express.Router();
const timeScheduleController = require("./../controllers/timeScheduleController");

router
  .route("/")
  .post(timeScheduleController.addTimeSchedule);

router
  .route("/:sem_id")
  .get(timeScheduleController.getTimeSchedule)
  .patch(timeScheduleController.updateTimeSchedule)
  .delete(timeScheduleController.deleteTimeSchedule);

module.exports = router;
