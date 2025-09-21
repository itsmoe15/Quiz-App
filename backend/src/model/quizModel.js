const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  type: { 
    type: String, 
    enum: ['mcq', 'short', 'numeric'],
    required: true 
  },
  prompt: { type: String, required: true },
  options: [{ 
    id: String, 
    text: String 
  }],
  correctAnswer: Schema.Types.Mixed,
  points: { type: Number, default: 1 },
  allowLateSubmission: { type: Boolean, default: false }
});

const quizSchema = new Schema({
  teacherId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Teacher',
    required: true 
  },
  title: { type: String, required: true },
  description: String,
  questions: [questionSchema],
  quizCode: { type: String, unique: true, required: true },
  pin: String,
  startAt: Date,
  endAt: Date,
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  settings: {
    scoringMode: { 
      type: String, 
      enum: ['confidence_absolute', 'confidence_scaled', 'binary'],
      default: 'confidence_absolute' 
    },
    negativeForWrong: { type: Boolean, default: false },
    maxConfidencePoints: Number
  },
  joinUrl: { type: String }, // M&M: fml how didnt i add this before
  // M&M: rahaf u can add accuracy and other stuff here but make them
  //      in an object called "statistics" or something
});


module.exports = mongoose.model('Quiz', quizSchema);