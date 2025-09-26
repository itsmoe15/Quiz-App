const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  type: {
    type: String,
    enum: ["mcq", "short", "numeric"],
    required: true,
  },
  prompt: { type: String, required: true },
  options: [
    {
      id: String,
      text: String,
    },
  ],
  correctAnswer: Schema.Types.Mixed,
  points: { type: Number, default: 1 },
  allowLateSubmission: { type: Boolean, default: false },
});

const quizSchema = new Schema(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
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
        enum: ["confidence_absolute", "confidence_scaled", "binary"],
        default: "confidence_absolute",
      },
      negativeForWrong: { type: Boolean, default: false },
      maxConfidencePoints: Number,
    },
    joinUrl: { type: String }, 
    statistics: {
      totalAttempts: { type: Number, default: 0 },
      completedAttempts: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 }, 

      meanConfidence: { type: Number, default: 0 },
      confidenceAccuracyCorrelation: { type: Number, default: 0 },

      questionStats: [
        {
          questionId: Schema.Types.ObjectId,
          attemptsCount: { type: Number, default: 0 },
          correctCount: { type: Number, default: 0 },
          averageConfidence: { type: Number, default: 0 },
          discriminationIndex: { type: Number, default: 0 }, 
          optionStats: [
            {
              optionId: String,
              selectedCount: { type: Number, default: 0 },
              confidenceWhenSelected: { type: Number, default: 0 },
            },
          ],
        },
      ],

      averageCompletionTime: { type: Number, default: 0 }, 
      lastUpdated: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
