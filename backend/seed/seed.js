/**
 * Seed script — wipes and repopulates the database with sample data
 * so the app is immediately usable.
 *
 * Run with: npm run seed  (from the backend/ folder)
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Skill = require("../models/Skill");
const Request = require("../models/Request");

const colors = ["#2A9D8F", "#E76F51", "#457B9D", "#F4A261", "#8338EC", "#3A86FF"];

const users = [
  {
    name: "Aisha Rahman",
    email: "aisha@campus.edu",
    bio: "CS junior who loves teaching Python and learning design.",
    availability: "Weekday evenings",
    college: "Metro State University",
    avatarColor: colors[0],
  },
  {
    name: "Diego Alvarez",
    email: "diego@campus.edu",
    bio: "Guitarist and music theory nerd. Also picking up web dev.",
    availability: "Weekends",
    college: "Metro State University",
    avatarColor: colors[1],
  },
  {
    name: "Priya Nair",
    email: "priya@campus.edu",
    bio: "Graphic design major, happy to trade Figma tips for Spanish practice.",
    availability: "Tue/Thu afternoons",
    college: "Riverbend College",
    avatarColor: colors[2],
  },
  {
    name: "Sam Okafor",
    email: "sam@campus.edu",
    bio: "Business student teaching Excel & pitching, wants to learn guitar.",
    availability: "Flexible",
    college: "Riverbend College",
    avatarColor: colors[3],
  },
  {
    name: "Lena Kowalski",
    email: "lena@campus.edu",
    bio: "Math tutor on the side, always down to learn something creative.",
    availability: "Mornings",
    college: "Metro State University",
    avatarColor: colors[4],
  },
];

const skillsData = [
  {
    owner: "aisha@campus.edu",
    title: "Python for Beginners",
    description:
      "Learn the fundamentals of Python: variables, loops, functions, and small projects. Great for absolute beginners.",
    category: "Programming",
    level: "Beginner",
  },
  {
    owner: "aisha@campus.edu",
    title: "Intro to Data Structures",
    description:
      "Arrays, linked lists, stacks and queues explained with visual examples and coding exercises.",
    category: "Programming",
    level: "Intermediate",
  },
  {
    owner: "diego@campus.edu",
    title: "Acoustic Guitar Basics",
    description: "Chords, strumming patterns, and how to play your first three songs in a week.",
    category: "Music",
    level: "Beginner",
  },
  {
    owner: "diego@campus.edu",
    title: "Music Theory Crash Course",
    description: "Scales, key signatures, and chord progressions for songwriters.",
    category: "Music",
    level: "Intermediate",
  },
  {
    owner: "priya@campus.edu",
    title: "Figma for Product Design",
    description: "Wireframing, components, and prototyping in Figma, from a real design project.",
    category: "Design",
    level: "Beginner",
  },
  {
    owner: "priya@campus.edu",
    title: "Conversational Spanish",
    description: "Practice everyday Spanish conversation, travel phrases and basic grammar.",
    category: "Languages",
    level: "Beginner",
  },
  {
    owner: "sam@campus.edu",
    title: "Excel for Data Analysis",
    description: "Pivot tables, formulas, and dashboards for coursework or internships.",
    category: "Business",
    level: "Intermediate",
  },
  {
    owner: "sam@campus.edu",
    title: "Pitch Deck Essentials",
    description: "Structure and design a pitch deck that actually gets read by investors or judges.",
    category: "Business",
    level: "Beginner",
  },
  {
    owner: "lena@campus.edu",
    title: "Calculus I Tutoring",
    description: "Limits, derivatives and integrals explained step by step with practice problems.",
    category: "Academics",
    level: "Beginner",
  },
  {
    owner: "lena@campus.edu",
    title: "Watercolor Painting for Beginners",
    description: "Loose, relaxing watercolor techniques — no experience needed, just curiosity.",
    category: "Arts & Crafts",
    level: "Beginner",
  },
];

async function seed() {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([User.deleteMany({}), Skill.deleteMany({}), Request.deleteMany({})]);

  console.log("Creating users...");
  const createdUsers = await User.insertMany(users);
  const userByEmail = Object.fromEntries(createdUsers.map((u) => [u.email, u]));

  console.log("Creating skills...");
  const skillDocs = skillsData.map((s) => ({
    title: s.title,
    description: s.description,
    category: s.category,
    level: s.level,
    teacher: userByEmail[s.owner]._id,
  }));
  const createdSkills = await Skill.insertMany(skillDocs);

  console.log("Creating sample learning requests...");
  const aisha = userByEmail["aisha@campus.edu"];
  const diego = userByEmail["diego@campus.edu"];
  const priya = userByEmail["priya@campus.edu"];
  const sam = userByEmail["sam@campus.edu"];
  const lena = userByEmail["lena@campus.edu"];

  const findSkill = (title) => createdSkills.find((s) => s.title === title);

  await Request.insertMany([
    {
      skill: findSkill("Acoustic Guitar Basics")._id,
      fromUser: sam._id,
      toUser: diego._id,
      message: "Would love to finally learn guitar this semester!",
      status: "Pending",
    },
    {
      skill: findSkill("Figma for Product Design")._id,
      fromUser: aisha._id,
      toUser: priya._id,
      message: "I want to make my side project look less like a spreadsheet.",
      status: "Accepted",
    },
    {
      skill: findSkill("Calculus I Tutoring")._id,
      fromUser: diego._id,
      toUser: lena._id,
      message: "Struggling with derivatives, could really use a study buddy.",
      status: "Pending",
    },
    {
      skill: findSkill("Conversational Spanish")._id,
      fromUser: lena._id,
      toUser: priya._id,
      message: "Planning a trip abroad, want to pick up basics.",
      status: "Rejected",
    },
    {
      skill: findSkill("Python for Beginners")._id,
      fromUser: priya._id,
      toUser: aisha._id,
      message: "Want to automate some of my design workflow.",
      status: "Pending",
    },
  ]);

  console.log("\nSeed complete!");
  console.log(`  Users:    ${createdUsers.length}`);
  console.log(`  Skills:   ${createdSkills.length}`);
  console.log(`  Requests: 5`);
  console.log("\nSample login (use the profile switcher in the app):");
  createdUsers.forEach((u) => console.log(`  - ${u.name} <${u.email}>`));

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
