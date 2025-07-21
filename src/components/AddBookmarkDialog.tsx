import { useState, useEffect } from 'react';
import { Loader2, Link, FileText, Folder } from 'lucide-react';
import { Bookmark, Folder as FolderType } from '@/types/bookmark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  folders: FolderType[];
  initialFolderId?: string;
  editBookmark?: Bookmark;
}

interface MetaData {
  title: string;
  description: string;
  thumbnail?: string;
  favicon?: string;
}

export function AddBookmarkDialog({
  open,
  onOpenChange,
  onSave,
  folders,
  initialFolderId = 'root',
  editBookmark
}: AddBookmarkDialogProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [folderId, setFolderId] = useState(initialFolderId);
  const [thumbnail, setThumbnail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metaFetched, setMetaFetched] = useState(false);
  
  const { toast } = useToast();

  // Mock metadata fetching function
  const fetchMetadata = async (url: string): Promise<MetaData> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock responses based on domain
    const domain = url.toLowerCase();
    
    if (domain.includes('github.com')) {
      return {
        title: 'GitHub Repository',
        description: 'Code repository and collaboration platform',
        thumbnail: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
      };
    } else if (domain.includes('react.dev')) {
      return {
        title: 'React Documentation',
        description: 'The library for web and native user interfaces',
        thumbnail: 'https://react.dev/images/home/conf2021/cover.svg'
      };
    } else if (domain.includes('figma.com')) {
      return {
        title: 'Figma - Collaborative Design Tool',
        description: 'Build better products as a team. Design, prototype, and gather feedback all in one place.',
        thumbnail: 'https://cdn.worldvectorlogo.com/logos/figma-5.svg'
      };
    } else {
      // Default response
      const urlObj = new URL(url);
      return {
        title: `${urlObj.hostname.replace('www.', '')} - Website`,
        description: `Content from ${urlObj.hostname}`,
        thumbnail: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`
      };
    }
  };

  useEffect(() => {
    if (editBookmark) {
      setUrl(editBookmark.url);
      setTitle(editBookmark.title);
      setDescription(editBookmark.description || '');
      setNotes(editBookmark.notes || '');
      setFolderId(editBookmark.folderId);
      setThumbnail(editBookmark.thumbnail || '');
      setMetaFetched(true);
    } else {
      // Reset form for new bookmark
      setUrl('');
      setTitle('');
      setDescription('');
      setNotes('');
      setFolderId(initialFolderId);
      setThumbnail('');
      setMetaFetched(false);
    }
  }, [editBookmark, initialFolderId, open]);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setMetaFetched(false);
  };

  const handleFetchMetadata = async () => {
    if (!url) return;

    try {
      new URL(url); // Validate URL
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const metadata = await fetchMetadata(url);
      setTitle(metadata.title);
      setDescription(metadata.description);
      setThumbnail(metadata.thumbnail || '');
      setMetaFetched(true);
      
      toast({
        title: "Metadata fetched",
        description: "Bookmark details have been automatically filled"
      });
    } catch (error) {
      toast({
        title: "Failed to fetch metadata",
        description: "Please fill in the details manually",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!url || !title) {
      toast({
        title: "Missing information",
        description: "URL and title are required",
        variant: "destructive"
      });
      return;
    }

    onSave({
      url,
      title,
      description: description || undefined,
      notes: notes || undefined,
      folderId,
      thumbnail: thumbnail || undefined,
      lastVisited: editBookmark?.lastVisited
    });

    onOpenChange(false);
  };

  const getFolderPath = (folder: FolderType): string => {
    if (!folder.parentId || folder.parentId === 'root') {
      return folder.name;
    }
    const parent = folders.find(f => f.id === folder.parentId);
    return parent ? `${getFolderPath(parent)} / ${folder.name}` : folder.name;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com"
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleFetchMetadata}
                disabled={!url || isLoading}
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Fetch'
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bookmark title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the bookmark"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Personal Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your personal notes about this bookmark"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {getFolderPath(folder)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {thumbnail && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-3 bg-muted/50">
                <div className="flex gap-3">
                  <img
                    src={thumbnail}
                    alt="Thumbnail"
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {url}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {editBookmark ? 'Update' : 'Save'} Bookmark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}