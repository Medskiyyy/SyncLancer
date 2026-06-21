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
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

      {/* Files List Card */}
      <Card className="border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-zinc-150 dark:border-zinc-800/50 pb-4">
          <CardTitle className="text-base font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-550" /> Uploaded Files
          </CardTitle>
          <CardDescription className="text-xs">
            Documents, mockups, and client handovers linked to this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {files.length === 0 ? (
            <div className="text-center py-12 text-slate-550 dark:text-zinc-400 space-y-2">
              <FileText className="h-10 w-10 mx-auto text-slate-300 dark:text-zinc-700" />
              <p className="text-sm font-semibold">No files uploaded yet</p>
              <p className="text-xs text-slate-450 max-w-xs mx-auto">
                Drag a document or image into the upload area above to share it with your workspace.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-150 dark:border-slate-805 bg-zinc-50/50/50 dark:bg-zinc-950/20/20 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    <th className="py-3 px-4 font-bold">File Name</th>
                    <th className="py-3 px-4 font-bold">Size</th>
                    <th className="py-3 px-4 font-bold">Uploaded By</th>
                    <th className="py-3 px-4 font-bold">Upload Date</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-zinc-50/50/40 dark:hover:bg-slate-950/10 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                        <div className="flex items-center gap-2 max-w-[250px] sm:max-w-md truncate">
                          <FileText className="h-4 w-4 text-amber-550 shrink-0" />
                          <span className="truncate" title={file.fileName}>{file.fileName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400">
                        {formatBytes(file.fileSize)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400">
                        {file.uploader?.fullName || 'Workspace member'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400">
                        {formatDate(file.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer h-7 w-7 text-slate-450 hover:text-zinc-650 dark:hover:text-slate-250"
                            onClick={() => handleDownload(file)}
                            title="Download file"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer h-7 w-7 text-red-400 hover:text-red-650 dark:hover:text-red-450"
                            onClick={() => {
                              setFileToDelete(file);
                              setIsDeleteOpen(true);
                            }}
                            title="Delete file"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
