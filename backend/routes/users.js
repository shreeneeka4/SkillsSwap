const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Skill = require("../models/Skill");
const Request = require("../models/Request");

// GET /api/users - list all users (used for the "switch active student" picker)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// GET /api/users/:id - single user profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Invalid user id", error: err.message });
  }
});

// POST /api/users - create a new student profile
router.post("/", async (req, res) => {
  try {
    const { name, email, bio, availability, college, avatarColor } = req.body;
    const user = await User.create({ name, email, bio, availability, college, avatarColor });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A user with that email already exists" });
    }
    res.status(400).json({ message: "Failed to create user", error: err.message });
  }
});

// PUT /api/users/:id - edit profile
router.put("/:id", async (req, res) => {
  try {
    const { name, bio, availability, college, avatarColor } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, bio, availability, college, avatarColor },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Failed to update user", error: err.message });
  }
});

// GET /api/users/:id/stats - dashboard statistics for a student
router.get("/:id/stats", async (req, res) => {
  try {
    const userId = req.params.id;

    const [skillsOffered, requestsSent, requestsReceived] = await Promise.all([
      Skill.countDocuments({ teacher: userId }),
      Request.find({ fromUser: userId }),
      Request.find({ toUser: userId }),
    ]);

    const pendingSent = requestsSent.filter((r) => r.status === "Pending").length;
    const pendingReceived = requestsReceived.filter((r) => r.status === "Pending").length;
    const acceptedSent = requestsSent.filter((r) => r.status === "Accepted").length;

    res.json({
      skillsOffered,
      skillsWanted: requestsSent.length, // total learning requests the student has sent
      pendingRequests: pendingSent + pendingReceived,
      pendingSent,
      pendingReceived,
      acceptedSent,
      totalReceived: requestsReceived.length,
    });
  } catch (err) {
    res.status(400).json({ message: "Failed to load stats", error: err.message });
  }
});

module.exports = router;
