'use client';

import { getErrorMessage } from '@/lib/errors';
import React, { useState, useEffect, useRef } from 'react';
import { File as PrismaFile } from '@prisma/client';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Download, 
  Loader2, 
  HardDrive,
  Folder,
  FileImage,
  FileArchive,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  deleteFileAction, 
  getWorkspaceStorageUsageAction,
  getFileDownloadUrlAction
} from '../actions/file-actions';

interface ExtendedFile extends Omit<PrismaFile, 'fileSize'> {
  fileSize: number;
  uploader?: { fullName: string } | null;
}

interface FileManagerProps {
  projectId: string;
  workspaceId: string;
  initialFiles: ExtendedFile[];
  workspaceSlug: string;
}

export function FileManager({ projectId, workspaceId, initialFiles }: FileManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<ExtendedFile[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'Documents' | 'Images' | 'Archives' | 'Others' | null>(null);

  // Storage usage state
  const [storageUsage, setStorageUsage] = useState<{
    usedBytes: number;
    limitBytes: number;
    plan: string;
  } | null>(null);

  // Delete modal state
  const [fileToDelete, setFileToDelete] = useState<ExtendedFile | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Re-sync when the server sends a fresh list (router.refresh()). Done during
  // render rather than in an effect so there is no extra commit with stale files.
  const [syncedFiles, setSyncedFiles] = useState(initialFiles);
  if (initialFiles !== syncedFiles) {
    setSyncedFiles(initialFiles);
    setFiles(initialFiles);
  }

  // Load storage usage. Keyed on the file count, not the `files` array: the array
  // identity changes on every sync, which re-ran this fetch needlessly.
  const fileCount = files.length;
  useEffect(() => {
    let cancelled = false;
    const fetchStorageUsage = async () => {
      const res = await getWorkspaceStorageUsageAction(workspaceId);
      if (!cancelled && res.success && res.data) {
        setStorageUsage(res.data);
      }
    };
    fetchStorageUsage();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, fileCount]);

  const handleUpload = async (selectedFile: File) => {
    // Basic Client Validations
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('workspaceId', workspaceId);
    if (projectId) {
      formData.append('projectId', projectId);
    }

    try {
      const response = await fetch('/api/v1/files/upload', {
        method: 'POST',
        headers: {
          'X-Workspace-Id': workspaceId,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('File uploaded successfully');
        router.refresh();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        toast.error(result.error?.message || 'Failed to upload file');
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'An error occurred during upload'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDownload = async (file: ExtendedFile) => {
    try {
      const res = await getFileDownloadUrlAction(file.id, workspaceId);
      if (res.success && res.data) {
        // Open signed URL in a new window or trigger download
        window.open(res.data, '_blank');
        toast.success('Download started');
      } else {
        toast.error(res.error || 'Failed to get download URL');
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'An error occurred'));
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;

    setIsLoading(true);
    try {
      const res = await deleteFileAction(fileToDelete.id, workspaceId, projectId);
      if (res.success) {
        toast.success('File deleted successfully');
        setIsDeleteOpen(false);
        setFileToDelete(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to delete file');
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Format bytes to readable size
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Compute storage progress percentage
  const storagePercentage = storageUsage && storageUsage.limitBytes !== Infinity
    ? Math.min(100, (storageUsage.usedBytes / storageUsage.limitBytes) * 100)
    : 0;

  const getFileCategory = (fileName: string): 'Documents' | 'Images' | 'Archives' | 'Others' => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv'].includes(ext)) {
      return 'Documents';
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) {
      return 'Images';
    }
    if (['zip', 'rar', 'tar', 'gz', '7z', 'pkg'].includes(ext)) {
      return 'Archives';
    }
    return 'Others';
  };

  const getFileIconInfo = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') {
      return { icon: FileText, color: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400' };
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return { icon: FileText, color: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' };
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      return { icon: FileImage, color: 'border-border bg-secondary text-foreground' };
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return { icon: FileArchive, color: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400' };
    }
    return { icon: FileText, color: 'border-border bg-secondary text-foreground' };
  };

  type FileCategory = 'Documents' | 'Images' | 'Archives' | 'Others';
  const folderCategories: { name: FileCategory; count: number }[] = [
    { name: 'Documents', count: files.filter(f => getFileCategory(f.fileName) === 'Documents').length },
    { name: 'Images', count: files.filter(f => getFileCategory(f.fileName) === 'Images').length },
    { name: 'Archives', count: files.filter(f => getFileCategory(f.fileName) === 'Archives').length },
    { name: 'Others', count: files.filter(f => getFileCategory(f.fileName) === 'Others').length },
  ];

  const filteredCategoryFiles = selectedCategory
    ? files.filter(f => getFileCategory(f.fileName) === selectedCategory)
    : files;

  return (
    <div className="space-y-6">
      {storageUsage && (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.75} />
              <div>
                <p className="text-xs font-semibold text-foreground">Workspace Storage Usage</p>
                <p className="text-[11px] text-muted-foreground">
                  Used: <span className="font-mono font-semibold text-foreground">{formatBytes(storageUsage.usedBytes)}</span>
                  {storageUsage.limitBytes !== Infinity ? (
                    <> of <span className="font-mono font-semibold text-foreground">{formatBytes(storageUsage.limitBytes)}</span> (Free Plan)</>
                  ) : (
                    <> (Pro Plan - Unlimited)</>
                  )}
                </p>
              </div>
            </div>

            {storageUsage.limitBytes !== Infinity && (
              <div className="w-full space-y-1 sm:max-w-xs">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      storagePercentage > 90
                        ? 'bg-destructive'
                        : storagePercentage > 75
                        ? 'bg-amber-500'
                        : 'bg-brand'
                    }`}
                    style={{ width: `${storagePercentage}%` }}
                  />
                </div>
                <div className="text-right font-mono text-[11px] font-medium text-muted-foreground">
                  {storagePercentage.toFixed(1)}% full
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragOver
            ? 'border-brand bg-secondary/70'
            : 'border-border bg-card hover:border-foreground/40'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <>
            <Loader2 className="h-9 w-9 animate-spin text-brand" />
            <p className="text-sm font-semibold text-foreground">Uploading file...</p>
            <p className="text-xs text-muted-foreground">Verifying limits and pushing data to cloud storage.</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-9 w-9 text-muted-foreground" strokeWidth={1.75} />
            <p className="text-sm font-semibold text-foreground">
              Drag & drop a file here, or <span className="text-brand underline-offset-4 hover:underline">browse files</span>
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Supports Images, PDF, Word, Excel, ZIP, RAR up to 10MB.
            </p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading text-sm font-semibold text-foreground">Folders</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {folderCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors cursor-pointer',
                  selectedCategory === cat.name
                    ? 'border-foreground bg-secondary'
                    : 'border-border bg-card hover:bg-secondary/50'
                )}
              >
                <div className={cn('shrink-0 rounded-md border p-2', selectedCategory === cat.name ? 'border-foreground bg-foreground text-background' : 'border-border bg-secondary text-foreground')}>
                  <Folder className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-foreground">{cat.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{cat.count} {cat.count === 1 ? 'file' : 'files'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            {selectedCategory ? `${selectedCategory} Files` : 'All Files'}
          </h2>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs font-medium text-brand hover:underline cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>

        {filteredCategoryFiles.length === 0 ? (
          <Card className="border-border bg-card p-12 text-center">
            <FileText className="mx-auto mb-3 h-9 w-9 text-muted-foreground/50" />
            <p className="text-sm font-semibold text-foreground">No files found</p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
              There are no files uploaded in this category.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredCategoryFiles.map((file) => {
              const fileInfo = getFileIconInfo(file.fileName);
              const FileIconComponent = fileInfo.icon;
              return (
                <Card
                  key={file.id}
                  className="group relative flex h-[120px] flex-col justify-between overflow-hidden rounded-lg border-border bg-card p-4 transition-colors hover:border-foreground/30"
                >
                  <div className="flex min-w-0 items-start justify-between">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className={cn('shrink-0 rounded-md border p-1.5', fileInfo.color)}>
                        <FileIconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="block truncate pr-2 text-sm font-semibold text-foreground" title={file.fileName}>
                          {file.fileName}
                        </span>
                        <span className="mt-0.5 font-mono text-[11px] text-muted-foreground">{formatBytes(file.fileSize)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="max-w-[120px] truncate text-[11px] font-medium text-muted-foreground" title={`Uploaded by ${file.uploader?.fullName || 'Workspace member'}`}>
                      By {file.uploader?.fullName?.split(' ')[0] || 'Member'}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleDownload(file)}
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          setFileToDelete(file);
                          setIsDeleteOpen(true);
                        }}
                        title="Delete file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-border bg-popover sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Delete File</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete this file? This will remove the file from cloud storage and database.
            </DialogDescription>
          </DialogHeader>
          {fileToDelete && (
            <div className="space-y-1 py-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Name:</span>
                <span className="max-w-[200px] truncate font-semibold text-foreground">{fileToDelete.fileName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Size:</span>
                <span className="font-mono font-semibold text-foreground">{formatBytes(fileToDelete.fileSize)}</span>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setIsDeleteOpen(false);
                setFileToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDelete}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
