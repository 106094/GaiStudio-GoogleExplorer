import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, CheckCircle2, AlertCircle, Loader2, ArchiveRestore } from 'lucide-react';
import { DriveFile } from '../types';
import { FileIcon } from './FileIcon';
import { formatBytes, formatRelativeTime, getMimeTypeDetails } from '../lib/driveApi';

interface DeleteConfirmModalProps {
  filesToDelete: DriveFile[];
  isDeleting: boolean;
  deleteProgress?: { completed: number; total: number; currentFileId: string } | null;
  onConfirm: (permanent: boolean) => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  filesToDelete,
  isDeleting,
  deleteProgress,
  onConfirm,
  onClose,
}) => {
  const [permanent, setPermanent] = useState<boolean>(false);
  const count = filesToDelete.length;

  if (count === 0) return null;

  const percentComplete =
    deleteProgress && deleteProgress.total > 0
      ? Math.round((deleteProgress.completed / deleteProgress.total) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs"
      onClick={!isDeleting ? onClose : undefined}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              permanent
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80'
            }`}
          >
            <Trash2 className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {count === 1
                ? permanent
                  ? 'Permanently Delete File?'
                  : 'Move File to Trash?'
                : permanent
                  ? `Permanently Delete ${count} Files?`
                  : `Move ${count} Files to Trash?`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {permanent
                ? 'This action cannot be undone. Selected files will be permanently erased from Google Drive.'
                : 'Files moved to Trash will remain recoverable in your Google Drive trash folder.'}
            </p>
          </div>

          {!isDeleting && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selected Files List Preview */}
        <div className="p-5 sm:p-6 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Selected for deletion ({count})
          </div>
          {filesToDelete.map((file) => {
            const mimeMeta = getMimeTypeDetails(file.mimeType);
            return (
              <div key={file.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0 p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/60">
                    <FileIcon mimeType={file.mimeType} className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {mimeMeta.name} • Modified {formatRelativeTime(file.modifiedTime)}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-slate-500 shrink-0">
                  {formatBytes(file.size)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Delete Mode Option (Trash vs Permanent) */}
        {!isDeleting && (
          <div className="px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-850/60 border-t border-b border-slate-200/70 dark:border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={permanent}
                onChange={(e) => setPermanent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Permanently delete immediately (skip Trash)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  If unchecked, items will be safely placed into your Google Drive Trash folder.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Active Progress Bar */}
        {isDeleting && (
          <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-850/60 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2 font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>
                  Deleting files ({deleteProgress?.completed || 0}/{deleteProgress?.total || count})...
                </span>
              </span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {percentComplete}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-200 ease-out"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-5 sm:p-6 flex items-center justify-end gap-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            id="confirm-delete-btn"
            onClick={() => onConfirm(permanent)}
            disabled={isDeleting}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 ${
              permanent
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500/30'
                : 'bg-amber-600 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500/30'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : permanent ? (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Move to Trash</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
