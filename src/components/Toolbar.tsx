import React from 'react';
import { Search, ArrowUpDown, LayoutList, LayoutGrid, X } from 'lucide-react';
import { SORT_OPTIONS } from '../lib/driveApi';
import { ViewMode } from '../types';

interface ToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSort: string;
  onSortChange: (sortId: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFiles: number;
  isLoading: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchTerm,
  onSearchChange,
  selectedSort,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFiles,
  isLoading,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="search-files-input"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search owned files by name..."
          className="w-full pl-9.5 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sort & View Controls */}
      <div className="flex items-center gap-2 sm:gap-3 justify-between md:justify-end">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <label htmlFor="sort-select" className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Sort:
          </label>
          <select
            id="sort-select"
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            id="view-list-btn"
            type="button"
            onClick={() => onViewModeChange('list')}
            title="List view"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            id="view-grid-btn"
            type="button"
            onClick={() => onViewModeChange('grid')}
            title="Grid view"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* File Count Badge */}
        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl">
          {isLoading ? (
            <span className="text-slate-400">Loading...</span>
          ) : (
            <span>
              <strong className="text-slate-900 dark:text-slate-200 font-semibold">{totalFiles}</strong> {totalFiles === 1 ? 'file' : 'files'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
