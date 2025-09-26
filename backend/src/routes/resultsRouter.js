const express = require("express");
const router = express.Router({ mergeParams: true });
const { requireAuth, requireTeacher } = require("../middleware/auth");
const {
  getQuizResults,
  getStudentResults,
  exportResults,
} = require("../controller/resultsController");

router.get("/:quizId/results", requireAuth, requireTeacher, getQuizResults);

router.get("/:quizId/results/:studentId", requireAuth, getStudentResults);

router.get("/:quizId/export", requireAuth, requireTeacher, exportResults);

module.exports = router;
