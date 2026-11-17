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
  Calendar, 
  Layers, 
  DollarSign, 
  CheckSquare, 
  AlertCircle,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFileDownloadUrlAction } from '@/features/files/actions/file-actions';

interface ClientProjectPortalProps {
  project: {
    id: string;
    workspaceId: string;
    name: string;
    description: string;
    budget: number;
    currency: string;
    startDate: Date | string;
    deadline: Date | string;
    progress: number;
    status: string;
    client: {
      companyName: string;
    };
    milestones: Array<{
      id: string;
      title: string;
      description: string;
      dueDate: Date | string;
      status: string;
      tasks: Array<{
        id: string;
        title: string;
        priority: string;
        status: string;
      }>;
    }>;
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      currency: string;
      totalAmount: number;
      dueDate: Date | string;
      status: string;
    }>;
    files: Array<{
      id: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      createdAt: Date | string;
      uploader?: {
        fullName: string;
      } | null;
    }>;
  };
  workspaceSlug: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'border-border bg-secondary text-foreground',
  ACTIVE: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  ON_HOLD: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  REVIEW: 'border-border bg-secondary text-foreground',
  COMPLETED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  CANCELLED: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
};

const MILESTONE_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'border-border bg-secondary text-muted-foreground',
  IN_PROGRESS: 'border-border bg-secondary text-foreground',
  COMPLETED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

const TASK_PRIORITY_COLORS: Record<string, string> = {
  LOW: 'border-border bg-secondary text-muted-foreground',
  MEDIUM: 'border-border bg-background text-foreground',
  HIGH: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  URGENT: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
};

const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'border-border bg-secondary text-muted-foreground',
  SENT: 'border-border bg-secondary text-foreground',
  PAID: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  OVERDUE: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
  CANCELLED: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
};

export function ClientProjectPortal({ project }: ClientProjectPortalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'files' | 'invoices'>('overview');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const formatCurrency = (amount: number, curr = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleDownload = async (fileId: string) => {
    try {
      const res = await getFileDownloadUrlAction(fileId, project.workspaceId);
      if (res.success && res.data) {
        window.open(res.data, '_blank');
        toast.success('Download started');
      } else {
        toast.error(res.error || 'Failed to generate download link');
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'An error occurred'));
    }
  };

  const handleFileUpload = async (selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('workspaceId', project.workspaceId);
    formData.append('projectId', project.id);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
            <Badge className={`px-2 text-[11px] font-medium ${STATUS_COLORS[project.status] || 'border-border bg-secondary text-foreground'}`}>
              {project.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Client: <span className="font-semibold text-foreground">{project.client.companyName}</span>
          </p>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-border scrollbar-none">
        {(['overview', 'milestones', 'files', 'invoices'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap capitalize transition-colors ${
              activeTab === tab
                ? 'border-brand font-semibold text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
                  <Layers className="h-4 w-4 text-brand" strokeWidth={1.75} /> Description & Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {project.description || 'No description provided for this project.'}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
                    <DollarSign className="h-4 w-4 text-brand" strokeWidth={1.75} /> Budget Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  <div>
                    <span className="text-xs text-muted-foreground">Contract Value</span>
                    <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                      {formatCurrency(project.budget, project.currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
                    <Calendar className="h-4 w-4 text-brand" strokeWidth={1.75} /> Key Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  <div>
                    <span className="text-xs text-muted-foreground">Start Date</span>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(project.startDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Deadline</span>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
                  <TrendingUp className="h-4 w-4 text-brand" strokeWidth={1.75} /> Project Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>Overall Completion</span>
                    <span className="font-mono font-semibold tabular-nums text-foreground">{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-brand transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-border overflow-hidden rounded-md border border-border bg-secondary/40 text-center text-xs">
                  <div className="p-2.5">
                    <p className="text-[11px] text-muted-foreground">Milestones</p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-foreground">{project.milestones.length}</p>
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] text-muted-foreground">Invoices</p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-foreground">{project.invoices.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
              <Layers className="h-4 w-4 text-brand" strokeWidth={1.75} /> Milestones Timeline
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              View the scheduled milestones and delivery timeline. All milestones and tasks are read-only.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {project.milestones.length === 0 ? (
              <div className="space-y-2 py-8 text-center text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">No milestones set up for this project yet.</p>
              </div>
            ) : (
              <div className="relative space-y-8 border-l border-border py-2 pl-6">
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="relative">
                    <span className="absolute -left-[31px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-border bg-card">
                      <span className="h-2 w-2 rounded-full bg-brand" />
                    </span>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">{milestone.title}</h3>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-2.5 pt-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" /> Due {formatDate(milestone.dueDate)}
                          </span>
                          <span>·</span>
                          <span>{milestone.tasks.length} tasks</span>
                        </div>
                      </div>
                      <Badge className={`w-fit border px-2 text-[11px] font-medium ${MILESTONE_STATUS_COLORS[milestone.status] || 'border-border bg-secondary text-foreground'}`}>
                        {milestone.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {milestone.tasks && milestone.tasks.length > 0 && (
                      <div className="mt-4 max-w-xl space-y-2 rounded-md border border-border bg-secondary/40 p-3">
                        {milestone.tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between py-0.5 text-xs">
                            <span className="flex items-center gap-2 font-medium text-foreground">
                              <CheckSquare className="h-3.5 w-3.5 text-brand" />
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`px-1.5 py-0 text-[11px] font-medium ${TASK_PRIORITY_COLORS[task.priority] || ''}`}>
                                {task.priority}
                              </Badge>
                              <Badge variant="secondary" className="border border-border bg-background px-1.5 py-0 text-[11px] font-medium text-foreground">
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'files' && (
        <div className="space-y-6">
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
                <p className="text-xs text-muted-foreground">Storing your file securely under this project.</p>
              </>
            ) : (
              <>
                <UploadCloud className="h-9 w-9 text-muted-foreground" strokeWidth={1.75} />
                <p className="text-sm font-semibold text-foreground">
                  Drag & drop a file here, or <span className="text-brand hover:underline">browse files</span>
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Upload project references, feedback, or assets up to 10MB.
                </p>
              </>
            )}
          </div>

          <Card className="overflow-hidden border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
                <FolderOpen className="h-4 w-4 text-brand" strokeWidth={1.75} /> Project Files
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {project.files.length === 0 ? (
                <div className="space-y-2 py-12 text-center text-muted-foreground">
                  <FileText className="mx-auto h-9 w-9 text-muted-foreground/50" />
                  <p className="text-sm font-semibold text-foreground">No files shared yet</p>
                  <p className="text-xs text-muted-foreground">
                    Upload a file above to share it with the project owner.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 text-xs font-medium text-muted-foreground">
                        <th className="px-4 py-3">File Name</th>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Uploaded By</th>
                        <th className="px-4 py-3">Upload Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {project.files.map((file) => (
                        <tr key={file.id} className="transition-colors hover:bg-secondary/40">
                          <td className="px-4 py-3.5 font-medium text-foreground">
                            <div className="flex max-w-[250px] items-center gap-2 truncate sm:max-w-md">
                              <FileText className="h-4 w-4 shrink-0 text-brand" />
                              <span className="truncate" title={file.fileName}>{file.fileName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-muted-foreground">
                            {formatBytes(file.fileSize)}
                          </td>
                          <td className="px-4 py-3.5 text-muted-foreground">
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
      )}

      {activeTab === 'invoices' && (
        <Card className="overflow-hidden border-border bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
              <FileText className="h-4 w-4 text-brand" strokeWidth={1.75} /> Project Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {project.invoices.length === 0 ? (
              <div className="space-y-2 py-12 text-center text-muted-foreground">
                <Receipt className="mx-auto h-9 w-9 text-muted-foreground/50" />
                <p className="text-sm font-semibold text-foreground">No invoices generated for this project</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50 text-xs font-medium text-muted-foreground">
                      <th className="px-4 py-3">Invoice Number</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Total Amount</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {project.invoices.map((invoice) => (
                      <tr key={invoice.id} className="transition-colors hover:bg-secondary/40">
                        <td className="px-4 py-3.5 font-mono font-semibold text-foreground">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-muted-foreground">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="outline" className={`px-2 text-[11px] font-medium ${INVOICE_STATUS_COLORS[invoice.status] || 'border-border bg-secondary text-foreground'}`}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-foreground">
                          {formatCurrency(Number(invoice.totalAmount), invoice.currency)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <a
                            href={`/api/v1/invoices/${invoice.id}/pdf?workspaceId=${project.workspaceId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Download PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
