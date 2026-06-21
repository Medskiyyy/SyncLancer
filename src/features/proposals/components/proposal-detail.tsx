'use client';

import React, { useState } from 'react';
import { Proposal, ProposalItem, Client, Project } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Send, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Building,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { 
  sendProposalAction, 
  rejectProposalAction, 
  approveProposalAction 
} from '../actions/proposal-actions';

interface ExtendedProposal extends Proposal {
  items: ProposalItem[];
  client: Client;
  projects?: Project[];
}

interface ProposalDetailProps {
  proposal: ExtendedProposal;
  workspaceId: string;
  workspaceSlug: string;
}

export function ProposalDetail({ proposal: initialProposal, workspaceId, workspaceSlug }: ProposalDetailProps) {
  const router = useRouter();
  const [proposal, setProposal] = useState<ExtendedProposal>(initialProposal);
  const [isLoading, setIsLoading] = useState(false);
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);

  const currencyFormatter = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: proposal.currency || 'USD',
    }).format(amount);
  };

  const handleSendProposal = async () => {
    setIsLoading(true);
    try {
      const result = await sendProposalAction(proposal.id, workspaceId);
      if (result.success && result.data) {
        toast.success('Proposal sent to client successfully');
        setProposal(result.data as ExtendedProposal);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to send proposal');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectProposal = async () => {
    if (!confirm('Are you sure you want to reject this proposal?')) return;
    setIsLoading(true);
    try {
      const result = await rejectProposalAction(proposal.id, workspaceId);
      if (result.success && result.data) {
        toast.success('Proposal marked as rejected');
        setProposal(result.data as ExtendedProposal);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to reject proposal');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveProposal = async () => {
    setIsLoading(true);
    try {
      const result = await approveProposalAction(proposal.id, workspaceId);
      if (result.success && result.data) {
        toast.success('Proposal approved! Project auto-spawned successfully.');
        setProposal(result.data.proposal as ExtendedProposal);
        router.refresh();
      } else if (result.code === 'LIMIT_EXCEEDED') {
        setIsLimitDialogOpen(true);
      } else {
        toast.error(result.error || 'Failed to approve proposal');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockUpgrade = () => {
    setIsLimitDialogOpen(false);
    toast.success('Successfully upgraded to Pro plan! You can now approve proposals and manage unlimited projects.');
    // In a real application, this would redirect to stripe checkout or billing settings.
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-600 hover:bg-green-600">Approved</Badge>;
      case 'SENT':
        return <Badge variant="secondary">Sent</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'EXPIRED':
        return <Badge variant="outline" className="text-zinc-400 border-zinc-300">Expired</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const hasExpired = new Date() > new Date(proposal.expiresAt) && proposal.status !== 'APPROVED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation & Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/${workspaceSlug}/proposals`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Proposals</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {proposal.status === 'DRAFT' && (
            <Link href={`/${workspaceSlug}/proposals/${proposal.id}/edit`}>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <Edit className="h-4 w-4" />
                <span>Edit Draft</span>
              </Button>
            </Link>
          )}
          <a 
            href={`/api/v1/proposals/${proposal.id}/pdf?workspaceId=${workspaceId}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Main banner status alerts */}
      {proposal.status === 'APPROVED' && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900/50 shadow-sm">
          <CardContent className="flex items-center justify-between p-4 text-sm text-green-800 dark:text-green-300 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>This proposal was approved and the project scope has been initialized.</span>
            </div>
            {/* If project has been linked, show it. Currently project page is not yet implemented, but let's write a generic link */}
            <Link href={`/${workspaceSlug}/projects`}>
              <Button size="sm" variant="outline" className="border-green-200 hover:bg-green-100 text-green-800 dark:border-green-900/50 dark:text-green-300 dark:hover:bg-green-950">
                View Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {hasExpired && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/50 shadow-sm">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-amber-800 dark:text-amber-300 font-medium">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>This proposal has expired. Expiry date: {new Date(proposal.expiresAt).toLocaleDateString()}.</span>
          </CardContent>
        </Card>
      )}

      {/* Grid details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Proposal Document Main Sheet */}
        <Card className="md:col-span-2 shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider font-bold text-zinc-500 uppercase">
                {proposal.proposalNumber}
              </span>
              {getStatusBadge(proposal.status)}
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
              {proposal.title}
            </CardTitle>
            <CardDescription className="text-xs flex items-center gap-1.5 mt-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Expires {new Date(proposal.expiresAt).toLocaleDateString()}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Overview / Scope details */}
            {proposal.description && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Scope Overview</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {proposal.description}
                </p>
              </div>
            )}

            {/* Line items table */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pricing Items</h3>
              <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-xs font-semibold text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                      <th className="p-3">Item</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {proposal.items.map((item) => (
                      <tr key={item.id} className="align-top">
                        <td className="p-3">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground mt-0.5 max-w-sm">{item.description}</div>
                          )}
                        </td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">{currencyFormatter(Number(item.unitPrice))}</td>
                        <td className="p-3 text-right font-semibold">{currencyFormatter(Number(item.totalPrice))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client & Summary Column */}
        <div className="space-y-6 md:col-span-1">
          {/* Client Details Box */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold text-zinc-500 uppercase">Prepared For</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{proposal.client.companyName}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="truncate">{proposal.client.primaryEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>{proposal.client.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Totals Box */}
          <Card className="shadow-sm border-2 border-primary/5">
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 pb-3 border-b">
              <CardTitle className="text-sm font-bold text-zinc-500 uppercase">Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {currencyFormatter(Number(proposal.subtotal))}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Tax Amount</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {currencyFormatter(Number(proposal.taxAmount))}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed pt-2 font-bold text-zinc-900 dark:text-zinc-50 text-base">
                <span>Total Due</span>
                <span className="text-primary">{currencyFormatter(Number(proposal.totalAmount))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Proposal Status Actions */}
          {proposal.status !== 'APPROVED' && proposal.status !== 'REJECTED' && !hasExpired && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold text-zinc-500 uppercase">Status Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {proposal.status === 'DRAFT' && (
                  <Button 
                    onClick={handleSendProposal} 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isLoading ? 'Sending...' : 'Send Proposal'}</span>
                  </Button>
                )}

                {proposal.status === 'SENT' && (
                  <>
                    <Button 
                      onClick={handleApproveProposal} 
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{isLoading ? 'Approving...' : 'Approve Proposal'}</span>
                    </Button>
                    <Button 
                      onClick={handleRejectProposal} 
                      disabled={isLoading}
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-950/20 dark:text-red-400 dark:hover:bg-red-950/10"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject Proposal</span>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Project Limit Reached warning dialog (Free plan limit exceeded) */}
      <Dialog open={isLimitDialogOpen} onOpenChange={setIsLimitDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold">Project Limit Reached</DialogTitle>
            <DialogDescription className="mt-2 text-zinc-600 dark:text-zinc-400">
              You have reached the maximum number of active projects allowed on the Free plan. 
              Upgrade to Pro to approve this proposal and create a new project.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 w-full">
            <Button type="button" variant="outline" className="w-full" onClick={() => setIsLimitDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleMockUpgrade} className="w-full">
              Upgrade to Pro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
