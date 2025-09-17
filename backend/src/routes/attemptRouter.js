const express = require('express');
const router = express.Router();
const attemptController = require('../controller/attemptController');
const { requireAuth, requireTeacher, requireStudent } = require('../middleware/auth');

router.post('/start', requireAuth, requireStudent, attemptController.startAttempt);
router.post('/:attemptId/save', requireAuth, requireStudent, attemptController.saveAttempt);
router.post('/:attemptId/submit', requireAuth, requireStudent, attemptController.submitAttempt);
router.get('/:attemptId', requireAuth, attemptController.getAttemptById); // student (own) or teacher (view)

router.get('/quiz/:quizId', requireAuth, requireTeacher, attemptController.getAttemptsForQuiz);


module.exports = router;
