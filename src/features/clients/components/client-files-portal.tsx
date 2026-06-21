'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  FolderOpen, 
  FileText, 
  Download, 
  UploadCloud, 
  Loader2, 
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getFileDownloadUrlAction } from '@/features/files/actions/file-actions';

interface ClientFilesPortalProps {
  projects: Array<{
    id: string;
    name: string;
  }>;
  files: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    createdAt: Date | string;
    project?: {
      name: string;
    } | null;
    uploader?: {
      fullName: string;
    } | null;
  }>;
  workspaceId: string;
}

export function ClientFilesPortal({ projects, files, workspaceId }: ClientFilesPortalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDownload = async (fileId: string) => {
    try {
      const res = await getFileDownloadUrlAction(fileId, workspaceId);
      if (res.success && res.data) {
        window.open(res.data, '_blank');
        toast.success('Download started');
      } else {
        toast.error(res.error || 'Failed to get download URL');
      }
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
    }
  };

  const handleFileUpload = async (selectedFile: File) => {
    if (!selectedProjectId) {
      toast.error('Please select a project to link the file to.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('workspaceId', workspaceId);
    formData.append('projectId', selectedProjectId);

    try {
      const response = await fetch('/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await response.json();
      if (res.success) {
        toast.success('File uploaded successfully!');
        router.refresh();
      } else {
        toast.error(res.error?.message || 'Failed to upload file');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload card */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <UploadCloud className="h-4.5 w-4.5 text-indigo-500" /> Share a File
          </CardTitle>
          <CardDescription className="text-xs">
            Link a file to one of your active projects and upload it.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          {projects.length === 0 ? (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-955/20 text-amber-850 dark:text-amber-300 rounded-lg border border-amber-100 dark:border-amber-900/60 text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-450" />
              <div className="space-y-1">
                <p className="font-bold">No Active Projects</p>
                <p className="text-zinc-650 dark:text-zinc-350 font-medium">
                  You must be linked to at least one project before you can upload files.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5 max-w-xs">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Target Project</label>
                <Select
                  value={selectedProjectId}
                  onValueChange={(val) => setSelectedProjectId(val || '')}
                  disabled={isUploading}
                >
                  <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-250 dark:border-zinc-800 h-9 text-xs">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-955 border-zinc-250 dark:border-zinc-800">
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProjectId && (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                    isDragOver 
                      ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-955/10' 
                      : 'border-zinc-250 hover:border-indigo-400 bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    disabled={isUploading}
                  />
                  
                  {isUploading ? (
                    <>
                      <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Uploading file...</p>
                      <p className="text-xs text-zinc-400">Storing your file securely.</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-10 w-10 text-zinc-450 dark:text-zinc-550" />
                      <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200">
                        Drag & drop a file here, or <span className="text-indigo-650 dark:text-indigo-400 hover:underline">browse files</span>
                      </p>
                      <p className="text-xs text-zinc-400 max-w-sm">
                        Supports images, PDF, documents up to 10MB.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files List Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-indigo-500" /> Shared Files & Assets
          </CardTitle>
          <CardDescription className="text-xs">
            A listing of all project documents, mockups, and assets shared with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {files.length === 0 ? (
            <div className="text-center py-12 text-zinc-550 dark:text-zinc-400 space-y-2">
              <FileText className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-semibold">No files shared yet</p>
              <p className="text-xs text-zinc-400 font-medium">Select a project and upload a file above to begin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-150 dark:border-zinc-805 bg-zinc-50/50 dark:bg-zinc-955/20 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    <th className="py-3 px-4 font-bold">File Name</th>
                    <th className="py-3 px-4 font-bold">Linked Project</th>
                    <th className="py-3 px-4 font-bold">Size</th>
                    <th className="py-3 px-4 font-bold">Uploaded By</th>
                    <th className="py-3 px-4 font-bold">Upload Date</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850 text-xs">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-955/10 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                        <div className="flex items-center gap-2 max-w-[250px] sm:max-w-md truncate">
                          <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span className="truncate" title={file.fileName}>{file.fileName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-650 dark:text-zinc-400 font-medium">
                        {file.project?.name || 'Workspace Document'}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-650 dark:text-zinc-400">
                        {formatBytes(file.fileSize)}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-655 dark:text-zinc-400 font-medium">
                        {file.uploader?.fullName || 'Workspace member'}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-650 dark:text-zinc-400 font-medium">
                        {formatDate(file.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-450 hover:text-zinc-650 dark:hover:text-zinc-250"
                          onClick={() => handleDownload(file.id)}
                          title="Download file"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
