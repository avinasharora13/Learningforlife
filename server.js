// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API route to handle contact form submissions
app.post('/api/contact', (req, res) => {
  const submission = req.body;
  const filePath = path.join(__dirname, 'contact-submissions.json');

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

    fs.writeFile(filePath, JSON.stringify(submissions, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error saving contact submission:', writeErr);
        return res.status(500).json({ ok: false, message: 'Failed to save submission' });
      }
      console.log('New contact submission saved');
      res.json({ ok: true });
    });
  });
});

// Fallback route to serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Learning for Life server running on port ${PORT}`);
});