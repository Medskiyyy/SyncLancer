'use client';

import React, { useState, useEffect } from 'react';
import { Proposal, Client } from '@prisma/client';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { deleteProposalAction } from '../actions/proposal-actions';

interface ExtendedProposal extends Proposal {
  client: Client;
}

interface ProposalListProps {
  initialProposals: ExtendedProposal[];
  workspaceId: string;
  workspaceSlug: string;
}

export function ProposalList({ initialProposals, workspaceId, workspaceSlug }: ProposalListProps) {
  const [proposals, setProposals] = useState<ExtendedProposal[]>(initialProposals);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setProposals(initialProposals);
  }, [initialProposals]);

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
    } catch (err) {
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Proposals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create professional quotations, manage pricing sheets, and review client approvals.
          </p>
        </div>
        <Link href={`/${workspaceSlug}/proposals/new`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Proposal</span>
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 bg-zinc-100 p-1 rounded-lg dark:bg-zinc-800 self-start">
          {['all', 'DRAFT', 'SENT', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors uppercase ${
                statusFilter === status
                  ? 'bg-white shadow-sm text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Grid Table */}
      {filteredProposals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {searchQuery || statusFilter !== 'all' ? 'No proposals found' : 'No proposals yet'}
          </CardTitle>
          <CardDescription className="max-w-sm mt-2 text-zinc-500 dark:text-zinc-400">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Create a proposal draft to estimate services and outline contracts for clients.'}
          </CardDescription>
          {!searchQuery && statusFilter === 'all' && (
            <Link href={`/${workspaceSlug}/proposals/new`} className="mt-4">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Create Proposal</span>
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                  <th className="p-4">Number</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Expires</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredProposals.map((proposal) => {
                  const formattedTotal = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: proposal.currency || 'USD',
                  }).format(Number(proposal.totalAmount));

                  return (
                    <tr key={proposal.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="p-4 font-mono text-xs">{proposal.proposalNumber}</td>
                      <td className="p-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {proposal.client.companyName}
                      </td>
                      <td className="p-4 truncate max-w-[180px]">{proposal.title}</td>
                      <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-50">{formattedTotal}</td>
                      <td className="p-4 text-zinc-500 dark:text-zinc-400">
                        {new Date(proposal.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">{getStatusBadge(proposal.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/${workspaceSlug}/proposals/${proposal.id}`}>
                            <Button variant="ghost" size="icon" title="View Detail" className="h-8 w-8 text-zinc-500 hover:text-zinc-900">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {proposal.status === 'DRAFT' && (
                            <Link href={`/${workspaceSlug}/proposals/${proposal.id}/edit`}>
                              <Button variant="ghost" size="icon" title="Edit Draft" className="h-8 w-8 text-zinc-500 hover:text-zinc-900">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          
                          <a 
                            href={`/api/v1/proposals/${proposal.id}/pdf?workspaceId=${workspaceId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="icon" title="Download PDF" className="h-8 w-8 text-zinc-500 hover:text-zinc-900">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                          
                          {proposal.status === 'DRAFT' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Delete Draft" 
                              onClick={() => handleDeleteProposal(proposal.id)}
                              className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-4 w-4" />
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
