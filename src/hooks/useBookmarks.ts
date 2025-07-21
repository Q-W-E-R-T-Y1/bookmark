import { useState, useEffect } from 'react';
import { Bookmark, Folder } from '@/types/bookmark';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookmarksRes, foldersRes] = await Promise.all([
          fetch('/api/bookmarks'),
          fetch('/api/folders'),
        ]);
        const bookmarksData = await bookmarksRes.json();
        const foldersData = await foldersRes.json();
        setBookmarks(bookmarksData);
        setFolders(foldersData);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };

    fetchData();
  }, []);

  const addBookmark = async (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmark),
      });
      const newBookmark = await response.json();
      setBookmarks(prev => [...prev, newBookmark]);
    } catch (error) {
      console.error('Failed to add bookmark', error);
    }
  };

  const updateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    try {
      const response = await fetch(`/api/bookmarks/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );
      const updatedBookmark = await response.json();
      setBookmarks(prev => prev.map(b => (b.id === id ? updatedBookmark : b)));
    } catch (error) {
      console.error('Failed to update bookmark', error);
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
      });
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('Failed to delete bookmark', error);
    }
  };

  const addFolder = async (folder: Omit<Folder, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folder),
      });
      const newFolder = await response.json();
      setFolders(prev => [...prev, newFolder]);
    } catch (error) {
      console.error('Failed to add folder', error);
    }
  };

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    try {
      const response = await fetch(`/api/folders/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );
      const updatedFolder = await response.json();
      setFolders(prev => prev.map(f => (f.id === id ? updatedFolder : f)));
    } catch (error) {
      console.error('Failed to update folder', error);
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      await fetch(`/api/folders/${id}`, {
        method: 'DELETE',
      });
      setFolders(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Failed to delete folder', error);
    }
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

  const importBookmarks = (importedBookmarks: Bookmark[], importedFolders: Folder[]) => {
    // This needs to be implemented on the backend
    console.log('Importing bookmarks is not implemented on the backend yet');
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
    getBookmarksInFolder,
    getSubfolders,
    importBookmarks,
    searchBookmarksAndFolders,
  };
}
