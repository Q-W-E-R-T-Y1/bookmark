let folders = [
  { id: 'root', name: 'All Bookmarks', createdAt: new Date() },
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(folders);
  }

  if (req.method === 'POST') {
    const newFolder = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    folders.push(newFolder);
    return res.status(201).json(newFolder);
  }

  res.status(405).json({ message: 'Method not allowed' });
}
