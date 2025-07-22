let bookmarks = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(bookmarks);
  }

  if (req.method === 'POST') {
    const newBookmark = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    bookmarks.push(newBookmark);
    return res.status(201).json(newBookmark);
  }

  res.status(405).json({ message: 'Method not allowed' });
}
