const express = require("express");
const router = express.Router();
const analyticsController = require("../controller/analyticsController");
const { requireAuth, requireTeacher } = require("../middleware/auth");

router.use(requireAuth);

router.get(
  "/quizzes/:quizId/analytics/summary",
  requireTeacher,
  analyticsController.getQuizAnalytics
);

router.get(
  "/quizzes/:quizId/analytics/detailed",
  requireTeacher,
  analyticsController.getDetailedAnalytics
);

module.exports = router;
