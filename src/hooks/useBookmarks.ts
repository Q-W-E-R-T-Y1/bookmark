import { useState } from 'react';
import { Bookmark, Folder } from '@/types/bookmark';

// Mock data for development
const initialFolders: Folder[] = [
  { id: 'root', name: 'All Bookmarks', createdAt: new Date() },
  { id: 'work', name: 'Work', parentId: 'root', color: 'blue', createdAt: new Date() },
  { id: 'personal', name: 'Personal', parentId: 'root', color: 'green', createdAt: new Date() },
  { id: 'dev', name: 'Development', parentId: 'work', color: 'purple', createdAt: new Date() },
  { id: 'design', name: 'Design', parentId: 'work', color: 'pink', createdAt: new Date() },
];

const initialBookmarks: Bookmark[] = [
  {
    id: '1',
    title: 'React Documentation',
    url: 'https://react.dev',
    description: 'The official React documentation',
    folderId: 'dev',
    createdAt: new Date('2024-01-15'),
    thumbnail: 'https://react.dev/images/home/conf2021/cover.svg'
  },
  {
    id: '2',
    title: 'Figma',
    url: 'https://figma.com',
    description: 'Collaborative design tool',
    folderId: 'design',
    createdAt: new Date('2024-01-10'),
    thumbnail: 'https://cdn.worldvectorlogo.com/logos/figma-5.svg'
  },
  {
    id: '3',
    title: 'GitHub',
    url: 'https://github.com',
    description: 'Code repository and collaboration platform',
    folderId: 'dev',
    createdAt: new Date('2024-01-20'),
    thumbnail: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
  },
  {
    id: '4',
    title: 'YouTube',
    url: 'https://youtube.com',
    description: 'Video sharing platform',
    folderId: 'personal',
    createdAt: new Date('2024-01-12'),
    thumbnail: 'https://www.youtube.com/s/desktop/12345678/img/favicon_144.png'
  }
];

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');

  const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setBookmarks(prev => [...prev, newBookmark]);
  };

  const updateBookmark = (id: string, updates: Partial<Bookmark>) => {
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === id ? { ...bookmark, ...updates } : bookmark
    ));
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  const addFolder = (folder: Omit<Folder, 'id' | 'createdAt'>) => {
    const newFolder: Folder = {
      ...folder,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(folder => 
      folder.id === id ? { ...folder, ...updates } : folder
    ));
  };

  const deleteFolder = (id: string) => {
    // Move bookmarks to parent folder or root
    const folder = folders.find(f => f.id === id);
    const parentId = folder?.parentId || 'root';
    
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.folderId === id ? { ...bookmark, folderId: parentId } : bookmark
    ));
    
    setFolders(prev => prev.filter(folder => folder.id !== id));
  };

  const moveBookmark = (bookmarkId: string, targetFolderId: string) => {
    updateBookmark(bookmarkId, { folderId: targetFolderId });
  };

  const getBookmarksInFolder = (folderId: string) => {
    if (folderId === 'root') {
      return bookmarks;
    }
    return bookmarks.filter(bookmark => bookmark.folderId === folderId);
  };

  const getSubfolders = (parentId: string) => {
    return folders.filter(folder => folder.parentId === parentId);
  };

  const searchBookmarksAndFolders = (query: string) => {
    const normalizedQuery = query.toLowerCase();
    
    const matchingBookmarks = bookmarks.filter(bookmark => 
      bookmark.title.toLowerCase().includes(normalizedQuery) ||
      bookmark.url.toLowerCase().includes(normalizedQuery) ||
      bookmark.description?.toLowerCase().includes(normalizedQuery)
    );

    const matchingFolders = folders.filter(folder =>
      folder.name.toLowerCase().includes(normalizedQuery)
    );

    return { bookmarks: matchingBookmarks, folders: matchingFolders };
  };

  return {
    bookmarks,
    folders,
    currentFolderId,
    setCurrentFolderId,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    addFolder,
    updateFolder,
    deleteFolder,
    moveBookmark,
    getBookmarksInFolder,
    getSubfolders,
    searchBookmarksAndFolders,
  };
}