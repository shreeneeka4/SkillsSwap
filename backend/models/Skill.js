const mongoose = require("mongoose");

const CATEGORIES = [
  "Programming",
  "Design",
  "Music",
  "Languages",
  "Academics",
  "Sports & Fitness",
  "Business",
  "Arts & Crafts",
  "Other",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const SkillSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
      default: "Other",
    },
    level: {
      type: String,
      required: true,
      enum: LEVELS,
      default: "Beginner",
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

SkillSchema.index({ title: "text", description: "text" });

SkillSchema.statics.CATEGORIES = CATEGORIES;
SkillSchema.statics.LEVELS = LEVELS;

module.exports = mongoose.model("Skill", SkillSchema);
