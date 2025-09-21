const express = require("express");
const router = express.Router();
const quizController = require("../controller/quizController");
const { requireAuth, requireTeacher } = require("../middleware/auth"); 

router.post("/", requireAuth, requireTeacher, quizController.createQuiz);
router.patch("/:id", requireAuth, requireTeacher, quizController.updateQuiz);
router.delete("/:id", requireAuth, requireTeacher, quizController.deleteQuiz);
router.post(
  "/:id/publish",
  requireAuth,
  requireTeacher,
  quizController.publishQuiz
);

router.get("/", requireAuth, requireTeacher, quizController.getQuizzes);
router.get("/:id", requireAuth, quizController.getQuizById);

router.post("/validate-pin", quizController.validatePin);

module.exports = router;
