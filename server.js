// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// --- SIMPLE DATA STORAGE (JSON FILE) ---
const DATA_FILE = path.join(__dirname, "contact-submissions.json");

// helper to save a submission locally
function saveSubmissionLocally(entry) {
  let data = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      data = JSON.parse(raw || "[]");
    } catch (e) {
      data = [];
    }
  }
  data.push(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// --- EMAIL TRANSPORTER (OPTIONAL) ---
// If you want real emails, create a .env file and set:
// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=465
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASS=your-app-password
// EMAIL_TO=where-you-want-to-receive
let transporter = null;

if (
  process.env.EMAIL_HOST &&
  process.env.EMAIL_PORT &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_TO
) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for others
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// --- API ROUTES ---

// Contact form handler
app.post("/api/contact", async (req, res) => {
  const { name, email, role, focus, note } = req.body;

  if (!name || !email) {
    return res.status(400).json({ ok: false, message: "Name and email are required." });
  }

  const submission = {
    name,
    email,
    role: role || "",
    focus: focus || "",
    note: note || "",
    createdAt: new Date().toISOString()
  };

  // 1) Save to local JSON file
  saveSubmissionLocally(submission);

  // 2) Try to send email if configured
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Learning for Life Studio" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO,
        subject: "New Learning for Life enquiry",
        text: `
New enquiry from the website:

Name: ${name}
Email: ${email}
Role: ${role || "-"}
Focus: ${focus || "-"}
Note: ${note || "-"}
        `.trim()
      });
    } catch (err) {
      console.error("Error sending email:", err.message);
    }
  }

  return res.json({
    ok: true,
    message: "Thank you for your message. We will reply shortly."
  });
});

// Simple admin page to view submissions
app.get("/admin/submissions", (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.send("<h1>No submissions yet</h1>");
  }
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const list = JSON.parse(raw || "[]");

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Contact submissions</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 24px; }
          h1 { margin-bottom: 12px; }
          .item { border:1px solid #ddd; margin-bottom: 12px; padding:10px; border-radius:8px; }
          .label { font-size: 11px; text-transform: uppercase; color:#666; letter-spacing:0.12em; }
        </style>
      </head>
      <body>
        <h1>Contact submissions (${list.length})</h1>
        ${list
          .map(
            s => `
          <div class="item">
            <div><span class="label">Name</span><br>${s.name}</div>
            <div><span class="label">Email</span><br>${s.email}</div>
            <div><span class="label">Role</span><br>${s.role || "-"}</div>
            <div><span class="label">Focus</span><br>${s.focus || "-"}</div>
            <div><span class="label">Note</span><br>${s.note || "-"}</div>
            <div><span class="label">Created</span><br>${s.createdAt}</div>
          </div>
        `
          )
          .join("")}
      </body>
    </html>
  `;
  res.send(html);
});

// Fallback to index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Learning for Life server running on port ${PORT}`);
});