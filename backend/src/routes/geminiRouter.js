const express = require("express");
const router = express.Router();
const geminiController = require("../controller/geminiController.js");
const { requireAuth, requireTeacher } = require('../middleware/auth');

const upload = require("../middleware/uploadMiddleware");

router.post("/generate-quiz", requireAuth, requireTeacher, upload.single("file"), geminiController.generateQuiz);

module.exports = router;

