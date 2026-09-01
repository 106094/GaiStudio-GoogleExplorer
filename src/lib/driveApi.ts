import { DriveFile, FileTypeOption, SortOption } from '../types';

export const COMMON_MIME_TYPES: FileTypeOption[] = [
  {
    id: 'all',
    label: 'All Types',
    mimeType: null,
    iconName: 'Files',
    color: 'text-zinc-700 dark:text-zinc-300',
    bgLight: 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
    description: 'All files owned by you',
  },
  {
    id: 'document',
    label: 'Google Docs',
    mimeType: 'application/vnd.google-apps.document',
    iconName: 'FileText',
    color: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    description: 'application/vnd.google-apps.document',
  },
  {
    id: 'spreadsheet',
    label: 'Google Sheets',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    iconName: 'Table',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    description: 'application/vnd.google-apps.spreadsheet',
  },
  {
    id: 'presentation',
    label: 'Google Slides',
    mimeType: 'application/vnd.google-apps.presentation',
    iconName: 'Presentation',
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    description: 'application/vnd.google-apps.presentation',
  },
  {
    id: 'pdf',
    label: 'PDF Documents',
    mimeType: 'application/pdf',
    iconName: 'FileCode',
    color: 'text-rose-600 dark:text-rose-400',
    bgLight: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    description: 'application/pdf',
  },
  {
    id: 'form',
    label: 'Google Forms',
    mimeType: 'application/vnd.google-apps.form',
    iconName: 'ClipboardList',
    color: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    description: 'application/vnd.google-apps.form',
  },
  {
    id: 'folder',
    label: 'Folders',
    mimeType: 'application/vnd.google-apps.folder',
    iconName: 'Folder',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    description: 'application/vnd.google-apps.folder',
  },
  {
    id: 'image',
    label: 'Images',
    mimeType: 'image/',
    iconName: 'Image',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    description: 'JPEG, PNG, GIF, SVG, etc.',
  },
];

export const SORT_OPTIONS: SortOption[] = [
  {
    id: 'modified-desc',
    label: 'Last Modified (Newest first)',
    field: 'modifiedTime',
    order: 'desc',
    apiOrderBy: 'modifiedTime desc',
  },
  {
    id: 'modified-asc',
    label: 'Last Modified (Oldest first)',
    field: 'modifiedTime',
    order: 'asc',
    apiOrderBy: 'modifiedTime asc',
  },
  {
    id: 'name-asc',
    label: 'Name (A to Z)',
    field: 'name',
    order: 'asc',
    apiOrderBy: 'name asc',
  },
  {
    id: 'name-desc',
    label: 'Name (Z to A)',
    field: 'name',
    order: 'desc',
    apiOrderBy: 'name desc',
  },
  {
    id: 'created-desc',
    label: 'Created Date (Newest first)',
    field: 'createdTime',
    order: 'desc',
    apiOrderBy: 'createdTime desc',
  },
  {
    id: 'size-desc',
    label: 'File Size (Largest first)',
    field: 'quotaBytesUsed',
    order: 'desc',
    apiOrderBy: 'quotaBytesUsed desc',
  },
];

export interface FetchFilesParams {
  accessToken: string;
  mimeTypeFilter?: string | null;
  customMimeType?: string;
  searchTerm?: string;
  orderBy?: string;
  pageToken?: string | null;
  pageSize?: number;
}

export interface FetchFilesResponse {
  files: DriveFile[];
  nextPageToken?: string | null;
}

export async function fetchUserDriveFiles({
  accessToken,
  mimeTypeFilter,
  customMimeType,
  searchTerm,
  orderBy = 'modifiedTime desc',
  pageToken,
  pageSize = 50,
}: FetchFilesParams): Promise<FetchFilesResponse> {
  const queryParts: string[] = ["'me' in owners", 'trashed = false'];

  const effectiveMimeType = customMimeType?.trim() || mimeTypeFilter;

  if (effectiveMimeType) {
    if (effectiveMimeType === 'image/') {
      queryParts.push("mimeType contains 'image/'");
    } else {
      // Escape single quotes if any
      const sanitized = effectiveMimeType.replace(/'/g, "\\'");
      queryParts.push(`mimeType = '${sanitized}'`);
    }
  }

  if (searchTerm && searchTerm.trim().length > 0) {
    const sanitizedSearch = searchTerm.trim().replace(/'/g, "\\'");
    queryParts.push(`name contains '${sanitizedSearch}'`);
  }

  const query = queryParts.join(' and ');

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', query);
  url.searchParams.set('orderBy', orderBy);
  url.searchParams.set(
    'fields',
    'nextPageToken, files(id, name, mimeType, modifiedTime, createdTime, size, webViewLink, webContentLink, iconLink, thumbnailLink, shared, starred, owners(displayName, emailAddress, photoLink, me), description)'
  );
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set('supportsAllDrives', 'true');
  url.searchParams.set('includeItemsFromAllDrives', 'true');

  if (pageToken) {
    url.searchParams.set('pageToken', pageToken);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage =
      errorData?.error?.message || `Google Drive API error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken || null,
  };
}

export interface DeleteFileParams {
  accessToken: string;
  fileId: string;
  permanent?: boolean;
}

/**
 * Deletes a single Google Drive file (moves to trash or permanent deletion).
 */
export async function deleteDriveFile({
  accessToken,
  fileId,
  permanent = false,
}: DeleteFileParams): Promise<void> {
  if (permanent) {
    const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
    url.searchParams.set('supportsAllDrives', 'true');

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.error?.message || `Failed to delete file (${response.status} ${response.statusText})`;
      throw new Error(errorMessage);
    }
  } else {
    // Move to Trash (trashed = true)
    const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
    url.searchParams.set('supportsAllDrives', 'true');

    const response = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trashed: true }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.error?.message || `Failed to move file to trash (${response.status} ${response.statusText})`;
      throw new Error(errorMessage);
    }
  }
}

export interface BatchDeleteProgress {
  completed: number;
  total: number;
  currentFileId: string;
}

export interface BatchDeleteResult {
  successfulIds: string[];
  failed: { fileId: string; error: string }[];
}

/**
 * Deletes multiple Google Drive files sequentially with progress reporting.
 */
export async function deleteMultipleDriveFiles({
  accessToken,
  fileIds,
  permanent = false,
  onProgress,
}: {
  accessToken: string;
  fileIds: string[];
  permanent?: boolean;
  onProgress?: (progress: BatchDeleteProgress) => void;
}): Promise<BatchDeleteResult> {
  const successfulIds: string[] = [];
  const failed: { fileId: string; error: string }[] = [];

  for (let i = 0; i < fileIds.length; i++) {
    const fileId = fileIds[i];
    if (onProgress) {
      onProgress({
        completed: i,
        total: fileIds.length,
        currentFileId: fileId,
      });
    }

    try {
      await deleteDriveFile({ accessToken, fileId, permanent });
      successfulIds.push(fileId);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete file';
      failed.push({ fileId, error: errorMsg });
    }
  }

  if (onProgress) {
    onProgress({
      completed: fileIds.length,
      total: fileIds.length,
      currentFileId: '',
    });
  }

  return { successfulIds, failed };
}

export function formatBytes(bytesStr?: string | number): string {
  if (!bytesStr) return '—';
  const bytes = typeof bytesStr === 'string' ? parseInt(bytesStr, 10) : bytesStr;
  if (isNaN(bytes) || bytes === 0) return '—';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${val} ${sizes[i]}`;
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return 'Unknown';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'Unknown';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) {
      const mins = Math.floor(diffSeconds / 60);
      return `${mins}m ago`;
    }
    if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours}h ago`;
    }
    if (diffSeconds < 604800) {
      const days = Math.floor(diffSeconds / 86400);
      return `${days}d ago`;
    }
    return formatDateTime(isoString);
  } catch {
    return isoString;
  }
}

export function getMimeTypeDetails(mimeType: string): {
  category: string;
  name: string;
  badgeBg: string;
  badgeText: string;
  iconType: 'doc' | 'sheet' | 'slide' | 'pdf' | 'folder' | 'form' | 'image' | 'archive' | 'file';
} {
  switch (mimeType) {
    case 'application/vnd.google-apps.document':
      return {
        category: 'Document',
        name: 'Google Doc',
        badgeBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        badgeText: 'Google Doc',
        iconType: 'doc',
      };
    case 'application/vnd.google-apps.spreadsheet':
      return {
        category: 'Spreadsheet',
        name: 'Google Sheet',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        badgeText: 'Google Sheet',
        iconType: 'sheet',
      };
    case 'application/vnd.google-apps.presentation':
      return {
        category: 'Presentation',
        name: 'Google Slide',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        badgeText: 'Google Slide',
        iconType: 'slide',
      };
    case 'application/pdf':
      return {
        category: 'PDF Document',
        name: 'PDF',
        badgeBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        badgeText: 'PDF',
        iconType: 'pdf',
      };
    case 'application/vnd.google-apps.form':
      return {
        category: 'Form',
        name: 'Google Form',
        badgeBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        badgeText: 'Google Form',
        iconType: 'form',
      };
    case 'application/vnd.google-apps.folder':
      return {
        category: 'Folder',
        name: 'Folder',
        badgeBg: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        badgeText: 'Folder',
        iconType: 'folder',
      };
    default:
      if (mimeType.startsWith('image/')) {
        const ext = mimeType.replace('image/', '').toUpperCase();
        return {
          category: 'Image',
          name: `${ext} Image`,
          badgeBg: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
          badgeText: ext || 'Image',
          iconType: 'image',
        };
      }
      if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('compressed')) {
        return {
          category: 'Archive',
          name: 'Archive',
          badgeBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
          badgeText: 'Archive',
          iconType: 'archive',
        };
      }
      return {
        category: 'File',
        name: mimeType.split('/').pop() || 'File',
        badgeBg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
        badgeText: mimeType.length > 20 ? mimeType.substring(0, 18) + '…' : mimeType,
        iconType: 'file',
      };
  }
}
