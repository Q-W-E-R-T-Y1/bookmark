export interface Bookmark {
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

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  createdAt: Date;
}

export interface BookmarkStats {
  totalBookmarks: number;
  totalFolders: number;
  recentlyAdded: Bookmark[];
  mostVisited: Bookmark[];
}