import React from 'react';
import { DriveFile } from '../types';
import { FileIcon } from './FileIcon';
import { formatBytes, formatDateTime, formatRelativeTime, getMimeTypeDetails } from '../lib/driveApi';
import { ExternalLink, Info, Star, Trash2 } from 'lucide-react';

interface FileGridProps {
  files: DriveFile[];
  selectedFileIds: Set<string>;
  onToggleSelect: (fileId: string) => void;
  onSelectFile: (file: DriveFile) => void;
  onDeleteFile: (file: DriveFile) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  selectedFileIds,
  onToggleSelect,
  onSelectFile,
  onDeleteFile,
}) => {
  if (files.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center shadow-xs">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No files found</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No files owned by your account matched the selected MIME type filter or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => {
        const mimeMeta = getMimeTypeDetails(file.mimeType);
        const isSelected = selectedFileIds.has(file.id);

        return (
          <div
            key={file.id}
            id={`file-card-${file.id}`}
            onClick={() => onSelectFile(file)}
            className={`group rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer relative border ${
              isSelected
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
            }`}
          >
            {/* Header / Checkbox / Icon / Actions */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  {/* Selection Checkbox */}
                  <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                    <input
                      id={`grid-select-file-${file.id}`}
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(file.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800 cursor-pointer"
                    />
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/60 shrink-0">
                    <FileIcon mimeType={file.mimeType} className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                  {file.starred && (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectFile(file)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Inspect file"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                      title="Open in Google Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteFile(file)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Badge */}
              <h3
                className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 leading-snug"
                title={file.name}
              >
                {file.name}
              </h3>

              <div className="mb-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${mimeMeta.badgeBg}`}
                >
                  {mimeMeta.badgeText}
                </span>
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <div>
                <span className="text-[10px] block text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                  Last write time
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300" title={formatDateTime(file.modifiedTime)}>
                  {formatRelativeTime(file.modifiedTime)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] block text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                  Size
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatBytes(file.size)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
