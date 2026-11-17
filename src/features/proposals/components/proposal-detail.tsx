'use client';
import type { Serialized } from '@/lib/serialize';

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

// Serialized<>: the page converts Prisma Decimal money columns to numbers before
// this crosses the Server -> Client Component boundary.
type ExtendedProposal = Serialized<
  Proposal & { items: ProposalItem[]; client: Client; projects?: Project[] }
>;

interface ProposalDetailProps {
  proposal: ExtendedProposal;
  workspaceId: string;
  workspaceSlug: string;
}

export function ProposalDetail({ proposal: initialProposal, workspaceId, workspaceSlug }: ProposalDetailProps) {
  const router = useRouter();
  const [proposal, setProposal] = useState<ExtendedProposal>(initialProposal);
  const [syncedProposal, setSyncedProposal] = useState(initialProposal);
  if (initialProposal !== syncedProposal) {
    setSyncedProposal(initialProposal);
    setProposal(initialProposal);
  }
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
        setProposal(result.data);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to send proposal');
      }
    } catch {
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
        setProposal(result.data);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to reject proposal');
      }
    } catch {
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
        setProposal(result.data.proposal);
        router.refresh();
      } else if (result.code === 'LIMIT_EXCEEDED') {
        setIsLimitDialogOpen(true);
      } else {
        toast.error(result.error || 'Failed to approve proposal');
      }
    } catch {
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
          <Badge className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" variant="secondary">
            Approved
          </Badge>
        );
      case 'SENT':
        return (
          <Badge className="text-[11px] font-semibold px-2 py-0.5 bg-secondary text-foreground border border-border" variant="secondary">
            Sent
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="text-[11px] font-semibold px-2 py-0.5 bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20" variant="secondary">
            Rejected
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge className="text-[11px] font-semibold px-2 py-0.5 bg-muted text-muted-foreground border border-border" variant="secondary">
            Expired
          </Badge>
        );
      default:
        return (
          <Badge className="text-[11px] font-semibold px-2 py-0.5 bg-muted text-muted-foreground border border-border" variant="secondary">
            Draft
          </Badge>
        );
    }
  };

  const hasExpired = new Date() > new Date(proposal.expiresAt) && proposal.status !== 'APPROVED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation & Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <Link href={`/${workspaceSlug}/proposals`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Proposals</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {proposal.status === 'DRAFT' && (
            <Link href={`/${workspaceSlug}/proposals/${proposal.id}/edit`}>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 cursor-pointer text-xs h-9 font-semibold bg-background border-border">
                <Edit className="h-4 w-4 text-muted-foreground" />
                <span>Edit Draft</span>
              </Button>
            </Link>
          )}
          <a 
            href={`/api/v1/proposals/${proposal.id}/pdf?workspaceId=${workspaceId}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 cursor-pointer text-xs h-9 font-semibold bg-background border-border">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>Download PDF</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Main banner status alerts */}
      {proposal.status === 'APPROVED' && (
        <Card className="border-emerald-500/20 bg-emerald-500/10 rounded-lg overflow-hidden">
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>This proposal was approved and the project scope has been initialized.</span>
            </div>
            <Link href={`/${workspaceSlug}/projects`}>
              <Button size="sm" className="cursor-pointer text-xs h-8 bg-brand hover:bg-brand/90 text-brand-foreground font-semibold">
                View Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {hasExpired && (
        <Card className="border-amber-500/20 bg-amber-500/10 rounded-lg">
          <CardContent className="flex items-center gap-2 p-4 text-xs text-amber-800 dark:text-amber-300 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>This proposal has expired. Expiry date: {new Date(proposal.expiresAt).toLocaleDateString()}.</span>
          </CardContent>
        </Card>
      )}

      {/* Grid details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Proposal Document Main Sheet */}
        <Card className="md:col-span-2 border border-border rounded-lg overflow-hidden bg-card relative">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-brand" />
          <CardHeader className="border-b border-border pb-6 pt-7">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                {proposal.proposalNumber}
              </span>
              {getStatusBadge(proposal.status)}
            </div>
            <CardTitle className="font-heading text-xl font-bold text-foreground mt-3.5">
              {proposal.title}
            </CardTitle>
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 mt-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Expires {new Date(proposal.expiresAt).toLocaleDateString()}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Overview / Scope details */}
            {proposal.description && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Scope Overview</h3>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {proposal.description}
                </p>
              </div>
            )}

            {/* Line items table */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground">Pricing Items</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground border-b border-border">
                      <th className="px-4 py-2.5">Scope Description</th>
                      <th className="px-4 py-2.5 text-center">Qty</th>
                      <th className="px-4 py-2.5 text-right">Unit Rate</th>
                      <th className="px-4 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card font-medium">
                    {proposal.items.map((item) => (
                      <tr key={item.id} className="align-top">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground text-xs">{item.name}</div>
                          {item.description && (
                            <div className="text-[11px] text-muted-foreground mt-1 max-w-sm leading-relaxed">{item.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground font-mono tabular-nums">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">{currencyFormatter(Number(item.unitPrice))}</td>
                        <td className="px-4 py-3 text-right font-semibold font-mono tabular-nums text-foreground">{currencyFormatter(Number(item.totalPrice))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client & Summary Column */}
        <div className="space-y-6 md:col-span-1">
          {/* Client Details Box */}
          <Card className="border border-border rounded-lg overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Prepared For</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs font-medium">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-bold text-foreground">{proposal.client.companyName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{proposal.client.primaryEmail}</span>
              </div>
              {proposal.client.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{proposal.client.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Totals Box */}
          <Card className="border border-border rounded-lg overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 pb-3 border-b border-border">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 text-xs font-medium">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground font-mono tabular-nums">
                  {currencyFormatter(Number(proposal.subtotal))}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax Amount</span>
                <span className="font-semibold text-foreground font-mono tabular-nums">
                  {currencyFormatter(Number(proposal.taxAmount))}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-border pt-3.5 font-bold text-foreground text-sm">
                <span>Total Amount</span>
                <span className="text-foreground font-mono tabular-nums font-bold">{currencyFormatter(Number(proposal.totalAmount))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Proposal Status Actions */}
          {proposal.status !== 'APPROVED' && proposal.status !== 'REJECTED' && !hasExpired && (
            <Card className="border border-border rounded-lg overflow-hidden bg-card">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Status Actions</CardTitle>
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
                      className="w-full flex items-center justify-center gap-1.5 bg-brand hover:bg-brand/90 text-brand-foreground cursor-pointer text-xs h-9 font-semibold"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{isLoading ? 'Approving...' : 'Approve Proposal'}</span>
                    </Button>
                    <Button 
                      onClick={handleRejectProposal} 
                      disabled={isLoading}
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-1.5 text-red-600 border-red-500/20 hover:bg-red-500/10 dark:text-red-400 cursor-pointer text-xs h-9 font-semibold"
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
        <DialogContent className="sm:max-w-md p-6 bg-card border border-border rounded-lg">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="font-heading text-base font-bold text-foreground">Project Limit Reached</DialogTitle>
            <DialogDescription className="mt-2 text-muted-foreground text-xs leading-relaxed">
              You have reached the maximum number of active projects allowed on the Free plan. 
              Upgrade to Pro to approve this proposal and auto-spawn a new project.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 w-full">
            <Button type="button" variant="outline" className="w-full cursor-pointer text-xs h-9 font-semibold bg-background border-border" onClick={() => setIsLimitDialogOpen(false)}>
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
