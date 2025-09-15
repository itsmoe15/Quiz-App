const express = require("express");
const { getUserById, updateUser } = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/:id", authMiddleware, roleMiddleware("teacher"), getUserById);

router.put("/:id", authMiddleware, updateUser);

module.exports = router;
