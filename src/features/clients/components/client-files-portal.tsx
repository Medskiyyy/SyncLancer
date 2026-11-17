'use client';

import { getErrorMessage } from '@/lib/errors';
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
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'An error occurred'));
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
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'An error occurred'));
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
      <Card className="overflow-hidden border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
            <UploadCloud className="h-4 w-4 text-brand" strokeWidth={1.75} /> Share a File
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Link a file to one of your active projects and upload it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          {projects.length === 0 ? (
            <div className="flex items-start gap-2.5 rounded-md border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <p className="font-semibold">No Active Projects</p>
                <p className="text-muted-foreground">
                  You must be linked to at least one project before you can upload files.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-w-xs space-y-1.5">
                <label className="text-xs font-medium text-foreground">Target Project</label>
                <Select
                  value={selectedProjectId}
                  onValueChange={(val) => setSelectedProjectId(val || '')}
                  disabled={isUploading}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
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
                    disabled={isUploading}
                  />

                  {isUploading ? (
                    <>
                      <Loader2 className="h-9 w-9 animate-spin text-brand" />
                      <p className="text-sm font-semibold text-foreground">Uploading file...</p>
                      <p className="text-xs text-muted-foreground">Storing your file securely.</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-9 w-9 text-muted-foreground" strokeWidth={1.75} />
                      <p className="text-sm font-semibold text-foreground">
                        Drag & drop a file here, or <span className="text-brand hover:underline">browse files</span>
                      </p>
                      <p className="max-w-sm text-xs text-muted-foreground">
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

      <Card className="overflow-hidden border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
            <FolderOpen className="h-4 w-4 text-brand" strokeWidth={1.75} /> Shared Files & Assets
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            A listing of all project documents, mockups, and assets shared with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {files.length === 0 ? (
            <div className="space-y-2 py-12 text-center text-muted-foreground">
              <FileText className="mx-auto h-9 w-9 text-muted-foreground/50" />
              <p className="text-sm font-semibold text-foreground">No files shared yet</p>
              <p className="text-xs text-muted-foreground">Select a project and upload a file above to begin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3">File Name</th>
                    <th className="px-4 py-3">Linked Project</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Uploaded By</th>
                    <th className="px-4 py-3">Upload Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {files.map((file) => (
                    <tr key={file.id} className="transition-colors hover:bg-secondary/40">
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        <div className="flex max-w-[250px] items-center gap-2 truncate sm:max-w-md">
                          <FileText className="h-4 w-4 shrink-0 text-brand" />
                          <span className="truncate" title={file.fileName}>{file.fileName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-muted-foreground">
                        {file.project?.name || 'Workspace Document'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-muted-foreground">
                        {formatBytes(file.fileSize)}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-muted-foreground">
                        {file.uploader?.fullName || 'Workspace member'}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {formatDate(file.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
