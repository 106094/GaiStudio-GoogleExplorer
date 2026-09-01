import React, { useState } from 'react';
import { COMMON_MIME_TYPES } from '../lib/driveApi';
import { FileTypeOption } from '../types';
import {
  FileText,
  Table,
  Presentation,
  FileCode,
  Folder,
  ClipboardList,
  Image,
  Files,
  SlidersHorizontal,
  X,
  Search,
} from 'lucide-react';

interface MimeTypeFilterProps {
  selectedMimeType: string | null;
  customMimeType: string;
  onSelectMimeType: (mimeType: string | null) => void;
  onCustomMimeTypeChange: (customType: string) => void;
  typeCounts?: Record<string, number>;
}

export const MimeTypeFilter: React.FC<MimeTypeFilterProps> = ({
  selectedMimeType,
  customMimeType,
  onSelectMimeType,
  onCustomMimeTypeChange,
  typeCounts = {},
}) => {
  const [showCustomInput, setShowCustomInput] = useState(!!customMimeType);
  const [customInputVal, setCustomInputVal] = useState(customMimeType);

  const getIcon = (iconName: string, active: boolean) => {
    const cls = `w-4 h-4 shrink-0`;
    switch (iconName) {
      case 'FileText':
        return <FileText className={cls} />;
      case 'Table':
        return <Table className={cls} />;
      case 'Presentation':
        return <Presentation className={cls} />;
      case 'FileCode':
        return <FileCode className={cls} />;
      case 'ClipboardList':
        return <ClipboardList className={cls} />;
      case 'Folder':
        return <Folder className={cls} />;
      case 'Image':
        return <Image className={cls} />;
      default:
        return <Files className={cls} />;
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputVal.trim()) {
      onCustomMimeTypeChange(customInputVal.trim());
      onSelectMimeType(null);
    }
  };

  const clearCustom = () => {
    setCustomInputVal('');
    onCustomMimeTypeChange('');
    setShowCustomInput(false);
  };

  const isCustomActive = !!customMimeType.trim();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Filter by MIME Type
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select specific Google Drive application types or enter a custom MIME
            </p>
          </div>
        </div>

        {/* Custom MIME Input Toggle */}
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold self-start sm:self-auto cursor-pointer transition-colors"
        >
          {showCustomInput ? 'Hide custom input' : '+ Custom MIME type'}
        </button>
      </div>

      {/* Preset MIME Type Buttons */}
      <div className="flex flex-wrap gap-2">
        {COMMON_MIME_TYPES.map((option: FileTypeOption) => {
          const isSelected =
            !isCustomActive &&
            (option.mimeType === selectedMimeType ||
              (option.mimeType === null && selectedMimeType === null));
          const count = option.mimeType ? typeCounts[option.mimeType] : undefined;

          return (
            <button
              key={option.id}
              id={`filter-mime-${option.id}`}
              type="button"
              onClick={() => {
                if (isCustomActive) {
                  clearCustom();
                }
                onSelectMimeType(option.mimeType);
              }}
              title={option.description}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-950 dark:border-slate-100 shadow-xs'
                  : 'bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className={isSelected ? 'text-white dark:text-slate-950' : option.color}>
                {getIcon(option.iconName, isSelected)}
              </span>
              <span>{option.label}</span>
              {typeof count === 'number' && (
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? 'bg-slate-750 dark:bg-slate-300 text-slate-100 dark:text-slate-900'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom MIME Input Section */}
      {showCustomInput && (
        <form
          onSubmit={handleCustomSubmit}
          className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="custom-mime-input"
              type="text"
              value={customInputVal}
              onChange={(e) => setCustomInputVal(e.target.value)}
              placeholder="e.g. text/plain, video/mp4, application/zip"
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            {customInputVal && (
              <button
                type="button"
                onClick={() => setCustomInputVal('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            id="apply-custom-mime-btn"
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            Apply Filter
          </button>
          {isCustomActive && (
            <button
              type="button"
              onClick={clearCustom}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Reset
            </button>
          )}
        </form>
      )}

      {/* Active Filter Helper Bar */}
      {(selectedMimeType || isCustomActive) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <span className="font-medium text-slate-700 dark:text-slate-300">Active MIME query:</span>
            <code className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-2 py-0.5 rounded-md text-[11px] text-blue-700 dark:text-blue-300 font-mono truncate">
              {isCustomActive ? customMimeType : selectedMimeType}
            </code>
          </div>
          <button
            type="button"
            onClick={() => {
              clearCustom();
              onSelectMimeType(null);
            }}
            className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 font-medium ml-2 shrink-0 cursor-pointer"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
};
