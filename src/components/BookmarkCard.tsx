import { useState } from 'react';
import { ExternalLink, Edit, Trash2, Globe } from 'lucide-react';
import { Bookmark } from '@/types/bookmark';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onPreview: (bookmark: Bookmark) => void;
}

export function BookmarkCard({ bookmark, onEdit, onDelete, onPreview }: BookmarkCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card className="group relative overflow-hidden bg-bookmark-card border-bookmark-border hover:bg-bookmark-hover hover:shadow-elevated transition-all duration-200 cursor-pointer">
          <div className="aspect-video w-full bg-thumbnail-bg relative overflow-hidden">
            {bookmark.thumbnail && !imageError ? (
              <img
                src={bookmark.thumbnail}
                alt={bookmark.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-thumbnail-bg">
                <Globe className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            
            {/* Overlay buttons */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(bookmark);
                }}
                className="bg-glass-bg backdrop-blur-sm border-white/20"
              >
                Preview
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(bookmark.url, '_blank');
                }}
                className="bg-glass-bg backdrop-blur-sm border-white/20"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm line-clamp-2 leading-5">
                {bookmark.title}
              </h3>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(bookmark);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(bookmark.id);
                  }}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {bookmark.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {bookmark.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {getDomain(bookmark.url)}
              </span>
              <span>{formatDate(bookmark.createdAt)}</span>
            </div>
          </div>
        </Card>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={() => onPreview(bookmark)}>
          Preview
        </ContextMenuItem>
        <ContextMenuItem onClick={() => window.open(bookmark.url, '_blank')}>
          Open in New Tab
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onEdit(bookmark)}>
          Edit Bookmark
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onDelete(bookmark.id)}
          className="text-destructive focus:text-destructive"
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}