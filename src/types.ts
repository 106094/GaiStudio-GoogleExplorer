export interface DriveOwner {
  displayName?: string;
  emailAddress?: string;
  photoLink?: string;
  me?: boolean;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  createdTime?: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  shared?: boolean;
  starred?: boolean;
  owners?: DriveOwner[];
  description?: string;
}

export interface FileTypeOption {
  id: string;
  label: string;
  mimeType: string | null;
  iconName: string;
  color: string;
  bgLight: string;
  description: string;
}

export type SortField = 'modifiedTime' | 'name' | 'createdTime' | 'quotaBytesUsed';
export type SortOrder = 'desc' | 'asc';

export interface SortOption {
  id: string;
  label: string;
  field: SortField;
  order: SortOrder;
  apiOrderBy: string;
}

export type ViewMode = 'list' | 'grid';
