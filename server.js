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
      } catch {
        submissions = [];
      }
    }

    submissions.push({
      ...submission,
      time: new Date().toISOString()
    });

    fs.writeFile(filePath, JSON.stringify(submissions, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing file:', writeErr);
        return res.status(500).json({ ok: false, message: 'Save failed' });
      }
      console.log('Saved new submission:', submission.name || 'Unnamed');
      return res.json({ ok: true, message: 'Submission saved successfully' });
    });
  });
});

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Learning for Life server running on port ${PORT}`);
});