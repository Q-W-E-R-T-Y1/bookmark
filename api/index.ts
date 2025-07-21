import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3001;
const dbPath = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json());

// Helper function to read data from db.json
const readData = () => {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data to db.json
const writeData = (data: any) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Bookmarks API
app.get('/api/bookmarks', (req, res) => {
  const data = readData();
  res.json(data.bookmarks);
});

app.post('/api/bookmarks', (req, res) => {
  const data = readData();
  const newBookmark = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  data.bookmarks.push(newBookmark);
  writeData(data);
  res.json(newBookmark);
});

app.put('/api/bookmarks/:id', (req, res) => {
  const data = readData();
  const bookmarkIndex = data.bookmarks.findIndex((b: any) => b.id === req.params.id);
  if (bookmarkIndex !== -1) {
    data.bookmarks[bookmarkIndex] = { ...data.bookmarks[bookmarkIndex], ...req.body };
    writeData(data);
    res.json(data.bookmarks[bookmarkIndex]);
  } else {
    res.status(404).json({ message: 'Bookmark not found' });
  }
});

app.delete('/api/bookmarks/:id', (req, res) => {
  const data = readData();
  const bookmarkIndex = data.bookmarks.findIndex((b: any) => b.id === req.params.id);
  if (bookmarkIndex !== -1) {
    data.bookmarks.splice(bookmarkIndex, 1);
    writeData(data);
    res.json({ message: 'Bookmark deleted' });
  } else {
    res.status(404).json({ message: 'Bookmark not found' });
  }
});

// Folders API
app.get('/api/folders', (req, res) => {
  const data = readData();
  res.json(data.folders);
});

app.post('/api/folders', (req, res) => {
  const data = readData();
  const newFolder = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  data.folders.push(newFolder);
  writeData(data);
  res.json(newFolder);
});

app.put('/api/folders/:id', (req, res) => {
  const data = readData();
  const folderIndex = data.folders.findIndex((f: any) => f.id === req.params.id);
  if (folderIndex !== -1) {
    data.folders[folderIndex] = { ...data.folders[folderIndex], ...req.body };
    writeData(data);
    res.json(data.folders[folderIndex]);
  } else {
    res.status(404).json({ message: 'Folder not found' });
  }
});

app.delete('/api/folders/:id', (req, res) => {
  const data = readData();
  const folderIndex = data.folders.findIndex((f: any) => f.id === req.params.id);
  if (folderIndex !== -1) {
    data.folders.splice(folderIndex, 1);
    writeData(data);
    res.json({ message: 'Folder deleted' });
  } else {
    res.status(404).json({ message: 'Folder not found' });
  }
});

export default app;