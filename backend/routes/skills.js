const express = require("express");
const router = express.Router();
const Skill = require("../models/Skill");
const Request = require("../models/Request");

// GET /api/skills/meta/categories - list of valid categories & levels (for dropdowns)
router.get("/meta/categories", (req, res) => {
  res.json({ categories: Skill.CATEGORIES, levels: Skill.LEVELS });
});

// GET /api/skills?search=&category=&level=&teacher=
router.get("/", async (req, res) => {
  try {
    const { search, category, level, teacher } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "All") query.category = category;
    if (level && level !== "All") query.level = level;
    if (teacher) query.teacher = teacher;

    const skills = await Skill.find(query)
      .populate("teacher", "name email bio availability avatarColor")
      .sort({ createdAt: -1 });

    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch skills", error: err.message });
  }
});

// GET /api/skills/:id - skill details, including its teacher
router.get("/:id", async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate(
      "teacher",
      "name email bio availability college avatarColor"
    );
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json(skill);
  } catch (err) {
    res.status(400).json({ message: "Invalid skill id", error: err.message });
  }
});

// POST /api/skills - create a new skill listing
router.post("/", async (req, res) => {
  try {
    const { title, description, category, level, teacher } = req.body;
    if (!teacher) return res.status(400).json({ message: "teacher (user id) is required" });

    const skill = await Skill.create({ title, description, category, level, teacher });
    const populated = await skill.populate("teacher", "name email bio availability avatarColor");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: "Failed to create skill", error: err.message });
  }
});

// PUT /api/skills/:id - edit a skill listing
router.put("/:id", async (req, res) => {
  try {
    const { title, description, category, level } = req.body;
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { title, description, category, level },
      { new: true, runValidators: true }
    ).populate("teacher", "name email bio availability avatarColor");
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json(skill);
  } catch (err) {
    res.status(400).json({ message: "Failed to update skill", error: err.message });
  }
});

// DELETE /api/skills/:id
router.delete("/:id", async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    // also clean up any requests tied to this skill
    await Request.deleteMany({ skill: req.params.id });
    res.json({ message: "Skill deleted", id: req.params.id });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete skill", error: err.message });
  }
});

module.exports = router;
