// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === CONTACT FORM HANDLER ===
app.post('/api/contact', (req, res) => {
  const submission = req.body;
  const filePath = path.join(__dirname, 'contact-submissions.json');

  // Read old data (if any)
  fs.readFile(filePath, 'utf8', (err, data) => {
    let submissions = [];
    if (!err && data) {
      try {
        submissions = JSON.parse(data);
      } catch {
        submissions = [];
      }
    }

    // Add new submission with timestamp
    submissions.push({
      ...submission,
      time: new Date().toISOString(),
    });

    // Save updated list
    fs.writeFile(filePath, JSON.stringify(submissions, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing submissions:', writeErr);
        return res.status(500).json({ ok: false, message: 'Save failed' });
      }
      console.log('Saved new submission:', submission.name || 'Unnamed');
      res.json({ ok: true, message: 'Submission saved successfully' });
    });
  });
});

// === ADMIN ROUTE (VIEW SUBMISSIONS) ===
app.get('/admin/submissions', (req, res) => {
  const filePath = path.join(__dirname, 'contact-submissions.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading contact-submissions.json:', err);
      return res
        .status(500)
        .send('<h2>No submissions found yet or file not created.</h2>');
    }

    try {
      const submissions = JSON.parse(data);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(submissions, null, 2));
    } catch (e) {
      console.error('Invalid JSON data:', e);
      res.status(500).send('<h2>Corrupted submissions file.</h2>');
    }
  });
});

// === DEFAULT ROUTE (FRONTEND) ===
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`Learning for Life server running on port ${PORT}`);
});