'use client';

import React, { useState } from 'react';
import type { Serialized } from '@/lib/serialize';
import { Proposal, Client } from '@prisma/client';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { deleteProposalAction } from '../actions/proposal-actions';
import { cn } from '@/lib/utils';

// Serialized<> because the page converts Prisma Decimal (subtotal, taxAmount,
// totalAmount) to number before this crosses the Server -> Client boundary.
type ExtendedProposal = Serialized<Proposal & { client: Client }>;

interface ProposalListProps {
  initialProposals: ExtendedProposal[];
  workspaceId: string;
  workspaceSlug: string;
}

export function ProposalList({ initialProposals, workspaceId, workspaceSlug }: ProposalListProps) {
  const [proposals, setProposals] = useState<ExtendedProposal[]>(initialProposals);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Re-sync when the server sends a fresh list (router.refresh()). Done during
  // render rather than in an effect so there is no extra commit with stale rows.
  const [syncedProposals, setSyncedProposals] = useState(initialProposals);
  if (initialProposals !== syncedProposals) {
    setSyncedProposals(initialProposals);
    setProposals(initialProposals);
  }

  const handleDeleteProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to delete this proposal? This action is irreversible.')) return;
    try {
      const result = await deleteProposalAction(proposalId, workspaceId);
      if (result.success) {
        toast.success('Proposal deleted successfully');
        setProposals(prev => prev.filter(p => p.id !== proposalId));
      } else {
        toast.error(result.error || 'Failed to delete proposal');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.proposalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.client.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400" variant="secondary">
            Approved
          </Badge>
        );
      case 'SENT':
        return (
          <Badge className="border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground" variant="secondary">
            Sent
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:text-red-400" variant="secondary">
            Rejected
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge className="border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground" variant="secondary">
            Expired
          </Badge>
        );
      default:
        return (
          <Badge className="border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground" variant="secondary">
            Draft
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Proposals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create professional quotations, manage pricing sheets, and review client approvals.
          </p>
        </div>
        <Link href={`/${workspaceSlug}/proposals/new`}>
          <Button>
            <Plus className="mr-1.5 h-4 w-4" /> Create Proposal
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-full self-start overflow-x-auto rounded-md border border-border bg-secondary p-1">
          {['all', 'DRAFT', 'SENT', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'whitespace-nowrap rounded-[4px] px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                statusFilter === status
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>

      {filteredProposals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed border-border bg-secondary/40 p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
            <FileText className="h-6 w-6 text-brand" strokeWidth={1.75} />
          </div>
          <CardTitle className="font-heading text-base font-bold text-foreground">
            {searchQuery || statusFilter !== 'all' ? 'No proposals found' : 'No proposals yet'}
          </CardTitle>
          <CardDescription className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Create a proposal draft to estimate services and outline contracts for clients.'}
          </CardDescription>
          {!searchQuery && statusFilter === 'all' && (
            <Link href={`/${workspaceSlug}/proposals/new`} className="mt-4">
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                <span>Create Proposal</span>
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="h-11 border-b border-border bg-secondary/50 text-xs font-medium text-muted-foreground">
                  <th className="px-5">Number</th>
                  <th className="px-5">Client</th>
                  <th className="px-5">Proposal Title</th>
                  <th className="px-5">Total Amount</th>
                  <th className="px-5">Expires</th>
                  <th className="px-5">Status</th>
                  <th className="px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredProposals.map((proposal) => {
                  const formattedTotal = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: proposal.currency || 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(Number(proposal.totalAmount));

                  return (
                    <tr key={proposal.id} className="h-[58px] transition-colors hover:bg-secondary/40">
                      <td className="px-5 font-mono text-xs font-semibold text-muted-foreground">{proposal.proposalNumber}</td>
                      <td className="px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] bg-foreground font-heading text-[11px] font-bold text-background">
                            {proposal.client.companyName.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-foreground">
                            {proposal.client.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-[180px] truncate px-5 font-medium text-foreground">{proposal.title}</td>
                      <td className="px-5 font-mono font-semibold tabular-nums text-foreground">{formattedTotal}</td>
                      <td className="px-5 text-muted-foreground">
                        {new Date(proposal.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-5">{getStatusBadge(proposal.status)}</td>
                      <td className="px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/${workspaceSlug}/proposals/${proposal.id}`}>
                            <Button variant="ghost" size="icon" title="View Detail" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          {proposal.status === 'DRAFT' && (
                            <Link href={`/${workspaceSlug}/proposals/${proposal.id}/edit`}>
                              <Button variant="ghost" size="icon" title="Edit Draft" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          )}

                          <a
                            href={`/api/v1/proposals/${proposal.id}/pdf?workspaceId=${workspaceId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="icon" title="Download PDF" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </a>

                          {proposal.status === 'DRAFT' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete Draft"
                              onClick={() => handleDeleteProposal(proposal.id)}
                              className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
