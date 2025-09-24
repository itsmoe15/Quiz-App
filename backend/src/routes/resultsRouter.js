const express = require("express");
const router = express.Router({ mergeParams: true });
const { requireAuth, requireTeacher } = require("../middleware/auth");
const {
  getQuizResults,
  getStudentResults,
  exportResults,
} = require("../controller/resultsController");

// GET all quiz results (teacher only)
router.get("/:quizId/results", requireAuth, requireTeacher, getQuizResults);

// Individual student attempts
router.get("/:quizId/results/:studentId", requireAuth, getStudentResults);

// Export CSV (teacher only)
router.get("/:quizId/export", requireAuth, requireTeacher, exportResults);

module.exports = router;
