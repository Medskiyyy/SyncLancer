'use client';

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
      toast.error(err instanceof Error ? err.message : 'An error occurred.');
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
      toast.error(err instanceof Error ? err.message : 'An error occurred.');
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
    <div className="max-w-[900px] w-full mx-auto flex flex-col md:flex-row gap-6">
      {/* Navigation tabs left */}
      <div className="w-full md:w-60 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        {tabList.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none"
                  : "text-zinc-550 hover:text-zinc-900 hover:bg-zinc-100/50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/50"
              )}
            >
              <TabIcon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main settings panel */}
      <div className="flex-1 min-w-0">
        {activeTab === 'general' && (
          <Card variant="elevated" className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-xl overflow-hidden shadow-xs">
            <CardHeader className="border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
              <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-heading">General Settings</CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Configure your workspace profile details</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-10 px-3 border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg text-sm text-zinc-800 dark:text-zinc-100 focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={updatingGeneral} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 h-9 rounded-lg shadow-sm">
                    {updatingGeneral ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
            {/* Current Plan Overview */}
            <Card variant="elevated" className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-xl shadow-xs overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-heading">Subscription Plan</h3>
                    <p className="text-xs text-zinc-550 dark:text-zinc-400">Manage plan levels and monitor resource utilization limits.</p>
                  </div>
                  {workspace.plan === 'PRO' ? (
                    <Badge className="px-3 py-1 bg-primary text-primary-foreground font-bold shadow-sm border-0 uppercase tracking-wider text-[10px] rounded-full">
                      PRO PLAN
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="px-3 py-1 text-zinc-700 bg-zinc-100 border-zinc-200 font-bold uppercase tracking-wider text-[10px] rounded-full dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                      FREE PLAN
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Free Plan Limits Tracker */}
            {workspace.plan === 'FREE' && (
              <Card variant="elevated" className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-xl shadow-xs overflow-hidden">
                <CardHeader className="border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
                  <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-heading">Free Plan Utilization</CardTitle>
                  <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Monitor usage limits before upgrading.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Projects Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-primary" />
                        <span>Active Projects</span>
                      </div>
                      <span>{usage.activeProjectsCount} / 3</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${projectsPercent >= 100 ? 'bg-red-500' : 'bg-primary'}`}
                        style={{ width: `${projectsPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Clients Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-500" />
                        <span>Clients Managed</span>
                      </div>
                      <span>{usage.clientsCount} / 5</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${clientsPercent >= 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${clientsPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Storage Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-primary" />
                        <span>Storage Allocation</span>
                      </div>
                      <span>{storageUsedMB} MB / {storageLimitMB} MB</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${storagePercent >= 100 ? 'bg-red-500' : 'bg-primary'}`}
                        style={{ width: `${storagePercent}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dynamic Plan Upgrades Selector */}
            <Card variant="elevated" className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-xl shadow-xs overflow-hidden">
              <CardHeader className="border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-heading">Plan Tier Control</CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Change workspace limits for projects, clients, and storage.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {workspace.plan === 'FREE' ? (
                  <div className="space-y-6">
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-primary font-heading">SyncLancer PRO</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Higher limits for freelancers managing more active work.</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 text-sm text-zinc-700 dark:text-zinc-300 font-semibold">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          <span>Unlimited projects</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          <span>Unlimited clients</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          <span>10GB storage limit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          <span>Multiple workspaces</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button 
                        onClick={() => handleTogglePlan('PRO')} 
                        disabled={updatingPlan}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full h-11 text-base shadow-sm rounded-lg"
                      >
                        {updatingPlan ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
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
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-2">
                      <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-heading">
                        <CheckCircle className="h-5 w-5" /> Active Subscription
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Your workspace is on the Pro plan. Project, client, and storage limits are expanded for this workspace.
                      </p>
                    </div>
                    <div>
                      <Button 
                        variant="destructive"
                        onClick={() => handleTogglePlan('FREE')} 
                        disabled={updatingPlan}
                        className="cursor-pointer w-full h-11 text-base font-semibold rounded-lg"
                      >
                        {updatingPlan ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
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
          <Card variant="elevated" className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-xl shadow-xs overflow-hidden">
            <CardHeader className="border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
              <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-heading">Notification Alerts</CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Manage workspace alerts and automated email settings.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked id="notify1" className="h-4 w-4 rounded border-zinc-300 text-primary accent-primary" />
                  <label htmlFor="notify1" className="font-semibold cursor-pointer">Email me when a proposal is signed</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked id="notify2" className="h-4 w-4 rounded border-zinc-300 text-primary accent-primary" />
                  <label htmlFor="notify2" className="font-semibold cursor-pointer">Email me when an invoice status changes</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="notify3" className="h-4 w-4 rounded border-zinc-300 text-primary accent-primary" />
                  <label htmlFor="notify3" className="font-semibold cursor-pointer">Receive marketing and newsletter updates</label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
