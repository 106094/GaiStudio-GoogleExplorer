import React from 'react';
import { DriveFile } from '../types';
import { FileIcon } from './FileIcon';
import { formatBytes, formatDateTime, formatRelativeTime, getMimeTypeDetails } from '../lib/driveApi';
import { ExternalLink, Info, Star, User, Trash2 } from 'lucide-react';

interface FileListProps {
  files: DriveFile[];
  selectedFileIds: Set<string>;
  onToggleSelect: (fileId: string) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  onSelectFile: (file: DriveFile) => void;
  onDeleteFile: (file: DriveFile) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedFileIds,
  onToggleSelect,
  onSelectAll,
  isAllSelected,
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

  const isSomeSelected = selectedFileIds.size > 0 && !isAllSelected;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {/* Checkbox column */}
              <th className="py-3.5 pl-4 pr-2 w-10">
                <div className="flex items-center">
                  <input
                    id="select-all-checkbox"
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={onSelectAll}
                    title={isAllSelected ? 'Deselect all files' : 'Select all files'}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800 cursor-pointer"
                  />
                </div>
              </th>
              <th className="py-3.5 px-3 font-bold">Name & Type</th>
              <th className="py-3.5 px-4 font-bold">MIME Type</th>
              <th className="py-3.5 px-4 font-bold">Last Write Time</th>
              <th className="py-3.5 px-4 font-bold">Size</th>
              <th className="py-3.5 px-4 font-bold">Owner</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80 text-xs">
            {files.map((file) => {
              const mimeMeta = getMimeTypeDetails(file.mimeType);
              const owner = file.owners?.[0];
              const isSelected = selectedFileIds.has(file.id);

              return (
                <tr
                  key={file.id}
                  id={`file-row-${file.id}`}
                  className={`transition-colors group cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                      : 'hover:bg-slate-50/90 dark:hover:bg-slate-800/50'
                  }`}
                  onClick={() => onSelectFile(file)}
                >
                  {/* Selection Checkbox */}
                  <td className="py-3.5 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center">
                      <input
                        id={`select-file-${file.id}`}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(file.id)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800 cursor-pointer"
                      />
                    </div>
                  </td>

                  {/* File Name & Icon */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3 min-w-[220px] max-w-sm sm:max-w-md">
                      <div className="shrink-0 p-2 bg-slate-100/90 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        <FileIcon mimeType={file.mimeType} className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                          {file.starred && (
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          Created {formatDateTime(file.createdTime)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* MIME Type Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${mimeMeta.badgeBg}`}
                      title={file.mimeType}
                    >
                      {mimeMeta.badgeText}
                    </span>
                  </td>

                  {/* Last Write Time (Modified) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatRelativeTime(file.modifiedTime)}
                      </span>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {formatDateTime(file.modifiedTime)}
                      </p>
                    </div>
                  </td>

                  {/* File Size */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {formatBytes(file.size)}
                  </td>

                  {/* Owner */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      {owner?.photoLink ? (
                        <img
                          src={owner.photoLink}
                          alt={owner.displayName || 'Owner'}
                          className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className="truncate max-w-[120px] font-medium" title={owner?.emailAddress || owner?.displayName}>
                        {owner?.displayName || 'Me'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectFile(file)}
                        title="View details"
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open file in Google Drive"
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeleteFile(file)}
                        title="Delete file"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
