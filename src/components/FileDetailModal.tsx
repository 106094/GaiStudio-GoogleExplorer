import React, { useState } from 'react';
import { DriveFile } from '../types';
import { FileIcon } from './FileIcon';
import { formatBytes, formatDateTime, getMimeTypeDetails } from '../lib/driveApi';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Clock,
  HardDrive,
  User,
  Star,
  FileText,
  Download,
  Trash2,
} from 'lucide-react';

interface FileDetailModalProps {
  file: DriveFile | null;
  onClose: () => void;
  onDeleteFile?: (file: DriveFile) => void;
}

export const FileDetailModal: React.FC<FileDetailModalProps> = ({ file, onClose, onDeleteFile }) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedMime, setCopiedMime] = useState(false);

  if (!file) return null;

  const mimeMeta = getMimeTypeDetails(file.mimeType);
  const owner = file.owners?.[0];

  const handleCopy = (text: string, type: 'id' | 'mime') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedMime(true);
      setTimeout(() => setCopiedMime(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
              <FileIcon mimeType={file.mimeType} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${mimeMeta.badgeBg}`}>
                  {mimeMeta.badgeText}
                </span>
                {file.starred && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400" /> Starred
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 break-words leading-snug">
                {file.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Details */}
        <div className="py-4 space-y-3.5 text-xs">
          {/* Exact MIME Type */}
          <div className="bg-slate-50/90 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Full MIME Type</span>
              <button
                type="button"
                onClick={() => handleCopy(file.mimeType, 'mime')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {copiedMime ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy MIME</span>
                  </>
                )}
              </button>
            </div>
            <code className="font-mono text-slate-900 dark:text-slate-100 text-xs break-all">
              {file.mimeType}
            </code>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50/90 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Last Write Time</span>
              </div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {formatDateTime(file.modifiedTime)}
              </p>
            </div>

            <div className="p-3 bg-slate-50/90 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Created Date</span>
              </div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {formatDateTime(file.createdTime)}
              </p>
            </div>
          </div>

          {/* Size & Owner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50/90 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                <span>File Size</span>
              </div>
              <p className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                {formatBytes(file.size)}
              </p>
            </div>

            <div className="p-3 bg-slate-50/90 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>File Owner</span>
              </div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {owner?.displayName || owner?.emailAddress || 'Me (You)'}
              </p>
              {owner?.emailAddress && (
                <p className="text-[11px] text-slate-500 truncate">{owner.emailAddress}</p>
              )}
            </div>
          </div>

          {/* File ID */}
          <div className="p-3 bg-slate-50/90 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Google Drive File ID</span>
              <button
                type="button"
                onClick={() => handleCopy(file.id, 'id')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
            <code className="font-mono text-slate-900 dark:text-slate-100 text-[11px] break-all select-all">
              {file.id}
            </code>
          </div>

          {/* Description if any */}
          {file.description && (
            <div className="p-3 bg-slate-50/90 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Description</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{file.description}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div>
            {onDeleteFile && (
              <button
                type="button"
                onClick={() => {
                  onDeleteFile(file);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-800/80 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete File</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {file.webContentLink && (
              <a
                href={file.webContentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            )}

            {file.webViewLink ? (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Open in Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
