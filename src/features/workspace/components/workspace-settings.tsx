'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { updateWorkspaceAction, updateWorkspacePlanAction } from '../actions/workspace-actions';
import { cn } from '@/lib/utils';
import { Settings, Shield, HardDrive, FolderKanban, Users, CheckCircle, Loader2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'general' | 'billing'>('general');
  
  // General form state
  const [name, setName] = useState(workspace.name);
  const [logoUrl, setLogoUrl] = useState(workspace.logoUrl || '');
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
        logoUrl: logoUrl.trim() || null,
      });

      if (result.success) {
        toast.success('Workspace updated successfully.');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update workspace.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
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
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
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

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Navigation tabs left */}
      <div className="w-full md:w-60 shrink-0 flex flex-row md:flex-col gap-1">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-lg transition-colors w-full ${
            activeTab === 'general'
              ? 'bg-zinc-150 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
              : 'text-zinc-550 dark:text-zinc-450 hover:bg-zinc-50 dark:hover:bg-zinc-850'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>General Settings</span>
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-lg transition-colors w-full ${
            activeTab === 'billing'
              ? 'bg-zinc-150 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
              : 'text-zinc-550 dark:text-zinc-450 hover:bg-zinc-50 dark:hover:bg-zinc-850'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Plan & Limits</span>
        </button>
      </div>

      {/* Main settings panel */}
      <div className="flex-1 max-w-3xl">
        {activeTab === 'general' && (
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
              <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">General Settings</CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Configure your workspace profile details</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-10 px-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-lg text-sm text-zinc-800 dark:text-zinc-150 focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full h-10 px-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-lg text-sm text-zinc-800 dark:text-zinc-150 focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={updatingGeneral} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
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
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Subscription Plan</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Manage plan levels and monitor resource utilization limits.</p>
                  </div>
                  {workspace.plan === 'PRO' ? (
                    <Badge className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-extrabold shadow-md border-0 uppercase tracking-widest text-[10px]">
                      PRO UNLOCKED
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="px-3 py-1 text-zinc-700 bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-350 dark:border-zinc-700 font-extrabold uppercase tracking-widest text-[10px]">
                      FREE PLAN
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Free Plan Limits Tracker */}
            {workspace.plan === 'FREE' && (
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
                  <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">Free Plan Utilization</CardTitle>
                  <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Monitor usage limits before upgrading.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Projects Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-amber-550" />
                        <span>Active Projects</span>
                      </div>
                      <span>{usage.activeProjectsCount} / 3</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${projectsPercent >= 100 ? 'bg-red-500 animate-pulse' : 'bg-amber-600'}`}
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
                    <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${clientsPercent >= 100 ? 'bg-red-500 animate-pulse' : 'bg-emerald-600'}`}
                        style={{ width: `${clientsPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Storage Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-amber-500" />
                        <span>Storage Allocation</span>
                      </div>
                      <span>{storageUsedMB} MB / {storageLimitMB} MB</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${storagePercent >= 100 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}
                        style={{ width: `${storagePercent}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dynamic Plan Upgrades Selector */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-4">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">Plan Tier Control</CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Unlock absolute capability and features.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {workspace.plan === 'FREE' ? (
                  <div className="space-y-6">
                    <div className="rounded-xl border border-amber-500/15 dark:border-amber-950/20 bg-amber-500/5 dark:bg-amber-950/5 p-6 space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-amber-600 dark:text-indigo-400">SyncLancer PRO</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-450">Everything a professional freelancer needs to scale billing.</p>
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
                        className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold w-full h-11 text-base shadow-lg shadow-amber-550/10"
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
                    <div className="rounded-xl border border-emerald-100 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/10 p-6 space-y-2">
                      <h4 className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" /> Active Subscription
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-450">
                        Thank you! Your workspace limits have been completely lifted. You are ready to scale without borders.
                      </p>
                    </div>
                    <div>
                      <Button 
                        variant="destructive"
                        onClick={() => handleTogglePlan('FREE')} 
                        disabled={updatingPlan}
                        className="cursor-pointer w-full h-11 text-base font-extrabold"
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
      </div>
    </div>
  );
}
