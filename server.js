// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'avinash.ofl@gmail.com', // <-- your Gmail address here
    pass: 'lapc mqyo cpjd zrvc'     // <-- your 16-character app password here
  }
});

// API route to handle contact form submissions
app.post('/api/contact', (req, res) => {
  const submission = req.body;
  const filePath = path.join(__dirname, 'contact-submissions.json');

  // Save submission to JSON file (optional, for record)
  fs.readFile(filePath, 'utf8', (err, data) => {
    let submissions = [];
    if (!err && data) {
      try {
        submissions = JSON.parse(data);
      } catch (e) {
        submissions = [];
      }
    }
    submissions.push(submission);

    fs.writeFile(filePath, JSON.stringify(submissions, null, 2), () => {
      console.log('New contact submission saved.');
    });
  });

  // Prepare email
  const mailOptions = {
    from: `"Learning for Life Website" <YOUR_EMAIL@gmail.com>`, // sender
    to: 'YOUR_EMAIL@gmail.com', // where you want to receive submissions
    subject: `New Contact Form Submission - ${submission.name || 'No name'}`,
    text: `
New submission from Learning for Life website:

Name: ${submission.name || 'N/A'}
Email: ${submission.email || 'N/A'}
Role: ${submission.role || 'N/A'}
Focus: ${submission.focus || 'N/A'}
Note: ${submission.note || 'N/A'}
    `
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ ok: false, message: 'Email not sent.' });
    } else {
      console.log('Email sent:', info.response);
      return res.json({ ok: true, message: 'Submission received and emailed.' });
    }
  });
});

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Learning for Life server running on port ${PORT}`);
});