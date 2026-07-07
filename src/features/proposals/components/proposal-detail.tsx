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
  AlertTriangle,
  Building,
  Mail,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="text-[9px] font-bold px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-550/15" variant="secondary">
            Approved
          </Badge>
        );
      case 'SENT':
        return (
          <Badge className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-550/15" variant="secondary">
            Sent
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="text-[9px] font-bold px-1.5 py-0.5 bg-red-500/10 text-red-655 dark:text-red-400 border border-red-550/15" variant="secondary">
            Rejected
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/30" variant="secondary">
            Expired
          </Badge>
        );
      default:
        return (
          <Badge className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-505 border border-zinc-200/60 dark:border-zinc-850" variant="secondary">
            Draft
          </Badge>
        );
    }
  };

  const hasExpired = new Date() > new Date(proposal.expiresAt) && proposal.status !== 'APPROVED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-300">
      {/* Navigation & Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/60 dark:border-zinc-800/80 pb-5">
        <Link href={`/${workspaceSlug}/proposals`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Proposals</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {proposal.status === 'DRAFT' && (
            <Link href={`/${workspaceSlug}/proposals/${proposal.id}/edit`}>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 cursor-pointer text-xs h-9 font-semibold bg-white dark:bg-zinc-900">
                <Edit className="h-4 w-4 text-zinc-450" />
                <span>Edit Draft</span>
              </Button>
            </Link>
          )}
          <a 
            href={`/api/v1/proposals/${proposal.id}/pdf?workspaceId=${workspaceId}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 cursor-pointer text-xs h-9 font-semibold bg-white dark:bg-zinc-900">
              <Download className="h-4 w-4 text-zinc-450" />
              <span>Download PDF</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Main banner status alerts */}
      {proposal.status === 'APPROVED' && (
        <Card className="border-green-200/60 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900/50 shadow-xs rounded-xl overflow-hidden">
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 text-xs text-green-800 dark:text-green-300 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
              <span>This proposal was approved and the project scope has been initialized.</span>
            </div>
            <Link href={`/${workspaceSlug}/projects`}>
              <Button size="sm" className="cursor-pointer text-[10px] h-8 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg border-none shadow-xs">
                View Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {hasExpired && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/50 shadow-xs rounded-xl">
          <CardContent className="flex items-center gap-2 p-4 text-xs text-amber-800 dark:text-amber-300 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>This proposal has expired. Expiry date: {new Date(proposal.expiresAt).toLocaleDateString()}.</span>
          </CardContent>
        </Card>
      )}

      {/* Grid details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Proposal Document Main Sheet */}
        <Card className="md:col-span-2 shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 relative">
          {/* Subtle gold decoration dot */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 to-amber-600" />
          <CardHeader className="border-b border-zinc-150 dark:border-zinc-800 pb-6 pt-7">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono tracking-wider font-bold text-zinc-450 uppercase">
                {proposal.proposalNumber}
              </span>
              {getStatusBadge(proposal.status)}
            </div>
            <CardTitle className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-3.5">
              {proposal.title}
            </CardTitle>
            <CardDescription className="text-[10px] font-semibold flex items-center gap-1.5 mt-2 text-zinc-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>Expires {new Date(proposal.expiresAt).toLocaleDateString()}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Overview / Scope details */}
            {proposal.description && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Scope Overview</h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed font-medium">
                  {proposal.description}
                </p>
              </div>
            )}

            {/* Line items table */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pricing Items</h3>
              <div className="border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50/50 dark:bg-zinc-900/30 text-[9px] font-bold text-zinc-400 dark:text-zinc-505 border-b border-zinc-200/60 dark:border-zinc-800 uppercase tracking-wider">
                      <th className="px-4 py-2.5">Scope Description</th>
                      <th className="px-4 py-2.5 text-center">Qty</th>
                      <th className="px-4 py-2.5 text-right">Unit Rate</th>
                      <th className="px-4 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/80 bg-white dark:bg-zinc-900 font-medium">
                    {proposal.items.map((item) => (
                      <tr key={item.id} className="align-top">
                        <td className="px-4 py-3">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{item.name}</div>
                          {item.description && (
                            <div className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-1 max-w-sm leading-relaxed">{item.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-zinc-650 dark:text-zinc-400">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-650 dark:text-zinc-400">{currencyFormatter(Number(item.unitPrice))}</td>
                        <td className="px-4 py-3 text-right font-bold font-mono text-zinc-900 dark:text-zinc-50">{currencyFormatter(Number(item.totalPrice))}</td>
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
          <Card className="shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="pb-3 border-b border-zinc-150 dark:border-zinc-800">
              <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Prepared For</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{proposal.client.companyName}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="truncate">{proposal.client.primaryEmail}</span>
              </div>
              {proposal.client.phone && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span>{proposal.client.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Totals Box */}
          <Card className="shadow-xs border border-border rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/30 pb-3 border-b border-zinc-150 dark:border-zinc-800">
              <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  {currencyFormatter(Number(proposal.subtotal))}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Tax Amount</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  {currencyFormatter(Number(proposal.taxAmount))}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-zinc-200 dark:border-zinc-700/80 pt-3.5 font-bold text-zinc-900 dark:text-zinc-50 text-sm">
                <span>Total Amount</span>
                <span className="text-primary font-mono font-black">{currencyFormatter(Number(proposal.totalAmount))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Proposal Status Actions */}
          {proposal.status !== 'APPROVED' && proposal.status !== 'REJECTED' && !hasExpired && (
            <Card className="shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="pb-3 border-b border-zinc-150 dark:border-zinc-800">
                <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {proposal.status === 'DRAFT' && (
                  <Button 
                    onClick={handleSendProposal} 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-1.5 cursor-pointer text-xs h-9 font-semibold"
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
                      className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white cursor-pointer text-xs h-9 font-semibold"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{isLoading ? 'Approving...' : 'Approve Proposal'}</span>
                    </Button>
                    <Button 
                      onClick={handleRejectProposal} 
                      disabled={isLoading}
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-950/20 dark:text-red-400 dark:hover:bg-red-950/10 cursor-pointer text-xs h-9 font-semibold"
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
        <DialogContent className="max-w-md p-6 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-650 border border-red-500/15 mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">Project Limit Reached</DialogTitle>
            <DialogDescription className="mt-2 text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-semibold">
              You have reached the maximum number of active projects allowed on the Free plan. 
              Upgrade to Pro to approve this proposal and auto-spawn a new project.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 w-full">
            <Button type="button" variant="outline" className="w-full cursor-pointer text-xs h-9 font-semibold bg-white dark:bg-zinc-950" onClick={() => setIsLimitDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleMockUpgrade} className="w-full cursor-pointer text-xs h-9 font-semibold">
              Upgrade to Pro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
