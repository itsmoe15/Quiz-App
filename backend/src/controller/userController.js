const User = require("../model/userModel");

// GET /api/v1/users/:id (teacher only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/v1/users/:id (self-update)
const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: "Forbidden" });

    const updates = { ...req.body };
    delete updates.passwordHash;

    const updated = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-passwordHash");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUserById, updateUser };
