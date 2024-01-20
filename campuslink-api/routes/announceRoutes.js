const express = require("express");
const router = express.Router();
const announceController = require("./../controllers/announceController");

router
  .route("/:announceId")
  .patch(announceController.updateAnnounce)
  .delete(announceController.deleteAnnounce);

router
  .route("/")
  .get(announceController.getAnnouncements)
  .post(announceController.addAnnounce);

module.exports = router;
