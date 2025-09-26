const express = require("express");
const { getUserById, updateUser } = require("../controller/userController");
const { requireAuth, requireTeacher } = require("../middleware/auth");

const router = express.Router();

router.get("/:id", requireAuth, requireTeacher, getUserById);

router.patch("/:id", requireAuth, updateUser);

module.exports = router;
