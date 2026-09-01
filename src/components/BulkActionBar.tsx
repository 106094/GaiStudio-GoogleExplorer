import React from 'react';
import { Trash2, CheckSquare, Square, X, AlertCircle } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  isAllSelected: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  isAllSelected,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="bg-slate-900/95 dark:bg-slate-850/95 text-white backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl px-4 py-3 sm:px-5 sm:py-3.5 flex flex-wrap items-center gap-3 sm:gap-5 pointer-events-auto max-w-xl w-full justify-between animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Counter */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600/80 border border-blue-400/40 flex items-center justify-center text-xs font-bold text-white shadow-xs">
            {selectedCount}
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">
              {selectedCount} {selectedCount === 1 ? 'file' : 'files'} selected
            </p>
            <p className="text-[10px] text-slate-300">
              {isAllSelected ? 'All files in current view selected' : `of ${totalCount} files available`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-600/70 text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {isAllSelected ? (
              <>
                <Square className="w-3.5 h-3.5 text-slate-400" />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Select All ({totalCount})</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="bulk-delete-btn"
            onClick={onDeleteSelected}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete ({selectedCount})</span>
          </button>

          <button
            type="button"
            onClick={onDeselectAll}
            title="Clear selection"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
