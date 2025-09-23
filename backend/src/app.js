const express = require("express");
const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/usersRoute");
const attemptRouter = require("./routes/attemptRouter");
const quizRouter = require("./routes/quizRouter");
const resultsRoutes = require("./routes/resultsRouter");
const analyticsRouter = require("./routes/analyticsRouter");

const app = express();
app.use(express.json());

const cors = require("cors");

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/attempts", attemptRouter);
app.use("/api/v1/quizzes", quizRouter);
app.use("/api/v1/quizzes", resultsRoutes);
app.use("/api", analyticsRouter);

module.exports = app;
