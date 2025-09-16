const express = require("express");
const router = express.Router({ mergeParams: true });
const { requireAuth, requireTeacher } = require("../middleware/auth");
const {
  getQuizSummary,
  getStudentResults,
  exportResults,
} = require("../controller/resultsController");

// get summary stats of quiz results, teacher only
router.get(
  "/:quizId/results/summary",
  requireAuth,
  requireTeacher,
  getQuizSummary
);

router.get("/:quizId/results/:studentId", requireAuth, getStudentResults);

//export quiz results as CSV, Teacher ONLY
router.get(
  "/:quizId/export",
  requireAuth, // first check if authenticated
  requireTeacher, // then check if teacher, same thing in the one above im too lazy to write this again
  exportResults
);

module.exports = router;
