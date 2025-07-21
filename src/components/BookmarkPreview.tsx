import { useState } from 'react';
import { ExternalLink, Edit, Clock, Globe, X } from 'lucide-react';
import { Bookmark } from '@/types/bookmark';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface BookmarkPreviewProps {
  bookmark: Bookmark | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (bookmark: Bookmark) => void;
}

export function BookmarkPreview({ bookmark, open, onOpenChange, onEdit }: BookmarkPreviewProps) {
  const [iframeError, setIframeError] = useState(false);

  if (!bookmark) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  const handleIframeLoad = () => {
    setIframeError(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-semibold line-clamp-2">
                {bookmark.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>{getDomain(bookmark.url)}</span>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>Added {formatDate(bookmark.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(bookmark)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(bookmark.url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Metadata Section */}
          <div className="px-6 py-4 border-b bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Thumbnail */}
              {bookmark.thumbnail && (
                <div className="flex items-center gap-3">
                  <img
                    src={bookmark.thumbnail}
                    alt={bookmark.title}
                    className="w-16 h-16 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{bookmark.title}</p>
                    <p className="text-xs text-muted-foreground">{getDomain(bookmark.url)}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {bookmark.description && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{bookmark.description}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {bookmark.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground bg-background rounded-lg p-3 border">
                  {bookmark.notes}
                </p>
              </div>
            )}

            {/* Metadata badges */}
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(bookmark.createdAt)}
              </Badge>
              {bookmark.lastVisited && (
                <Badge variant="outline">
                  Last visited {formatDate(bookmark.lastVisited)}
                </Badge>
              )}
            </div>
          </div>

          {/* Website Preview */}
          <div className="flex-1 relative bg-background">
            {!iframeError ? (
              <iframe
                src={bookmark.url}
                className="w-full h-full border-0"
                title={bookmark.title}
                onError={handleIframeError}
                onLoad={handleIframeLoad}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Preview not available</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  This website cannot be displayed in a preview frame. 
                  This is usually due to security restrictions.
                </p>
                <Button
                  onClick={() => window.open(bookmark.url, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}