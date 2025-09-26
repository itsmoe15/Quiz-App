const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  questionId: { 
    type: Schema.Types.ObjectId, 
    required: true 
  },
  selectedOptionId: String,
  typedAnswer: String,
  confidence: { 
    type: Number, 
    min: 0, 
    max: 100 
  },
  correct: { type: Boolean, default: false },
  questionPointsAwarded: { type: Number, default: 0 },
  events: [Schema.Types.Mixed]
});

const studentInfoSchema = new Schema({
  name: String,
  email: String,
  studentId: String
}, { _id: false });

const attemptSchema = new Schema({
  quizId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Quiz',
    required: true,
    validate: {
      validator: async function(value) {
        const Quiz = mongoose.model('Quiz');
        const quiz = await Quiz.findById(value);
        return quiz !== null;
      },
      message: 'Quiz does not exist'
    }
  },
  studentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
  },
  studentInfo: studentInfoSchema,

  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  maxPossibleScore: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['in_progress', 'submitted', 'graded'],
    default: 'in_progress' 
  },
  suspiciousEventsCount: { type: Number, default: 0 },
  meta: {
    userAgent: String,
    ipHash: String
  }
});

module.exports = mongoose.model('Attempt', attemptSchema);
