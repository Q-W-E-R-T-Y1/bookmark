const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const clientBuildPath = path.join(__dirname, 'dist');
app.use(express.static(clientBuildPath));

// In-memory data
let bookmarks = [];
let folders = [
  { id: 'root', name: 'All Bookmarks', createdAt: new Date() },
];

// API routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });
  if (username === 'admin' && password === 'password') {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/bookmarks', (req, res) => res.json(bookmarks));

app.post('/api/bookmarks', (req, res) => {
  const newBookmark = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  bookmarks.push(newBookmark);
  res.json(newBookmark);
});

app.put('/api/bookmarks/:id', (req, res) => {
  const index = bookmarks.findIndex(b => b.id === req.params.id);
  if (index !== -1) {
    bookmarks[index] = { ...bookmarks[index], ...req.body };
    res.json(bookmarks[index]);
  } else {
    res.status(404).json({ message: 'Bookmark not found' });
  }
});

app.delete('/api/bookmarks/:id', (req, res) => {
  const index = bookmarks.findIndex(b => b.id === req.params.id);
  if (index !== -1) {
    bookmarks.splice(index, 1);
    res.json({ message: 'Bookmark deleted' });
  } else {
    res.status(404).json({ message: 'Bookmark not found' });
  }
});

app.get('/api/folders', (req, res) => res.json(folders));

app.post('/api/folders', (req, res) => {
  const newFolder = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  folders.push(newFolder);
  res.json(newFolder);
});

app.put('/api/folders/:id', (req, res) => {
  const index = folders.findIndex(f => f.id === req.params.id);
  if (index !== -1) {
    folders[index] = { ...folders[index], ...req.body };
    res.json(folders[index]);
  } else {
    res.status(404).json({ message: 'Folder not found' });
  }
});

app.delete('/api/folders/:id', (req, res) => {
  const index = folders.findIndex(f => f.id === req.params.id);
  if (index !== -1) {
    folders.splice(index, 1);
    res.json({ message: 'Folder deleted' });
  } else {
    res.status(404).json({ message: 'Folder not found' });
  }
});

// React fallback (for SPA routes like /login or /bookmarks)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Export app after all routes are defined
module.exports = app;
