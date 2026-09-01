import React from 'react';
import { HardDrive, CheckCircle2, ShieldCheck, ArrowUpDown, Filter, Lock } from 'lucide-react';

interface AuthScreenProps {
  onSignIn: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn, isLoading, error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 dark:from-blue-600 dark:to-indigo-500 border border-blue-200/80 dark:border-blue-800 flex items-center justify-center mb-4 shadow-md shadow-blue-500/20 text-white">
            <HardDrive className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Google Drive File Explorer
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            View, sort by last modified time, and filter your Google Drive files by MIME type.
          </p>
        </div>

        {/* Features Checklist */}
        <div className="bg-slate-50 dark:bg-slate-800/90 rounded-2xl p-5 mb-6 border border-slate-200 dark:border-slate-700 space-y-3.5 shadow-xs">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <span className="text-sm text-slate-800 dark:text-slate-200">
              <strong className="font-semibold text-slate-900 dark:text-white">Owned by me:</strong> Lists only files owned directly by your account.
            </span>
          </div>
          <div className="flex items-start gap-3">
            <ArrowUpDown className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <span className="text-sm text-slate-800 dark:text-slate-200">
              <strong className="font-semibold text-slate-900 dark:text-white">Sorted by write time:</strong> Real-time ordering by last modified timestamp.
            </span>
          </div>
          <div className="flex items-start gap-3">
            <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
            <span className="text-sm text-slate-800 dark:text-slate-200">
              <strong className="font-semibold text-slate-900 dark:text-white">MIME Type Filtering:</strong> Filter by Docs, Sheets, Slides, PDFs, or custom types.
            </span>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <span className="text-sm text-slate-800 dark:text-slate-200">
              <strong className="font-semibold text-slate-900 dark:text-white">Multi-Select & Delete:</strong> Select and safely trash or permanently erase unwanted files.
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
            {error}
          </div>
        )}

        {/* Official Google Sign-In Button */}
        <div className="flex flex-col items-center">
          <button
            id="google-sign-in-btn"
            type="button"
            onClick={onSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-semibold text-sm rounded-xl border border-slate-300/90 dark:border-slate-700 shadow-xs hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in to Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-500 text-center">
          <Lock className="w-3 h-3" />
          <span>Requires Drive read-only permission with your consent</span>
        </div>
      </div>
    </div>
  );
};
