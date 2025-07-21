import { useState, useMemo } from 'react';
import { Plus, Grid, List, SortAsc, Filter } from 'lucide-react';
import { Bookmark, Folder as FolderType } from '@/types/bookmark';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FolderSidebar } from './FolderSidebar';
import { BookmarkCard } from './BookmarkCard';
import { AddBookmarkDialog } from './AddBookmarkDialog';
import { BookmarkPreview } from './BookmarkPreview';
import { FolderDialog } from './FolderDialog';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'url';

export function BookmarkManager() {
  const {
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
    searchBookmarksAndFolders,
  } = useBookmarks();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | undefined>();
  const [editingFolder, setEditingFolder] = useState<FolderType | undefined>();
  const [previewBookmark, setPreviewBookmark] = useState<Bookmark | null>(null);
  const [newFolderParentId, setNewFolderParentId] = useState<string>('root');

  const { toast } = useToast();

  // Calculate bookmark counts for folders
  const bookmarkCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    folders.forEach(folder => {
      if (folder.id === 'root') {
        counts[folder.id] = bookmarks.length;
      } else {
        counts[folder.id] = bookmarks.filter(b => b.folderId === folder.id).length;
      }
    });
    
    return counts;
  }, [bookmarks, folders]);

  // Get current bookmarks based on search or folder
  const currentBookmarks = useMemo(() => {
    let results: Bookmark[];
    
    if (searchQuery) {
      const searchResults = searchBookmarksAndFolders(searchQuery);
      results = searchResults.bookmarks;
    } else {
      results = getBookmarksInFolder(currentFolderId);
    }

    // Sort bookmarks
    return results.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'url':
          return a.url.localeCompare(b.url);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [searchQuery, currentFolderId, getBookmarksInFolder, searchBookmarksAndFolders, sortBy]);

  const currentFolder = folders.find(f => f.id === currentFolderId);

  const handleAddBookmark = () => {
    setEditingBookmark(undefined);
    setShowAddBookmark(true);
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setShowAddBookmark(true);
  };

  const handleSaveBookmark = (bookmarkData: Omit<Bookmark, 'id' | 'createdAt'>) => {
    if (editingBookmark) {
      updateBookmark(editingBookmark.id, bookmarkData);
      toast({
        title: "Bookmark updated",
        description: "Your bookmark has been successfully updated."
      });
    } else {
      addBookmark(bookmarkData);
      toast({
        title: "Bookmark added",
        description: "Your bookmark has been successfully saved."
      });
    }
  };

  const handleDeleteBookmark = (id: string) => {
    deleteBookmark(id);
    toast({
      title: "Bookmark deleted",
      description: "The bookmark has been removed."
    });
  };

  const handlePreviewBookmark = (bookmark: Bookmark) => {
    setPreviewBookmark(bookmark);
    setShowPreview(true);
    
    // Update last visited
    updateBookmark(bookmark.id, { lastVisited: new Date() });
  };

  const handleAddFolder = (parentId?: string) => {
    setEditingFolder(undefined);
    setNewFolderParentId(parentId || 'root');
    setShowAddFolder(true);
  };

  const handleEditFolder = (folder: FolderType) => {
    setEditingFolder(folder);
    setShowAddFolder(true);
  };

  const handleSaveFolder = (folderData: Omit<FolderType, 'id' | 'createdAt'>) => {
    if (editingFolder) {
      updateFolder(editingFolder.id, folderData);
      toast({
        title: "Folder updated",
        description: "The folder has been successfully updated."
      });
    } else {
      addFolder(folderData);
      toast({
        title: "Folder created",
        description: "New folder has been created successfully."
      });
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    deleteFolder(folderId);
    if (currentFolderId === folderId) {
      setCurrentFolderId('root');
    }
    toast({
      title: "Folder deleted",
      description: "The folder and its contents have been moved to the parent folder."
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <FolderSidebar
        folders={folders}
        currentFolderId={currentFolderId}
        onFolderSelect={setCurrentFolderId}
        onAddFolder={handleAddFolder}
        onEditFolder={handleEditFolder}
        onDeleteFolder={handleDeleteFolder}
        bookmarkCounts={bookmarkCounts}
        onSearch={handleSearch}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {searchQuery ? `Search results for "${searchQuery}"` : currentFolder?.name || 'Bookmarks'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {currentBookmarks.length} bookmark{currentBookmarks.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SortAsc className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy('date')}>
                      Date Added
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name')}>
                      Name
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('url')}>
                      URL
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View mode toggle */}
                <div className="flex border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-7 px-2"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-7 px-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <Button onClick={handleAddBookmark}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bookmark
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {currentBookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No bookmarks found' : 'No bookmarks yet'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {searchQuery 
                  ? 'Try adjusting your search terms or browse your folders.'
                  : 'Start building your bookmark collection by adding your first bookmark.'
                }
              </p>
              {!searchQuery && (
                <Button onClick={handleAddBookmark}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Bookmark
                </Button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'
                : 'space-y-2'
            }>
              {currentBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onEdit={handleEditBookmark}
                  onDelete={handleDeleteBookmark}
                  onPreview={handlePreviewBookmark}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddBookmarkDialog
        open={showAddBookmark}
        onOpenChange={setShowAddBookmark}
        onSave={handleSaveBookmark}
        folders={folders}
        initialFolderId={currentFolderId}
        editBookmark={editingBookmark}
      />

      <FolderDialog
        open={showAddFolder}
        onOpenChange={setShowAddFolder}
        onSave={handleSaveFolder}
        folders={folders}
        parentFolderId={newFolderParentId}
        editFolder={editingFolder}
      />

      <BookmarkPreview
        bookmark={previewBookmark}
        open={showPreview}
        onOpenChange={setShowPreview}
        onEdit={handleEditBookmark}
      />
    </div>
  );
}