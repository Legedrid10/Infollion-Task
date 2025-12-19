import { memo, useCallback, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Trash2, Pencil } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TreeNodeData {
  label: string;
  hasChildren: boolean;
  childCount: number;
  isExpanded: boolean;
  depth: number;
  isHovered: boolean;
  isSelected: boolean;
  isSearchMatch: boolean;
}

interface TreeNodeProps {
  id: string;
  data: TreeNodeData;
}

const TreeNodeComponent = memo(({ id, data }: TreeNodeProps) => {
  const {
    label,
    hasChildren,
    childCount,
    isExpanded,
    depth,
    isHovered,
    isSelected,
    isSearchMatch,
  } = data;

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState(label);

  // Get custom event handler from window (set by parent)
  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent('tree-node-toggle', { detail: { nodeId: id } });
    window.dispatchEvent(event);
  }, [id]);

  const handleAddNode = useCallback(() => {
    const event = new CustomEvent('tree-node-add', { detail: { parentId: id } });
    window.dispatchEvent(event);
  }, [id]);

  const handleDeleteNode = useCallback(() => {
    const event = new CustomEvent('tree-node-delete', { detail: { nodeId: id } });
    window.dispatchEvent(event);
  }, [id]);

  const handleRenameSubmit = useCallback(() => {
    if (newName.trim()) {
      const event = new CustomEvent('tree-node-rename', { detail: { nodeId: id, newLabel: newName } });
      window.dispatchEvent(event);
      setIsRenameOpen(false);
    }
  }, [id, newName]);

  return (
    <>
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Node</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="col-span-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
              }}
            />
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleRenameSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              relative px-4 py-3 min-w-[140px] rounded-xl
              backdrop-blur-lg border transition-all duration-300
              ${isSelected
                ? 'border-primary shadow-glow-orange'
                : isHovered
                  ? 'border-accent shadow-glow-blue'
                  : 'border-node-border'
              }
              ${isSearchMatch ? 'animate-search-pulse border-primary' : ''}
            `}
            style={{
              background: 'hsl(222 47% 11% / 0.8)',
            }}
          >
            {/* Target handle at top */}
            <Handle
              type="target"
              position={Position.Top}
              className="!bg-accent !border-none !w-2 !h-2 opacity-0"
            />

            {/* Child count badge */}
            {hasChildren && childCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="child-badge"
              >
                {childCount}
              </motion.div>
            )}

            {/* Node content */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground font-mono">
                D{depth}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {label}
              </span>
            </div>

            {/* Orange toggle button */}
            {hasChildren && (
              <button
                onClick={handleToggle}
                className={`
                  toggle-handle
                  ${hasChildren && !isExpanded ? 'has-children' : ''}
                `}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-primary-foreground" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-primary-foreground" />
                )}
              </button>
            )}

            {/* Source handle at bottom */}
            <Handle
              type="source"
              position={Position.Bottom}
              className="!bg-primary !border-none !w-2 !h-2 opacity-0"
              style={{ bottom: hasChildren ? '-12px' : '-8px' }}
            />
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48 bg-card border-border">
          <ContextMenuItem onClick={handleAddNode} className="cursor-pointer gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Child Node</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => {
            setNewName(label);
            setIsRenameOpen(true);
          }} className="cursor-pointer gap-2">
            <Pencil className="w-4 h-4" />
            <span>Rename Node</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDeleteNode} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
            <Trash2 className="w-4 h-4" />
            <span>Delete Node</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
});

TreeNodeComponent.displayName = 'TreeNodeComponent';

export default TreeNodeComponent;
