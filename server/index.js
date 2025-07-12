import express from "express";
import cors from "cors";
import env from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import excelRoutes from "./routes/excelRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import attendanceRoute from "./routes/attendanceRoute.js";
import {addStaff} from "./controllers/addStaff.js";
import db from "./database.js";
import { scheduleDeadlineReminders } from "./controllers/emailController.js";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

env.config();

const app = express();
const port = process.env.BACKEND_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Routes
app.use("/", authRoutes);
app.use("/messages", messageRoutes);
app.use("/announcements", announcementRoutes);
app.use("/contact", contactRoutes);
app.use("/", emailRoutes);
app.use("/", excelRoutes);
app.use("/courses", courseRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/submissions", submissionRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", studentRoutes);
app.use("/attendance", attendanceRoute);
app.use("/add-staff",addStaff);
// Test endpoints
app.get("/", async (req, res) => {
  res.send("Server is running");
});
app.get("/messages", async (req, res) => {
  const result = await db.query("SELECT * FROM messages");
  res.send(result.rows);
});

// React router fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.js"));
});

// Start server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});


// Start background jobs
scheduleDeadlineReminders();
