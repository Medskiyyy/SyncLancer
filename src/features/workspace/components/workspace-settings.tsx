'use client';

import { getErrorMessage } from '@/lib/errors';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { updateWorkspaceAction, updateWorkspacePlanAction } from '../actions/workspace-actions';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  HardDrive, 
  FolderKanban, 
  Users, 
  CheckCircle, 
  Loader2,
  Bell,
  CreditCard
} from 'lucide-react';

interface WorkspaceSettingsProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    plan: 'FREE' | 'PRO';
  };
  usage: {
    activeProjectsCount: number;
    clientsCount: number;
    storageUsedBytes: number;
  };
}

export function WorkspaceSettings({ workspace, usage }: WorkspaceSettingsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'notifications'>('general');
  
  // General form state
  const [name, setName] = useState(workspace.name);
  const [updatingGeneral, setUpdatingGeneral] = useState(false);

  // Plan transition state
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) {
      toast.error('Workspace name must be at least 2 characters.');
      return;
    }

    setUpdatingGeneral(true);
    try {
      const result = await updateWorkspaceAction(workspace.id, {
        name: name.trim(),
        logoUrl: workspace.logoUrl, // preserve original logo URL if any
      });

      if (result.success) {
        toast.success('Workspace name updated successfully.');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update workspace.');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? getErrorMessage(err) : 'An error occurred.');
    } finally {
      setUpdatingGeneral(false);
    }
  };

  const handleTogglePlan = async (targetPlan: 'FREE' | 'PRO') => {
    setUpdatingPlan(true);
    try {
      const result = await updateWorkspacePlanAction(workspace.id, targetPlan);
      if (result.success) {
        toast.success(`Plan updated to ${targetPlan} successfully!`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to change plan.');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? getErrorMessage(err) : 'An error occurred.');
    } finally {
      setUpdatingPlan(false);
    }
  };

  // Convert storage to MB
  const storageUsedMB = Math.round((usage.storageUsedBytes / (1024 * 1024)) * 10) / 10;
  const storageLimitMB = 1024; // 1GB
  const storagePercent = Math.min((storageUsedMB / storageLimitMB) * 100, 100);

  const projectsPercent = Math.min((usage.activeProjectsCount / 3) * 100, 100);
  const clientsPercent = Math.min((usage.clientsCount / 5) * 100, 100);

  const tabList = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'billing', label: 'Billing & Subscriptions', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6 md:flex-row">
      <div className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto pb-2 scrollbar-none md:w-60 md:flex-col md:pb-0">
        {tabList.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2.5 whitespace-nowrap rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                isActive
                  ? 'border-l-2 border-brand rounded-l-none bg-secondary font-semibold text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              )}
            >
              <TabIcon className={cn('h-4 w-4 shrink-0', isActive ? 'text-brand' : 'text-muted-foreground')} strokeWidth={1.75} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-w-0 flex-1">
        {activeTab === 'general' && (
          <Card className="overflow-hidden border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-heading text-lg font-bold text-foreground">General Settings</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Configure your workspace profile details</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={updatingGeneral}>
                    {updatingGeneral ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <Card className="overflow-hidden border-border bg-card">
              <CardContent className="p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <h3 className="font-heading text-lg font-bold text-foreground">Subscription Plan</h3>
                    <p className="text-xs text-muted-foreground">Manage plan levels and monitor resource utilization limits.</p>
                  </div>
                  {workspace.plan === 'PRO' ? (
                    <Badge className="rounded-[5px] bg-foreground px-3 py-1 text-[11px] font-semibold text-background">
                      Pro plan
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="rounded-[5px] border border-border bg-secondary px-3 py-1 text-[11px] font-semibold text-foreground">
                      Free plan
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {workspace.plan === 'FREE' && (
              <Card className="overflow-hidden border-border bg-card">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="font-heading text-base font-bold text-foreground">Free Plan Utilization</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Monitor usage limits before upgrading.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        <span>Active Projects</span>
                      </div>
                      <span className="font-mono text-xs font-semibold tabular-nums">{usage.activeProjectsCount} / 3</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${projectsPercent >= 100 ? 'bg-destructive' : 'bg-brand'}`}
                        style={{ width: `${projectsPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Clients Managed</span>
                      </div>
                      <span className="font-mono text-xs font-semibold tabular-nums">{usage.clientsCount} / 5</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${clientsPercent >= 100 ? 'bg-destructive' : 'bg-brand'}`}
                        style={{ width: `${clientsPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span>Storage Allocation</span>
                      </div>
                      <span className="font-mono text-xs font-semibold tabular-nums">{storageUsedMB} MB / {storageLimitMB} MB</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${storagePercent >= 100 ? 'bg-destructive' : 'bg-brand'}`}
                        style={{ width: `${storagePercent}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="overflow-hidden border-border bg-card">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-heading text-base font-bold text-foreground">Plan Tier Control</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Change workspace limits for projects, clients, and storage.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {workspace.plan === 'FREE' ? (
                  <div className="space-y-6">
                    <div className="space-y-4 rounded-lg border border-border bg-secondary/50 p-6">
                      <div className="space-y-1">
                        <h4 className="font-heading text-lg font-bold text-foreground">SyncLancer Pro</h4>
                        <p className="text-xs text-muted-foreground">Higher limits for freelancers managing more active work.</p>
                      </div>
                      <div className="grid gap-2 text-sm font-medium text-foreground sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 shrink-0 text-brand" />
                          <span>Unlimited projects</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 shrink-0 text-brand" />
                          <span>Unlimited clients</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 shrink-0 text-brand" />
                          <span>10GB storage limit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 shrink-0 text-brand" />
                          <span>Multiple workspaces</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        onClick={() => handleTogglePlan('PRO')}
                        disabled={updatingPlan}
                        className="h-10 w-full font-semibold"
                      >
                        {updatingPlan ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Upgrading Workspace...
                          </>
                        ) : (
                          'Upgrade to Pro ($19 / month)'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-6">
                      <h4 className="flex items-center gap-2 font-heading text-base font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle className="h-5 w-5" /> Active Subscription
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Your workspace is on the Pro plan. Project, client, and storage limits are expanded for this workspace.
                      </p>
                    </div>
                    <div>
                      <Button
                        variant="destructive"
                        onClick={() => handleTogglePlan('FREE')}
                        disabled={updatingPlan}
                        className="h-10 w-full font-semibold"
                      >
                        {updatingPlan ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Downgrading...
                          </>
                        ) : (
                          'Cancel Plan (Downgrade to Free)'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <Card className="overflow-hidden border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-heading text-lg font-bold text-foreground">Notification Alerts</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Manage workspace alerts and automated email settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-3 text-sm text-foreground">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked id="notify1" className="h-4 w-4 rounded border-input accent-primary" />
                  <label htmlFor="notify1" className="font-medium cursor-pointer">Email me when a proposal is signed</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked id="notify2" className="h-4 w-4 rounded border-input accent-primary" />
                  <label htmlFor="notify2" className="font-medium cursor-pointer">Email me when an invoice status changes</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="notify3" className="h-4 w-4 rounded border-input accent-primary" />
                  <label htmlFor="notify3" className="font-medium cursor-pointer">Receive marketing and newsletter updates</label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
