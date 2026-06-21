'use client';

import React, { useState, useEffect, useRef } from 'react';
import { File as PrismaFile, User } from '@prisma/client';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Download, 
  AlertCircle, 
  Loader2, 
  HardDrive,
  ExternalLink,
  Folder,
  FileImage,
  FileCode,
  FileArchive,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export function FileManager({ projectId, workspaceId, initialFiles, workspaceSlug }: FileManagerProps) {
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

  // Sync initialFiles prop with local state when it updates
  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  // Load storage usage
  const fetchStorageUsage = async () => {
    const res = await getWorkspaceStorageUsageAction(workspaceId);
    if (res.success && res.data) {
      setStorageUsage(res.data);
    }
  };

  useEffect(() => {
    fetchStorageUsage();
  }, [workspaceId, files]);

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
    } catch (e: any) {
      toast.error(e.message || 'An error occurred during upload');
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
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
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
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
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

  // Helper: Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      return { icon: FileText, color: 'text-rose-600 bg-rose-50 border-rose-100' };
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return { icon: FileText, color: 'text-emerald-650 bg-emerald-50 border-emerald-100' };
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      return { icon: FileImage, color: 'text-violet-600 bg-violet-50 border-violet-100' };
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return { icon: FileArchive, color: 'text-amber-600 bg-amber-50 border-amber-100' };
    }
    return { icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-100' };
  };

  const folderCategories = [
    { name: 'Documents', count: files.filter(f => getFileCategory(f.fileName) === 'Documents').length, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { name: 'Images', count: files.filter(f => getFileCategory(f.fileName) === 'Images').length, color: 'text-violet-650 bg-violet-50 border-violet-100' },
    { name: 'Archives', count: files.filter(f => getFileCategory(f.fileName) === 'Archives').length, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { name: 'Others', count: files.filter(f => getFileCategory(f.fileName) === 'Others').length, color: 'text-slate-650 bg-slate-50 border-slate-100' },
  ];

  const filteredCategoryFiles = selectedCategory
    ? files.filter(f => getFileCategory(f.fileName) === selectedCategory)
    : files;

  return (
    <div className="space-y-6">
      {/* Storage Progress bar (Free plan limits) */}
      {storageUsage && (
        <Card className="border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-amber-550 shrink-0" />
              <div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Workspace Storage Usage</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Used: <span className="font-semibold text-zinc-700 dark:text-slate-350">{formatBytes(storageUsage.usedBytes)}</span>
                  {storageUsage.limitBytes !== Infinity ? (
                    <> of <span className="font-semibold text-zinc-700 dark:text-slate-350">{formatBytes(storageUsage.limitBytes)}</span> (Free Plan)</>
                  ) : (
                    <> (Pro Plan - Unlimited)</>
                  )}
                </p>
              </div>
            </div>

            {storageUsage.limitBytes !== Infinity && (
              <div className="w-full sm:max-w-xs space-y-1">
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      storagePercentage > 90 
                        ? 'bg-red-500' 
                        : storagePercentage > 75 
                        ? 'bg-orange-500' 
                        : 'bg-primary'
                    }`} 
                    style={{ width: `${storagePercentage}%` }}
                  ></div>
                </div>
                <div className="text-[9px] text-right font-semibold text-zinc-500">
                  {storagePercentage.toFixed(1)}% full
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Drag & Drop Upload Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
          isDragOver 
            ? 'border-primary bg-amber-500/5 dark:bg-amber-950/5' 
            : 'border-zinc-200/60 hover:border-amber-500/40 bg-white dark:border-zinc-800/80 dark:bg-slate-900 dark:hover:border-primary'
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
            <Loader2 className="h-10 w-10 text-amber-550 animate-spin" />
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Uploading file...</p>
            <p className="text-xs text-slate-400">Verifying limits and pushing data to cloud storage.</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-10 w-10 text-slate-450 dark:text-slate-550" />
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Drag & drop a file here, or <span className="text-amber-600 dark:text-amber-400 hover:underline">browse files</span>
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Supports Images, PDF, Word, Excel, ZIP, RAR up to 10MB.
            </p>
          </>
        )}
      </div>

      {/* Folders Section */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Folders</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {folderCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name as any)}
                className={cn(
                  "flex items-center gap-3 p-4 border rounded-xl bg-white shadow-xs transition-all hover:scale-[1.01] cursor-pointer text-left",
                  selectedCategory === cat.name ? "border-blue-550 ring-2 ring-blue-550/5 bg-slate-50/50" : "border-slate-200"
                )}
              >
                <div className={cn("p-2 rounded-lg border shrink-0", cat.color)}>
                  <Folder className="h-5 w-5 fill-current" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-slate-900 truncate">{cat.name}</span>
                  <span className="text-xs text-slate-505">{cat.count} {cat.count === 1 ? 'file' : 'files'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Files List Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            {selectedCategory ? `${selectedCategory} Files` : 'All Files'}
          </h2>
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)} 
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>

        {filteredCategoryFiles.length === 0 ? (
          <Card className="border-slate-200 bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-900">No files found</p>
            <p className="text-xs text-slate-450 mt-1 max-w-xs mx-auto">
              There are no files uploaded in this category.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategoryFiles.map((file) => {
              const fileInfo = getFileIconInfo(file.fileName);
              const FileIconComponent = fileInfo.icon;
              return (
                <Card 
                  key={file.id} 
                  className="bg-white border-slate-200 p-4 h-[120px] flex flex-col justify-between shadow-xs hover:scale-[1.01] transition-all rounded-xl relative group overflow-hidden"
                >
                  <div className="flex items-start justify-between min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn("p-1.5 rounded-lg border shrink-0", fileInfo.color)}>
                        <FileIconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-slate-900 truncate block pr-2" title={file.fileName}>
                          {file.fileName}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">{formatBytes(file.fileSize)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[9px] font-medium text-slate-450 truncate max-w-[120px]" title={`Uploaded by ${file.uploader?.fullName || 'Workspace member'}`}>
                      By {file.uploader?.fullName?.split(' ')[0] || 'Member'}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-slate-900 rounded-md shrink-0 cursor-pointer"
                        onClick={() => handleDownload(file)}
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-405 hover:text-red-650 hover:bg-red-50 rounded-md shrink-0 cursor-pointer"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-950 dark:text-zinc-100">Delete File</DialogTitle>
            <DialogDescription className="text-slate-550 dark:text-zinc-400 text-xs">
              Are you sure you want to permanently delete this file? This will remove the file from cloud storage and database.
            </DialogDescription>
          </DialogHeader>
          {fileToDelete && (
            <div className="py-2 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Name:</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 max-w-[200px] truncate">{fileToDelete.fileName}</span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Size:</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatBytes(fileToDelete.fileSize)}</span>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setIsDeleteOpen(false);
                setFileToDelete(null);
              }}
              className="cursor-pointer border-zinc-200/60 dark:border-zinc-800/80 text-slate-750 dark:text-slate-350"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDelete}
              className="cursor-pointer bg-red-650 hover:bg-red-700 text-white font-medium"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
