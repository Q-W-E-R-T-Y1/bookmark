import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  favicon?: string;
  folderId: string;
  createdAt: Date;
  lastVisited?: Date;
  notes?: string;
}

interface Folder {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  createdAt: Date;
}

let bookmarks: Bookmark[] = [];
let folders: Folder[] = [
  { id: 'root', name: 'All Bookmarks', createdAt: new Date() },
];

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });
  if (username === 'admin' && password === 'password') {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Bookmarks API
app.get('/api/bookmarks', (req, res) => {
  res.json(bookmarks);
});

app.post('/api/bookmarks', (req, res) => {
  const newBookmark: Bookmark = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  bookmarks.push(newBookmark);
  res.json(newBookmark);
});

app.put('/api/bookmarks/:id', (req, res) => {
  const bookmarkIndex = bookmarks.findIndex((b) => b.id === req.params.id);
  if (bookmarkIndex !== -1) {
    bookmarks[bookmarkIndex] = { ...bookmarks[bookmarkIndex], ...req.body };
    res.json(bookmarks[bookmarkIndex]);
  } else {
    res.status(404).json({ message: 'Bookmark not found' });
  }
});

app.delete('/api/bookmarks/:id', (req, res) => {
  const bookmarkIndex = bookmarks.findIndex((b) => b.id === req.params.id);
  if (bookmarkIndex !== -1) {
    bookmarks.splice(bookmarkIndex, 1);
    res.json({ message: 'Bookmark deleted' });
  } else {
    res.status(404).json({ message: 'Bookmark not found' });
  }
});

// Folders API
app.get('/api/folders', (req, res) => {
  res.json(folders);
});

app.post('/api/folders', (req, res) => {
  const newFolder: Folder = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  folders.push(newFolder);
  res.json(newFolder);
});

app.put('/api/folders/:id', (req, res) => {
  const folderIndex = folders.findIndex((f) => f.id === req.params.id);
  if (folderIndex !== -1) {
    folders[folderIndex] = { ...folders[folderIndex], ...req.body };
    res.json(folders[folderIndex]);
  } else {
    res.status(404).json({ message: 'Folder not found' });
  }
});

app.delete('/api/folders/:id', (req, res) => {
  const folderIndex = folders.findIndex((f) => f.id === req.params.id);
  if (folderIndex !== -1) {
    folders.splice(folderIndex, 1);
    res.json({ message: 'Folder deleted' });
  } else {
    res.status(404).json({ message: 'Folder not found' });
  }
});

export default app;