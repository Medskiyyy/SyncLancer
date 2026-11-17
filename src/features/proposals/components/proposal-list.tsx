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
          <Badge className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-600/20" variant="secondary">
            Approved
          </Badge>
        );
      case 'SENT':
        return (
          <Badge className="text-[11px] font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-600/20" variant="secondary">
            Sent
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="text-[11px] font-semibold px-2 py-0.5 bg-red-500/10 text-red-700 dark:text-red-400 border border-red-600/20" variant="secondary">
            Rejected
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge className="text-[11px] font-semibold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/40" variant="secondary">
            Expired
          </Badge>
        );
      default:
        return (
          <Badge className="text-[11px] font-semibold px-2 py-0.5 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800" variant="secondary">
            Draft
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Proposals</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Create professional quotations, manage pricing sheets, and review client approvals.
          </p>
        </div>
        <Link href={`/${workspaceSlug}/proposals/new`}>
          <Button className="cursor-pointer font-semibold text-xs h-9">
            <Plus className="mr-1.5 h-4 w-4" /> Create Proposal
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 self-start overflow-x-auto max-w-full">
          {['all', 'DRAFT', 'SENT', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap",
                statusFilter === status
                  ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-slate-500" />
          <Input
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-900 text-xs h-9 rounded-lg"
          />
        </div>
      </div>

      {/* Grid Table */}
      {filteredProposals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-border">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4 border border-border">
            <FileText className="h-6 w-6" />
          </div>
          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            {searchQuery || statusFilter !== 'all' ? 'No proposals found' : 'No proposals yet'}
          </CardTitle>
          <CardDescription className="max-w-sm mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Create a proposal draft to estimate services and outline contracts for clients.'}
          </CardDescription>
          {!searchQuery && statusFilter === 'all' && (
            <Link href={`/${workspaceSlug}/proposals/new`} className="mt-4">
              <Button className="cursor-pointer font-semibold text-xs h-9">
                <Plus className="mr-1.5 h-4 w-4" />
                <span>Create Proposal</span>
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40">
                    <th className="px-5 py-3">Number</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Proposal Title</th>
                    <th className="px-5 py-3">Total Amount</th>
                    <th className="px-5 py-3">Expires</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
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
                      <tr key={proposal.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-muted-foreground">{proposal.proposalNumber}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary font-bold border border-primary/20 text-[11px]">
                              {proposal.client.companyName.substring(0, 2).toUpperCase()}
                            </div>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {proposal.client.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-700 dark:text-zinc-300 truncate max-w-[180px]">{proposal.title}</td>
                      <td className="px-5 py-3.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">{formattedTotal}</td>
                      <td className="px-5 py-3.5 text-zinc-400 dark:text-zinc-500 font-medium">
                        {new Date(proposal.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">{getStatusBadge(proposal.status)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/${workspaceSlug}/proposals/${proposal.id}`}>
                            <Button variant="ghost" size="icon" title="View Detail" className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          
                          {proposal.status === 'DRAFT' && (
                            <Link href={`/${workspaceSlug}/proposals/${proposal.id}/edit`}>
                              <Button variant="ghost" size="icon" title="Edit Draft" className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          )}
                          
                          <a 
                            href={`/api/v1/proposals/${proposal.id}/pdf?workspaceId=${workspaceId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="icon" title="Download PDF" className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                          
                          {proposal.status === 'DRAFT' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Delete Draft" 
                              onClick={() => handleDeleteProposal(proposal.id)}
                              className="h-7 w-7 text-zinc-400 hover:bg-destructive/5 hover:text-destructive cursor-pointer"
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
