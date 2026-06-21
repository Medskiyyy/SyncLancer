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
  Calendar, 
  Layers, 
  DollarSign, 
  Clock, 
  CheckSquare, 
  AlertCircle,
  TrendingUp,
  User,
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

const TAB_ICONS = {
  overview: FolderOpen,
  milestones: Layers,
  files: FolderOpen,
  invoices: FileText,
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200',
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
  ON_HOLD: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
  REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
  COMPLETED: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200',
  CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200',
};

const MILESTONE_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
};

const TASK_PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800',
  MEDIUM: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30',
  HIGH: 'text-orange-500 bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/30',
  URGENT: 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30',
};

const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-zinc-105 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200',
  SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-955 dark:text-blue-300 border-blue-200',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-955 dark:text-emerald-300 border-emerald-250',
  OVERDUE: 'bg-rose-100 text-rose-800 dark:bg-rose-955 dark:text-rose-300 border-rose-200',
  CANCELLED: 'bg-amber-100 text-amber-800 dark:bg-amber-955 dark:text-amber-300 border-amber-200',
};

export function ClientProjectPortal({ project, workspaceSlug }: ClientProjectPortalProps) {
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
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
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
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{project.name}</h1>
            <Badge className={`font-semibold uppercase tracking-wider text-[10px] ${STATUS_COLORS[project.status] || ''}`}>
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">
            Client: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{project.client.companyName}</span>
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none">
        {(['overview', 'milestones', 'files', 'invoices'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap capitalize transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-500" /> Description & Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-zinc-650 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                  {project.description || 'No description provided for this project.'}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
                  <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-indigo-500" /> Budget Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">Contract Value</span>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(project.budget, project.currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
                  <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-500" /> Key Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">Start Date</span>
                    <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200">
                      {formatDate(project.startDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">Deadline</span>
                    <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200">
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Project Health Side panel */}
          <div className="space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-500" /> Project Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    <span>Overall Completion</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-950 p-2">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Milestones</p>
                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{project.milestones.length}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-950 p-2">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Invoices</p>
                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{project.invoices.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-500" /> Milestones Timeline
            </CardTitle>
            <CardDescription className="text-xs">
              View the scheduled milestones and delivery timeline. All milestones and tasks are read-only.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {project.milestones.length === 0 ? (
              <div className="text-center py-8 text-zinc-550 dark:text-zinc-400 space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-zinc-400" />
                <p className="text-sm font-semibold">No milestones set up for this project yet.</p>
              </div>
            ) : (
              <div className="relative border-l border-zinc-250 dark:border-zinc-800 pl-6 space-y-8 py-2">
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="relative">
                    <span className="absolute -left-[31px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                      <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    </span>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">{milestone.title}</h3>
                        {milestone.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-2.5 text-[10px] text-zinc-400 dark:text-zinc-550 pt-1">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" /> Due {formatDate(milestone.dueDate)}
                          </span>
                          <span>&bull;</span>
                          <span>{milestone.tasks.length} tasks</span>
                        </div>
                      </div>
                      <Badge className={`w-fit uppercase tracking-wider text-[9px] font-bold ${MILESTONE_STATUS_COLORS[milestone.status]}`}>
                        {milestone.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Milestone tasks */}
                    {milestone.tasks && milestone.tasks.length > 0 && (
                      <div className="mt-4 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 p-3 space-y-2 border border-zinc-150 dark:border-zinc-900/60 max-w-xl">
                        {milestone.tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between text-xs py-0.5">
                            <span className="flex items-center gap-2 font-medium text-zinc-750 dark:text-zinc-300">
                              <CheckSquare className="h-3.5 w-3.5 text-indigo-500" />
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-[8px] font-bold border tracking-wider px-1.5 py-0 uppercase ${TASK_PRIORITY_COLORS[task.priority]}`}>
                                {task.priority}
                              </Badge>
                              <Badge variant="secondary" className="text-[8px] font-bold uppercase tracking-wider px-1 py-0 border">
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
          {/* File Upload Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
              isDragOver 
                ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10' 
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
                <p className="text-xs text-zinc-400">Storing your file securely under this project.</p>
              </>
            ) : (
              <>
                <UploadCloud className="h-10 w-10 text-zinc-400 dark:text-zinc-650" />
                <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200">
                  Drag & drop a file here, or <span className="text-indigo-650 dark:text-indigo-400 hover:underline">browse files</span>
                </p>
                <p className="text-xs text-zinc-400 max-w-sm">
                  Upload project references, feedback, or assets up to 10MB.
                </p>
              </>
            )}
          </div>

          {/* Files List Card */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-indigo-500" /> Project Files
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {project.files.length === 0 ? (
                <div className="text-center py-12 text-zinc-550 dark:text-zinc-400 space-y-2">
                  <FileText className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm font-semibold">No files shared yet</p>
                  <p className="text-xs text-zinc-400">
                    Upload a file above to share it with the project owner.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-805 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                        <th className="py-3 px-4 font-bold">File Name</th>
                        <th className="py-3 px-4 font-bold">Size</th>
                        <th className="py-3 px-4 font-bold">Uploaded By</th>
                        <th className="py-3 px-4 font-bold">Upload Date</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs">
                      {project.files.map((file) => (
                        <tr key={file.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-950/10 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                            <div className="flex items-center gap-2 max-w-[250px] sm:max-w-md truncate">
                              <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                              <span className="truncate" title={file.fileName}>{file.fileName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                            {formatBytes(file.fileSize)}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-650 dark:text-zinc-400">
                            {file.uploader?.fullName || 'Workspace member'}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
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
      )}

      {activeTab === 'invoices' && (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" /> Project Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {project.invoices.length === 0 ? (
              <div className="text-center py-12 text-zinc-550 dark:text-zinc-400 space-y-2">
                <Receipt className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm font-semibold">No invoices generated for this project</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-805 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      <th className="py-3 px-4 font-bold">Invoice Number</th>
                      <th className="py-3 px-4 font-bold">Due Date</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Total Amount</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs">
                    {project.invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-950/10 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-50">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-650 dark:text-zinc-450 font-medium">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider px-2 border ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-zinc-900 dark:text-zinc-50">
                          {formatCurrency(Number(invoice.totalAmount), invoice.currency)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <a 
                            href={`/api/v1/invoices/${invoice.id}/pdf?workspaceId=${project.workspaceId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-450 hover:text-zinc-650 dark:hover:text-zinc-200"
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
