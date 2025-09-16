const express = require("express");
const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/usersRoute");
const attemptRouter = require("./routes/attemptRouter");
const quizRouter = require("./routes/quizRouter");
const resultsRoutes = require("./routes/resultsRouter");

const app = express();
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/attempts", attemptRouter);
app.use("/api/v1/quizzes", quizRouter);
app.use("/api/v1/quizzes", resultsRoutes);

module.exports = app;
