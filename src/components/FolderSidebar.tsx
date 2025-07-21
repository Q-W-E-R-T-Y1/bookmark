import { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Search
} from 'lucide-react';
import { Folder as FolderType } from '@/types/bookmark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface FolderSidebarProps {
  folders: FolderType[];
  currentFolderId: string;
  onFolderSelect: (folderId: string) => void;
  onAddFolder: (parentId?: string) => void;
  onEditFolder: (folder: FolderType) => void;
  onDeleteFolder: (folderId: string) => void;
  bookmarkCounts: Record<string, number>;
  onSearch: (query: string) => void;
}

export function FolderSidebar({
  folders,
  currentFolderId,
  onFolderSelect,
  onAddFolder,
  onEditFolder,
  onDeleteFolder,
  bookmarkCounts,
  onSearch
}: FolderSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const renderFolder = (folder: FolderType, level = 0) => {
    const hasChildren = folders.some(f => f.parentId === folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = currentFolderId === folder.id;
    const count = bookmarkCounts[folder.id] || 0;

    return (
      <div key={folder.id} className="select-none">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
                ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-folder-hover'}
              `}
              style={{ paddingLeft: `${12 + level * 16}px` }}
              onClick={() => onFolderSelect(folder.id)}
            >
              {hasChildren && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(folder.id);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
              
              {!hasChildren && <div className="w-4" />}
              
              {isSelected ? (
                <FolderOpen className="h-4 w-4" />
              ) : (
                <Folder className="h-4 w-4" />
              )}
              
              <span className="flex-1 truncate text-sm font-medium">
                {folder.name}
              </span>
              
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full
                  ${isSelected ? 'bg-primary-foreground/20' : 'bg-muted text-muted-foreground'}
                `}>
                  {count}
                </span>
              )}
            </div>
          </ContextMenuTrigger>

          {folder.id !== 'root' && (
            <ContextMenuContent>
              <ContextMenuItem onClick={() => onAddFolder(folder.id)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subfolder
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onEditFolder(folder)}>
                <Edit className="w-4 h-4 mr-2" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => onDeleteFolder(folder.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          )}
        </ContextMenu>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {folders
              .filter(f => f.parentId === folder.id)
              .map(childFolder => renderFolder(childFolder, level + 1))
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-sidebar-bg border-r border-border h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Folders */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Folders</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAddFolder()}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {folders
            .filter(folder => !folder.parentId || folder.parentId === 'root')
            .map(folder => renderFolder(folder))}
        </div>
      </ScrollArea>
    </div>
  );
}