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
  Shield, 
  HardDrive, 
  FolderKanban, 
  Users, 
  CheckCircle, 
  Loader2,
  Lock,
  Bell,
  CreditCard,
  Sparkles,
  Layers
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
  const [activeTab, setActiveTab] = useState<'general' | 'workspace' | 'branding' | 'billing' | 'notifications' | 'security'>('general');
  
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

  const tabList = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'workspace', label: 'Workspace', icon: Layers },
    { id: 'branding', label: 'Branding', icon: Sparkles },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ] as const;

  return (
    <div className="max-w-[900px] w-full mx-auto flex flex-col md:flex-row gap-6">
      {/* Navigation tabs left */}
      <div className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        {tabList.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer",
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <TabIcon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main settings panel */}
      <div className="flex-1 min-w-0">
        {activeTab === 'general' && (
          <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">General Settings</CardTitle>
              <CardDescription className="text-xs text-slate-500">Configure your workspace profile details</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-800 focus:border-blue-600 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-505 uppercase tracking-wider">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-850 focus:border-blue-600 outline-none transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={updatingGeneral} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
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

        {activeTab === 'workspace' && (
          <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Workspace Portal</CardTitle>
              <CardDescription className="text-xs text-slate-500">Configure workspace directory slug and URL keys.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workspace Slug</label>
                <div className="flex gap-2">
                  <span className="flex items-center h-10 px-3 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 text-sm select-none">
                    synclancer.com/
                  </span>
                  <input
                    type="text"
                    disabled
                    value={workspace.slug}
                    className="flex-1 h-10 px-3 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500 outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Slugs are used for team workspace portals and cannot be changed here.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'branding' && (
          <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Branding & Style</CardTitle>
              <CardDescription className="text-xs text-slate-500">Customize client portal themes and company palettes.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Theme Color</label>
                <div className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-600 border border-slate-200 cursor-pointer ring-2 ring-blue-500/10" />
                  <div className="h-9 w-9 rounded-full bg-indigo-600 border border-slate-200 cursor-pointer" />
                  <div className="h-9 w-9 rounded-full bg-emerald-600 border border-slate-200 cursor-pointer" />
                  <div className="h-9 w-9 rounded-full bg-slate-900 border border-slate-200 cursor-pointer" />
                </div>
              </div>
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custom CSS / Font Variable</label>
                <input
                  type="text"
                  placeholder="Inter, sans-serif"
                  disabled
                  className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Current Plan Overview */}
            <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900">Subscription Plan</h3>
                    <p className="text-xs text-slate-555">Manage plan levels and monitor resource utilization limits.</p>
                  </div>
                  {workspace.plan === 'PRO' ? (
                    <Badge className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-xs border-0 uppercase tracking-wider text-[10px]">
                      PRO UNLOCKED
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="px-3 py-1 text-slate-700 bg-slate-100 border-slate-205 font-bold uppercase tracking-wider text-[10px]">
                      FREE PLAN
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Free Plan Limits Tracker */}
            {workspace.plan === 'FREE' && (
              <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-base font-bold text-slate-900">Free Plan Utilization</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Monitor usage limits before upgrading.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Projects Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-blue-600" />
                        <span>Active Projects</span>
                      </div>
                      <span>{usage.activeProjectsCount} / 3</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${projectsPercent >= 100 ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${projectsPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Clients Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-555" />
                        <span>Clients Managed</span>
                      </div>
                      <span>{usage.clientsCount} / 5</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${clientsPercent >= 100 ? 'bg-red-500' : 'bg-emerald-600'}`}
                        style={{ width: `${clientsPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Storage Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-blue-600" />
                        <span>Storage Allocation</span>
                      </div>
                      <span>{storageUsedMB} MB / {storageLimitMB} MB</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${storagePercent >= 100 ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${storagePercent}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dynamic Plan Upgrades Selector */}
            <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-bold text-slate-900">Plan Tier Control</CardTitle>
                <CardDescription className="text-xs text-slate-500">Unlock absolute capability and features.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {workspace.plan === 'FREE' ? (
                  <div className="space-y-6">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/20 p-6 space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-blue-755">SyncLancer PRO</h4>
                        <p className="text-xs text-slate-500">Everything a professional freelancer needs to scale billing.</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-700 font-semibold">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>Unlimited projects</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>Unlimited clients</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>10GB storage limit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>Multiple workspaces</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button 
                        onClick={() => handleTogglePlan('PRO')} 
                        disabled={updatingPlan}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full h-11 text-base shadow-sm"
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
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-6 space-y-2">
                      <h4 className="text-base font-bold text-emerald-700 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" /> Active Subscription
                      </h4>
                      <p className="text-xs text-slate-500">
                        Thank you! Your workspace limits have been completely lifted. You are ready to scale without borders.
                      </p>
                    </div>
                    <div>
                      <Button 
                        variant="destructive"
                        onClick={() => handleTogglePlan('FREE')} 
                        disabled={updatingPlan}
                        className="cursor-pointer w-full h-11 text-base font-semibold"
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
          <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Notification Alerts</CardTitle>
              <CardDescription className="text-xs text-slate-500">Manage workspace alerts and automated email settings.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked id="notify1" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                  <label htmlFor="notify1" className="font-semibold cursor-pointer">Email me when a proposal is signed</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked id="notify2" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                  <label htmlFor="notify2" className="font-semibold cursor-pointer">Email me when an invoice status changes</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="notify3" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                  <label htmlFor="notify3" className="font-semibold cursor-pointer">Receive marketing and newsletter updates</label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Security & Credentials</CardTitle>
              <CardDescription className="text-xs text-slate-500">Manage authorization keys and client API tokens.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workspace Secret Token</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value="••••••••••••••••••••••••••••••••"
                    disabled
                    className="flex-1 h-10 px-3 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500"
                  />
                  <Button variant="outline" className="h-10 text-xs font-medium border-slate-200">Reveal Key</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
