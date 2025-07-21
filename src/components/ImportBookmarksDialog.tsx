import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Bookmark, Folder } from '@/types/bookmark';

interface ImportBookmarksDialogProps {
  onImport: (bookmarks: Bookmark[], folders: Folder[]) => void;
}

export function ImportBookmarksDialog({ onImport }: ImportBookmarksDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const parseFirefoxBookmarks = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const bookmarks: Bookmark[] = [];
    const folders: Folder[] = [];
    const folderMap = new Map<string, string>(); // title -> id

    // Add root folder if it doesn't exist
    if (!folderMap.has('Bookmarks')) {
      const rootId = 'imported-root';
      folders.push({
        id: rootId,
        name: 'Imported Bookmarks',
        createdAt: new Date(),
      });
      folderMap.set('Bookmarks', rootId);
    }

    const processNode = (node: Element, parentFolderId: string = 'imported-root') => {
      // Process folders (DT elements with H3 children)
      const folderHeaders = node.querySelectorAll('dt > h3');
      folderHeaders.forEach((header) => {
        const folderName = header.textContent?.trim() || 'Untitled Folder';
        const folderId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        folders.push({
          id: folderId,
          name: folderName,
          parentId: parentFolderId,
          createdAt: new Date(),
        });
        folderMap.set(folderName, folderId);

        // Process nested items in this folder
        const dtElement = header.parentElement;
        if (dtElement?.nextElementSibling?.tagName === 'DD') {
          const ddElement = dtElement.nextElementSibling;
          processNode(ddElement, folderId);
        }
      });

      // Process bookmarks (A elements)
      const bookmarkLinks = node.querySelectorAll('dt > a[href]');
      bookmarkLinks.forEach((link) => {
        const url = link.getAttribute('href');
        const title = link.textContent?.trim();
        const addDate = link.getAttribute('add_date');
        
        if (url && title) {
          bookmarks.push({
            id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            url,
            folderId: parentFolderId,
            createdAt: addDate ? new Date(parseInt(addDate) * 1000) : new Date(),
          });
        }
      });
    };

    // Start processing from the document body
    if (doc.body) {
      processNode(doc.body);
    }

    return { bookmarks, folders };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.html')) {
      toast.error('Please select an HTML file exported from Firefox');
      return;
    }

    setIsImporting(true);

    try {
      const content = await file.text();
      const { bookmarks, folders } = parseFirefoxBookmarks(content);
      
      if (bookmarks.length === 0) {
        toast.error('No bookmarks found in the file');
        return;
      }

      onImport(bookmarks, folders);
      toast.success(`Imported ${bookmarks.length} bookmarks and ${folders.length} folders`);
      setIsOpen(false);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import bookmarks. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import from Firefox
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Firefox Bookmarks</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">How to export from Firefox:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open Firefox and press Ctrl+Shift+B</li>
                <li>Click "Import and Backup" → "Export Bookmarks to HTML"</li>
                <li>Save the file and select it below</li>
              </ol>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bookmark-file">Select Firefox bookmark file (HTML)</Label>
            <Input
              id="bookmark-file"
              type="file"
              accept=".html"
              onChange={handleFileUpload}
              disabled={isImporting}
            />
          </div>
          
          {isImporting && (
            <div className="text-center text-sm text-muted-foreground">
              Importing bookmarks...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}