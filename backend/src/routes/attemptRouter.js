const express = require('express');
const router = express.Router();
const attemptController = require('../controller/attemptController');
const { requireAuth, requireTeacher, requireStudent } = require('../middleware/auth');

router.post('/public/start', attemptController.startPublicAttempt);
router.post('/public/:attemptId/save', attemptController.savePublicAttempt);
router.post('/public/:attemptId/submit', attemptController.submitPublicAttempt);
router.get('/public/:attemptId', attemptController.getPublicAttempt);

router.post('/start', requireAuth, requireStudent, attemptController.startAttempt);
router.post('/:attemptId/save', requireAuth, requireStudent, attemptController.saveAttempt);
router.post('/:attemptId/submit', requireAuth, requireStudent, attemptController.submitAttempt);
router.get('/:attemptId', requireAuth, attemptController.getAttemptById);

router.get('/quiz/:quizId', requireAuth, requireTeacher, attemptController.getAttemptsForQuiz);

module.exports = router;
