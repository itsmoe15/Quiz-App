const express = require("express");
const { register, login, getMe } = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);

router.post("/login", login);
router.get("/me", authMiddleware, getMe);

module.exports = router;
