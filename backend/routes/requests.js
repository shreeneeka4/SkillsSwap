const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const Skill = require("../models/Skill");

const POPULATE_FIELDS = [
  { path: "skill", select: "title category level" },
  { path: "fromUser", select: "name email avatarColor" },
  { path: "toUser", select: "name email avatarColor" },
];

// GET /api/requests?user=<id>&role=sent|received
router.get("/", async (req, res) => {
  try {
    const { user, role } = req.query;
    if (!user) return res.status(400).json({ message: "user query param is required" });

    let query;
    if (role === "sent") query = { fromUser: user };
    else if (role === "received") query = { toUser: user };
    else query = { $or: [{ fromUser: user }, { toUser: user }] };

    const requests = await Request.find(query)
      .populate(POPULATE_FIELDS)
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
});

// POST /api/requests - send a learning request for a skill
router.post("/", async (req, res) => {
  try {
    const { skillId, fromUser, message } = req.body;
    if (!skillId || !fromUser) {
      return res.status(400).json({ message: "skillId and fromUser are required" });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    if (String(skill.teacher) === String(fromUser)) {
      return res.status(400).json({ message: "You cannot request to learn your own skill" });
    }

    const existing = await Request.findOne({
      skill: skillId,
      fromUser,
      status: "Pending",
    });
    if (existing) {
      return res.status(409).json({ message: "You already have a pending request for this skill" });
    }

    const request = await Request.create({
      skill: skillId,
      fromUser,
      toUser: skill.teacher,
      message: message || "",
    });

    const populated = await request.populate(POPULATE_FIELDS);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: "Failed to send request", error: err.message });
  }
});

// PATCH /api/requests/:id/status - accept or reject a request (teacher action)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be Pending, Accepted or Rejected" });
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate(POPULATE_FIELDS);

    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: "Failed to update request", error: err.message });
  }
});

// DELETE /api/requests/:id - cancel/withdraw a request
router.delete("/:id", async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request deleted", id: req.params.id });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete request", error: err.message });
  }
});

module.exports = router;
