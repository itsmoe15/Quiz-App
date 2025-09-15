const express = require("express");
const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/usersRoute");

const app = express();
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

module.exports = app;
