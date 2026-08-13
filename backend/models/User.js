const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    availability: {
      type: String,
      trim: true,
      default: "Flexible",
    },
    college: {
      type: String,
      trim: true,
      default: "",
    },
    avatarColor: {
      type: String,
      default: "#2A9D8F",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
