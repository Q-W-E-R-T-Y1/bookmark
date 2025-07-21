import { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import { Folder as FolderType } from '@/types/bookmark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface FolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (folder: Omit<FolderType, 'id' | 'createdAt'>) => void;
  folders: FolderType[];
  parentFolderId?: string;
  editFolder?: FolderType;
}

const FOLDER_COLORS = [
  { name: 'Blue', value: 'blue' },
  { name: 'Green', value: 'green' },
  { name: 'Purple', value: 'purple' },
  { name: 'Pink', value: 'pink' },
  { name: 'Orange', value: 'orange' },
  { name: 'Red', value: 'red' },
  { name: 'Gray', value: 'gray' },
];

export function FolderDialog({
  open,
  onOpenChange,
  onSave,
  folders,
  parentFolderId = 'root',
  editFolder
}: FolderDialogProps) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState(parentFolderId);
  const [color, setColor] = useState('blue');

  useEffect(() => {
    if (editFolder) {
      setName(editFolder.name);
      setParentId(editFolder.parentId || 'root');
      setColor(editFolder.color || 'blue');
    } else {
      setName('');
      setParentId(parentFolderId);
      setColor('blue');
    }
  }, [editFolder, parentFolderId, open]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      parentId: parentId === 'root' ? undefined : parentId,
      color
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

  // Filter out the folder being edited and its children to prevent circular references
  const availableParents = folders.filter(folder => {
    if (editFolder && folder.id === editFolder.id) return false;
    if (editFolder && folder.parentId === editFolder.id) return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {editFolder ? 'Edit Folder' : 'Create New Folder'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent-folder">Parent Folder</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">All Bookmarks</SelectItem>
                {availableParents.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {getFolderPath(folder)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {FOLDER_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`p-2 rounded-lg border-2 transition-colors text-sm
                    ${color === colorOption.value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 bg-${colorOption.value}-500`} />
                  {colorOption.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!name.trim()}>
            {editFolder ? 'Update' : 'Create'} Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}