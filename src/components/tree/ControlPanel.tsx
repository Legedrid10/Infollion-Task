import { memo } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ControlPanelProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onReset: () => void;
  nodeCount: number;
  visibleCount: number;
}

const ControlPanel = memo(({
  onZoomIn,
  onZoomOut,
  onFitView,
  onReset,
  nodeCount,
  visibleCount,
}: ControlPanelProps) => {
  return (
    <div className="glass-card p-3 flex flex-col gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="w-9 h-9 p-0"
        onClick={onZoomIn}
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-9 h-9 p-0"
        onClick={onZoomOut}
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-9 h-9 p-0"
        onClick={onFitView}
        title="Fit View"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
      <div className="w-full h-px bg-border my-1" />
      <Button
        variant="ghost"
        size="sm"
        className="w-9 h-9 p-0"
        onClick={onReset}
        title="Reset Tree"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
      
      <div className="text-center mt-2 pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground">Visible</div>
        <div className="text-sm font-semibold text-accent">
          {visibleCount}/{nodeCount}
        </div>
      </div>
    </div>
  );
});

ControlPanel.displayName = 'ControlPanel';

export default ControlPanel;
