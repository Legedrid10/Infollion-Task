import { Search, X, TreeDeciduous } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  matchCount: number;
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
}

const SearchBar = ({
  value,
  onChange,
  matchCount,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
}: SearchBarProps) => {
  return (
    <div className="search-container flex items-center gap-3">
      <TreeDeciduous className="w-5 h-5 text-primary" />
      <h1 className="text-lg font-semibold text-foreground hidden sm:block">
        Tree Visualizer
      </h1>
      
      <div className="flex-1 max-w-md ml-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 pl-9 pr-24 rounded-md bg-secondary/50 border border-border focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-sm text-foreground placeholder:text-muted-foreground"
          />
          
          {value && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {matchCount > 0 ? (
                <>
                  <span className="text-xs text-muted-foreground font-mono">
                    {currentMatchIndex + 1}/{matchCount}
                  </span>
                  <button
                    type="button"
                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground"
                    onClick={onPrevMatch}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground"
                    onClick={onNextMatch}
                  >
                    ↓
                  </button>
                </>
              ) : (
                <span className="text-xs text-destructive font-mono">
                  No matches
                </span>
              )}
              <button
                type="button"
                className="h-6 w-6 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground"
                onClick={() => onChange('')}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
