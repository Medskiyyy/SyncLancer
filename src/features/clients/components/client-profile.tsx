'use client';

import React, { useState } from 'react';
import { Client, Project, Proposal, Invoice, ClientUser, User } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Building, 
  Mail, 
  Phone, 
  FolderKanban, 
  FileText, 
  Receipt, 
  FolderOpen, 
  Send, 
  Plus, 
  UserPlus, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { inviteClientPortalAction } from '../actions/client-actions';
import { cn } from '@/lib/utils';

interface ExtendedClientUser extends ClientUser {
  user: User;
}

interface ClientProfileProps {
  client: Client & {
    projects: Project[];
    proposals: Proposal[];
    invoices: Invoice[];
    portalUsers: ExtendedClientUser[];
  };
  files: any[];
  workspaceId: string;
  workspaceSlug: string;
}

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  title: z.string().min(2, 'Job title must be at least 2 characters'),
});

type InviteInput = z.infer<typeof inviteSchema>;

export function ClientProfile({ client, files, workspaceId, workspaceSlug }: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'invoices' | 'files'>('overview');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [portalUsers, setPortalUsers] = useState<ExtendedClientUser[]>(client.portalUsers);

  const inviteForm = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      title: '',
    },
  });

  const handleInviteUser = async (data: InviteInput) => {
    setIsLoading(true);
    try {
      const result = await inviteClientPortalAction(
        workspaceId,
        client.id,
        data.email,
        data.title
      );

      if (result.success && result.data) {
        toast.success('Invitation sent to representative');
        setIsInviteOpen(false);
        inviteForm.reset();
        
        // Optimistically add client user to list
        const newClientUser = result.data as ExtendedClientUser;
        setPortalUsers(prev => [...prev, newClientUser]);
      } else {
        toast.error(result.error || 'Failed to send invitation');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Render tab contents
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Active Projects */}
            <Card className="shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-55">Projects Scopes</CardTitle>
                  <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Active and completed scopes of work under this client account</CardDescription>
                </div>
                <Badge variant="secondary" className="rounded-full font-mono text-[10px] px-2 py-0.5 border border-zinc-200/40 dark:border-zinc-800/40">{client.projects.length} Total</Badge>
              </CardHeader>
              <CardContent className="pt-4">
                {client.projects.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs font-medium">
                    No projects found for this client. Create a project from Settings or Proposals.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-150 dark:divide-zinc-800/80">
                    {client.projects.map((project) => (
                      <div key={project.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                        <div>
                          <Link href={`/${workspaceSlug}/projects/${project.id}`} className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 hover:text-primary hover:underline transition-colors">
                            {project.name}
                          </Link>
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-medium">
                            Budget: {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(project.budget))} &middot; Deadline: {new Date(project.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600" style={{ width: `${project.progress}%` }} />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-zinc-650 dark:text-zinc-400">{project.progress}%</span>
                          </div>
                          <Badge 
                            className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5",
                              project.status === 'ACTIVE' 
                                ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-550/15"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/30"
                            )}
                            variant="secondary"
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes & Description */}
            <Card className="shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
                <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-55">Internal Notes</CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Important business context, preferences, and background information</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-zinc-700 dark:text-zinc-355 whitespace-pre-wrap pt-4 leading-relaxed font-medium">
                {client.notes || 'No internal notes recorded for this client.'}
              </CardContent>
            </Card>
          </div>
        );

      case 'proposals':
        return (
          <Card className="shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-55">Submitted Proposals</CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Submitted estimates, bids, and scopes agreements</CardDescription>
              </div>
              <Badge variant="secondary" className="rounded-full font-mono text-[10px] px-2 py-0.5 border border-zinc-200/40 dark:border-zinc-800/40">{client.proposals.length} Total</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {client.proposals.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs font-medium pt-8">
                  No proposals found. Let&apos;s create your first proposal for this client.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-900/30">
                        <th className="px-5 py-3">Number</th>
                        <th className="px-5 py-3">Proposal Title</th>
                        <th className="px-5 py-3">Total Cost</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900">
                      {client.proposals.map((proposal) => (
                        <tr key={proposal.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/40 transition-colors">
                          <td className="px-5 py-3 font-mono font-bold text-zinc-600 dark:text-zinc-400 text-[10px]">
                            {proposal.proposalNumber}
                          </td>
                          <td className="px-5 py-3 font-semibold text-zinc-800 dark:text-zinc-200">
                            {proposal.title}
                          </td>
                          <td className="px-5 py-3 font-bold font-mono text-zinc-900 dark:text-zinc-100">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: proposal.currency }).format(Number(proposal.totalAmount))}
                          </td>
                          <td className="px-5 py-3">
                            <Badge 
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5",
                                proposal.status === 'APPROVED' 
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-550/15"
                                  : proposal.status === 'SENT'
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-550/15"
                                    : proposal.status === 'REJECTED'
                                      ? "bg-red-500/10 text-red-650 dark:text-red-400 border border-red-550/15"
                                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/30"
                              )}
                              variant="secondary"
                            >
                              {proposal.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-zinc-400 dark:text-zinc-500 font-medium">
                            {new Date(proposal.expiresAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'invoices':
        return (
          <Card className="shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-55">Billing & Invoices</CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Billing history, balances, and payment records</CardDescription>
              </div>
              <Badge variant="secondary" className="rounded-full font-mono text-[10px] px-2 py-0.5 border border-zinc-200/40 dark:border-zinc-800/40">{client.invoices.length} Total</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {client.invoices.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs font-medium pt-8">
                  No billing records found. You can generate invoices inside the Invoice section.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-900/30">
                        <th className="px-5 py-3">Invoice Number</th>
                        <th className="px-5 py-3">Total Amount</th>
                        <th className="px-5 py-3">Payment Status</th>
                        <th className="px-5 py-3">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900">
                      {client.invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/40 transition-colors">
                          <td className="px-5 py-3 font-mono font-bold text-zinc-650 dark:text-zinc-400 text-[10px]">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-5 py-3 font-bold font-mono text-zinc-900 dark:text-zinc-100">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(Number(invoice.totalAmount))}
                          </td>
                          <td className="px-5 py-3">
                            <Badge 
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5",
                                invoice.status === 'PAID' 
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-550/15"
                                  : invoice.status === 'OVERDUE'
                                    ? "bg-red-500/10 text-red-650 dark:text-red-400 border border-red-550/15"
                                    : invoice.status === 'SENT'
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-550/15"
                                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/30"
                              )}
                              variant="secondary"
                            >
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-zinc-400 dark:text-zinc-500 font-medium">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'files':
        return (
          <Card className="shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-55">Workspace Materials</CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Aggregated scope files, assets, and design sheets uploaded under this client</CardDescription>
              </div>
              <Badge variant="secondary" className="rounded-full font-mono text-[10px] px-2 py-0.5 border border-zinc-200/40 dark:border-zinc-800/40">{files.length} Files</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              {files.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs font-medium">
                  No files uploaded for this client&apos;s projects.
                </div>
              ) : (
                <div className="divide-y divide-zinc-150 dark:divide-zinc-800/80">
                  {files.map((file) => (
                    <div key={file.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-4 w-4 text-zinc-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">{file.fileName}</div>
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-medium">
                            {file.fileType.toUpperCase()} &middot; {new Intl.NumberFormat('en', { notation: 'compact', style: 'unit', unit: 'byte' }).format(Number(file.fileSize))}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-550 font-medium">
                        Uploaded: {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Breadcrumbs & Back Button */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
        <Link href={`/${workspaceSlug}/clients`} className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
          Clients
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="text-zinc-900 dark:text-zinc-50 font-extrabold truncate">{client.companyName}</span>
      </div>

      {/* Main Profile Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Client Info Card & Portal Members */}
        <div className="space-y-6 lg:col-span-1">
          {/* Main Info Card */}
          <Card className="shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="pb-4 border-b border-zinc-150 dark:border-zinc-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 shadow-xs mb-3">
                <Building className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-zinc-950 dark:text-zinc-50">{client.companyName}</CardTitle>
              <CardDescription className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                Client directory entry since {new Date(client.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs font-medium">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-305 truncate">{client.primaryEmail}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="text-zinc-700 dark:text-zinc-305">{client.phone}</span>
                </div>
              )}
              <div className="pt-1">
                <Badge 
                  className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5",
                    client.archived 
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/30"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-550/15"
                  )}
                  variant="secondary"
                >
                  {client.archived ? 'Archived Client' : 'Active Workspace Client'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Portal User Invitation / List */}
          <Card className="shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="pb-3 border-b border-zinc-150 dark:border-zinc-800 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Client Portal keys</CardTitle>
                <CardDescription className="text-[10px] text-zinc-400 dark:text-zinc-500">Security tokens for client representatives</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                title="Invite Portal User"
                onClick={() => setIsInviteOpen(true)}
                className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {portalUsers.length === 0 ? (
                <div className="text-center py-6 text-zinc-400 dark:text-zinc-500 text-xs font-medium">
                  No secure portal users set up yet. Invite one below.
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsInviteOpen(true)} 
                    className="w-full mt-3 flex items-center justify-center gap-1.5 cursor-pointer text-[10px] font-bold h-8 rounded-lg"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-primary" />
                    <span>Invite Client Rep</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {portalUsers.map((portalUser) => {
                    const isActive = !!portalUser.user.passwordHash;
                    return (
                      <div key={portalUser.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/60 dark:border-zinc-800">
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-zinc-850 dark:text-zinc-200 truncate">{portalUser.user.email}</div>
                          <div className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">{portalUser.title}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isActive ? (
                            <Badge variant="default" className="text-[8px] font-extrabold px-1.5 py-0.5 bg-green-550/10 text-green-600 dark:text-green-400 border border-green-550/15 flex items-center gap-0.5">
                              <ShieldCheck className="h-2.5 w-2.5" />
                              <span>Active</span>
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[8px] font-extrabold px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/30 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5 animate-pulse" />
                              <span>Invited</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Navigation Tabs & Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation Menu */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-850 bg-white/50 dark:bg-zinc-900/50 p-1 rounded-t-xl gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border border-transparent transition-all cursor-pointer",
                activeTab === 'overview'
                  ? "bg-zinc-100 dark:bg-zinc-850 text-zinc-950 dark:text-zinc-50 border-zinc-200/40 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              <FolderKanban className="h-3.5 w-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border border-transparent transition-all cursor-pointer",
                activeTab === 'proposals'
                  ? "bg-zinc-100 dark:bg-zinc-850 text-zinc-950 dark:text-zinc-50 border-zinc-200/40 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Proposals</span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border border-transparent transition-all cursor-pointer",
                activeTab === 'invoices'
                  ? "bg-zinc-100 dark:bg-zinc-850 text-zinc-950 dark:text-zinc-50 border-zinc-200/40 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Invoices</span>
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border border-transparent transition-all cursor-pointer",
                activeTab === 'files'
                  ? "bg-zinc-100 dark:bg-zinc-850 text-zinc-950 dark:text-zinc-50 border-zinc-200/40 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span>Files</span>
            </button>
          </div>

          {/* Actual Tab Card content rendering */}
          {renderTabContent()}
        </div>
      </div>

      {/* Invite Client User Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-md p-6 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Invite Portal User</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 dark:text-zinc-500 text-xs">
              Provide contact credentials for client representatives. An invitation will allow them to login securely to their own branded client portal.
            </DialogDescription>
          </DialogHeader>

          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(handleInviteUser)} className="space-y-4 pt-2">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Representative Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="representative@acme.com" className="text-xs h-9 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Job Title / Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Project Manager, CEO, Tech Lead" className="text-xs h-9 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isLoading} className="cursor-pointer text-xs h-9 font-semibold w-full sm:w-auto">
                  {isLoading ? 'Inviting...' : 'Send Portal Invite'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
