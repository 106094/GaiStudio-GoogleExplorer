import React from 'react';
import {
  FileText,
  Table,
  Presentation,
  FileCode,
  Folder,
  ClipboardList,
  Image,
  Archive,
  File,
} from 'lucide-react';
import { getMimeTypeDetails } from '../lib/driveApi';

interface FileIconProps {
  mimeType: string;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ mimeType, className = 'w-5 h-5' }) => {
  const details = getMimeTypeDetails(mimeType);

  switch (details.iconType) {
    case 'doc':
      return <FileText className={`${className} text-blue-600 dark:text-blue-400`} />;
    case 'sheet':
      return <Table className={`${className} text-emerald-600 dark:text-emerald-400`} />;
    case 'slide':
      return <Presentation className={`${className} text-amber-600 dark:text-amber-400`} />;
    case 'pdf':
      return <FileCode className={`${className} text-rose-600 dark:text-rose-400`} />;
    case 'form':
      return <ClipboardList className={`${className} text-purple-600 dark:text-purple-400`} />;
    case 'folder':
      return <Folder className={`${className} text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950/50`} />;
    case 'image':
      return <Image className={`${className} text-cyan-600 dark:text-cyan-400`} />;
    case 'archive':
      return <Archive className={`${className} text-orange-600 dark:text-orange-400`} />;
    default:
      return <File className={`${className} text-zinc-500 dark:text-zinc-400`} />;
  }
};
