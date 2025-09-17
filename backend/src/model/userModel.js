const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["teacher", "student"], required: true },
  name: { type: String, required: true },
  studentId: { type: String },
  createdAt: { type: Date, default: Date.now },
  meta: {
    avatarUrl: String,
    bio: String,
  },
});

module.exports = mongoose.model("User", userSchema);
