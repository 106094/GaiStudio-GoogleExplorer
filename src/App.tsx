/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from './lib/auth';
import {
  fetchUserDriveFiles,
  deleteMultipleDriveFiles,
  deleteDriveFile,
  SORT_OPTIONS,
} from './lib/driveApi';
import { DriveFile, ViewMode } from './types';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { MimeTypeFilter } from './components/MimeTypeFilter';
import { Toolbar } from './components/Toolbar';
import { StatsBar } from './components/StatsBar';
import { FileList } from './components/FileList';
import { FileGrid } from './components/FileGrid';
import { FileDetailModal } from './components/FileDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { BulkActionBar } from './components/BulkActionBar';
import { AlertCircle, RefreshCw, ChevronDown, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive file state
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Multi-selection state
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [filesToDelete, setFilesToDelete] = useState<DriveFile[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteProgress, setDeleteProgress] = useState<{
    completed: number;
    total: number;
    currentFileId: string;
  } | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description?: string;
  } | null>(null);

  // Filter & Sort state
  const [selectedMimeType, setSelectedMimeType] = useState<string | null>(null);
  const [customMimeType, setCustomMimeType] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('modified-desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Selected file for detail modal
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);

  // Toast auto-dismiss timer
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Debounce search term to avoid spamming the API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initialize Auth listener on app mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setIsAuthLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch files from Google Drive
  const loadFiles = useCallback(
    async (isLoadMore = false) => {
      if (!token) return;

      const currentSortOption =
        SORT_OPTIONS.find((s) => s.id === selectedSort) || SORT_OPTIONS[0];

      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingFiles(true);
        setFileError(null);
      }

      try {
        const response = await fetchUserDriveFiles({
          accessToken: token,
          mimeTypeFilter: selectedMimeType,
          customMimeType: customMimeType,
          searchTerm: debouncedSearch,
          orderBy: currentSortOption.apiOrderBy,
          pageToken: isLoadMore ? nextPageToken : undefined,
          pageSize: 40,
        });

        if (isLoadMore) {
          setFiles((prev) => [...prev, ...response.files]);
        } else {
          setFiles(response.files);
        }
        setNextPageToken(response.nextPageToken || null);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while fetching Google Drive files.';
        console.error('Error fetching drive files:', err);
        setFileError(errorMsg);
      } finally {
        setIsLoadingFiles(false);
        setIsLoadingMore(false);
      }
    },
    [token, selectedMimeType, customMimeType, debouncedSearch, selectedSort, nextPageToken]
  );

  // Trigger load when filter, search, sort, or token changes
  useEffect(() => {
    if (token) {
      loadFiles(false);
    }
  }, [token, selectedMimeType, customMimeType, debouncedSearch, selectedSort]);

  // Handle Google Sign-in
  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err: unknown) {
      const errCode = (err as { code?: string })?.code || '';
      const errMessage = err instanceof Error ? err.message : String(err);
      
      let msg = 'Google sign-in failed. Please try again.';
      if (errCode === 'auth/unauthorized-domain' || errMessage.includes('unauthorized-domain')) {
        const currentDomain = window.location.hostname;
        msg = `Firebase Error (auth/unauthorized-domain): The current domain ("${currentDomain}") is not authorized in your Firebase project. To fix this, go to your Firebase Console > Authentication > Settings > Authorized domains, and click "Add domain" to add "${currentDomain}".`;
      } else if (errMessage) {
        msg = errMessage;
      }
      setAuthError(msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Sign-out
  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setFiles([]);
      setSelectedFileIds(new Set());
      setNextPageToken(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Multi-selection handlers
  const handleToggleSelect = (fileId: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allVisibleSelected =
      files.length > 0 && files.every((f) => selectedFileIds.has(f.id));

    if (allVisibleSelected) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(files.map((f) => f.id)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedFileIds(new Set());
  };

  // Single file delete prompt
  const handlePromptDeleteSingle = (file: DriveFile) => {
    setFilesToDelete([file]);
    setIsDeleteModalOpen(true);
  };

  // Batch delete prompt
  const handlePromptDeleteBatch = () => {
    const targetFiles = files.filter((f) => selectedFileIds.has(f.id));
    if (targetFiles.length === 0) return;
    setFilesToDelete(targetFiles);
    setIsDeleteModalOpen(true);
  };

  // Execute deletion (single or batch)
  const handleConfirmDelete = async (permanent: boolean) => {
    if (!token || filesToDelete.length === 0) return;

    setIsDeleting(true);
    const fileIds = filesToDelete.map((f) => f.id);
    const targetCount = fileIds.length;

    try {
      if (targetCount === 1) {
        setDeleteProgress({ completed: 0, total: 1, currentFileId: fileIds[0] });
        await deleteDriveFile({ accessToken: token, fileId: fileIds[0], permanent });
        
        // Remove from local files list
        setFiles((prev) => prev.filter((f) => f.id !== fileIds[0]));
        setSelectedFileIds((prev) => {
          const next = new Set(prev);
          next.delete(fileIds[0]);
          return next;
        });

        if (selectedFile?.id === fileIds[0]) {
          setSelectedFile(null);
        }

        setToastMessage({
          type: 'success',
          title: permanent ? 'File permanently deleted' : 'File moved to Trash',
          description: `"${filesToDelete[0].name}" has been ${
            permanent ? 'permanently removed' : 'moved to Google Drive Trash'
          }.`,
        });
      } else {
        // Multi-file batch deletion
        setDeleteProgress({ completed: 0, total: targetCount, currentFileId: fileIds[0] });

        const result = await deleteMultipleDriveFiles({
          accessToken: token,
          fileIds,
          permanent,
          onProgress: (progress) => {
            setDeleteProgress(progress);
          },
        });

        // Update local files list to remove successful ones
        if (result.successfulIds.length > 0) {
          const successSet = new Set(result.successfulIds);
          setFiles((prev) => prev.filter((f) => !successSet.has(f.id)));
          setSelectedFileIds((prev) => {
            const next = new Set(prev);
            result.successfulIds.forEach((id) => next.delete(id));
            return next;
          });

          if (selectedFile && successSet.has(selectedFile.id)) {
            setSelectedFile(null);
          }
        }

        if (result.failed.length === 0) {
          setToastMessage({
            type: 'success',
            title: permanent ? 'Files permanently deleted' : 'Files moved to Trash',
            description: `Successfully ${
              permanent ? 'permanently removed' : 'moved to trash'
            } ${result.successfulIds.length} files.`,
          });
        } else {
          setToastMessage({
            type: 'error',
            title: `Deleted ${result.successfulIds.length} files, ${result.failed.length} failed`,
            description: result.failed[0]?.error || 'Some files could not be deleted.',
          });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      setToastMessage({
        type: 'error',
        title: 'Failed to delete file(s)',
        description: msg,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setFilesToDelete([]);
      setDeleteProgress(null);
    }
  };

  // Compute file count summary for badges
  const mimeTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    files.forEach((f) => {
      counts[f.mimeType] = (counts[f.mimeType] || 0) + 1;
    });
    return counts;
  }, [files]);

  const isAllSelected =
    files.length > 0 && files.every((f) => selectedFileIds.has(f.id));

  // If checking initial auth status
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated or access token is missing
  if (!user || !token) {
    return (
      <AuthScreen
        onSignIn={handleSignIn}
        isLoading={isSigningIn}
        error={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased pb-20">
      {/* Top Navigation Bar */}
      <Header
        user={user}
        onSignOut={handleSignOut}
        onRefresh={() => loadFiles(false)}
        isRefreshing={isLoadingFiles}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : toastMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                  : 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <p className="font-bold">{toastMessage.title}</p>
              {toastMessage.description && (
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">{toastMessage.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* MIME Type Filters */}
        <MimeTypeFilter
          selectedMimeType={selectedMimeType}
          customMimeType={customMimeType}
          onSelectMimeType={setSelectedMimeType}
          onCustomMimeTypeChange={setCustomMimeType}
          typeCounts={mimeTypeCounts}
        />

        {/* Toolbar with Search, Sort, View Toggle */}
        <Toolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFiles={files.length}
          isLoading={isLoadingFiles}
        />

        {/* Stats summary bar */}
        {!isLoadingFiles && files.length > 0 && (
          <StatsBar files={files} onSelectFile={setSelectedFile} />
        )}

        {/* Error Alert */}
        {fileError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-xl flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            <div className="flex-1 text-xs">
              <h4 className="font-semibold text-rose-800 dark:text-rose-200">
                Failed to load Google Drive files
              </h4>
              <p className="text-rose-700 dark:text-rose-300 mt-0.5">{fileError}</p>
              <button
                type="button"
                onClick={() => loadFiles(false)}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Query</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner for Initial Query */}
        {isLoadingFiles ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Querying Google Drive...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Fetching files owned by your account and ordering by last modified timestamp
            </p>
          </div>
        ) : (
          <>
            {/* View Render */}
            {viewMode === 'list' ? (
              <FileList
                files={files}
                selectedFileIds={selectedFileIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                isAllSelected={isAllSelected}
                onSelectFile={setSelectedFile}
                onDeleteFile={handlePromptDeleteSingle}
              />
            ) : (
              <FileGrid
                files={files}
                selectedFileIds={selectedFileIds}
                onToggleSelect={handleToggleSelect}
                onSelectFile={setSelectedFile}
                onDeleteFile={handlePromptDeleteSingle}
              />
            )}

            {/* Load More Button if pagination token exists */}
            {nextPageToken && (
              <div className="mt-6 text-center">
                <button
                  id="load-more-files-btn"
                  type="button"
                  onClick={() => loadFiles(true)}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading more files...</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                      <span>Load More Files</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Bulk Action Bar when files are selected */}
      <BulkActionBar
        selectedCount={selectedFileIds.size}
        totalCount={files.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onDeleteSelected={handlePromptDeleteBatch}
        isAllSelected={isAllSelected}
      />

      {/* Footer Info */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Google Drive API v3 • Query: <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">'me' in owners</code></span>
          </div>
          <span>Ordered by Last Modified Timestamp (Descending)</span>
        </div>
      </footer>

      {/* File Details Modal / Drawer */}
      <FileDetailModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onDeleteFile={handlePromptDeleteSingle}
      />

      {/* Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          filesToDelete={filesToDelete}
          isDeleting={isDeleting}
          deleteProgress={deleteProgress}
          onConfirm={handleConfirmDelete}
          onClose={() => {
            if (!isDeleting) {
              setIsDeleteModalOpen(false);
              setFilesToDelete([]);
            }
          }}
        />
      )}
    </div>
  );
}
