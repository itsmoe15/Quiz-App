const express = require("express");
const { getUserById, updateUser } = require("../controller/userController");
const { requireAuth, requireTeacher } = require("../middleware/auth");

const router = express.Router();

router.get("/:id", requireAuth, requireTeacher, getUserById);

router.put("/:id", requireAuth, updateUser);

module.exports = router;
