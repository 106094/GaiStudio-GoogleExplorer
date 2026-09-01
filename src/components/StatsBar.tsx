import React from 'react';
import { DriveFile } from '../types';
import { FileText, Table, Presentation, FileCode, Clock, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '../lib/driveApi';

interface StatsBarProps {
  files: DriveFile[];
  onSelectFile: (file: DriveFile) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ files, onSelectFile }) => {
  if (files.length === 0) return null;

  const docsCount = files.filter((f) => f.mimeType === 'application/vnd.google-apps.document').length;
  const sheetsCount = files.filter((f) => f.mimeType === 'application/vnd.google-apps.spreadsheet').length;
  const slidesCount = files.filter((f) => f.mimeType === 'application/vnd.google-apps.presentation').length;
  const pdfsCount = files.filter((f) => f.mimeType === 'application/pdf').length;

  const latestFile = files[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* Latest Modified File Card */}
      <div className="lg:col-span-2 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Latest Modified File</span>
              <span>•</span>
              <span className="font-medium text-blue-600/90 dark:text-blue-300/90">{formatRelativeTime(latestFile?.modifiedTime)}</span>
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5" title={latestFile?.name}>
              {latestFile?.name || 'No files loaded'}
            </p>
          </div>
        </div>

        {latestFile && (
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => onSelectFile(latestFile)}
              className="px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer"
              title="Inspect details"
            >
              Details
            </button>
            {latestFile.webViewLink && (
              <a
                href={latestFile.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-blue-700 dark:text-blue-300 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                title="Open in Google Drive"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Docs stat */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">{docsCount}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Google Docs</p>
        </div>
      </div>

      {/* Sheets stat */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
          <Table className="w-4 h-4" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">{sheetsCount}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Google Sheets</p>
        </div>
      </div>

      {/* Slides & PDFs stat */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center shrink-0">
          <Presentation className="w-4 h-4" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
            {slidesCount} <span className="text-xs font-normal text-slate-400">/ {pdfsCount} PDF</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Slides / PDFs</p>
        </div>
      </div>
    </div>
  );
};
