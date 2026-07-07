'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TimeEntry, Task } from '@prisma/client';
import { 
  Play, 
  Square, 
  Trash2, 
  Edit, 
  Plus, 
  Clock, 
  DollarSign, 
  FileText, 
  Calendar,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  createTimeEntryAction, 
  updateTimeEntryAction, 
  deleteTimeEntryAction 
} from '../actions/time-entry-actions';

interface ExtendedTimeEntry extends TimeEntry {
  task?: Task | null;
}

interface TimeTrackerProps {
  project: {
    id: string;
    name: string;
    workspaceId: string;
    budget: number | string | { toString(): string };
    currency: string;
    tasks?: Task[];
  };
  initialTimeEntries: ExtendedTimeEntry[];
  workspaceSlug: string;
}

interface ActiveTimer {
  workspaceId: string;
  projectId: string;
  projectName: string;
  taskId: string | null;
  startTime: string;
  notes: string;
  billable: boolean;
}

const getErrorMessage = (error: unknown, fallback = 'An error occurred') => {
  return error instanceof Error ? error.message : fallback;
};

export function TimeTracker({ project, initialTimeEntries }: TimeTrackerProps) {
  const router = useRouter();
  const [timeEntries] = useState<ExtendedTimeEntry[]>(initialTimeEntries);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [otherTimerRunning, setOtherTimerRunning] = useState<{ projectName: string; projectId: string } | null>(null);
  
  // Timer ticking state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const tickingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form states for starting active timer
  const [timerTaskId, setTimerTaskId] = useState<string>('none');
  const [timerNotes, setTimerNotes] = useState<string>('');
  const [timerBillable, setTimerBillable] = useState<boolean>(true);

  // Manual entry modal state
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('09:00');
  const [manualEndTime, setManualEndTime] = useState('10:00');
  const [manualTaskId, setManualTaskId] = useState<string>('none');
  const [manualNotes, setManualNotes] = useState('');
  const [manualBillable, setManualBillable] = useState(true);

  // Edit modal state
  const [selectedEntry, setSelectedEntry] = useState<ExtendedTimeEntry | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editTaskId, setEditTaskId] = useState('none');
  const [editNotes, setEditNotes] = useState('');
  const [editBillable, setEditBillable] = useState(true);

  // Delete modal state
  const [entryToDelete, setEntryToDelete] = useState<ExtendedTimeEntry | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const timerStorageKey = `@synclancer/active-timer-${project.workspaceId}`;

  // Load active timer from localStorage
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const stored = localStorage.getItem(timerStorageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ActiveTimer;
          if (parsed.projectId === project.id) {
            setActiveTimer(parsed);
            const start = new Date(parsed.startTime).getTime();
            setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
          } else {
            setOtherTimerRunning({
              projectName: parsed.projectName,
              projectId: parsed.projectId,
            });
          }
        } catch (e) {
          console.error('Failed to parse active timer', e);
        }
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [project.id, timerStorageKey]);

  // Handle active timer ticking
  useEffect(() => {
    if (activeTimer) {
      tickingIntervalRef.current = setInterval(() => {
        const start = new Date(activeTimer.startTime).getTime();
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
      }, 1000);
    } else if (tickingIntervalRef.current) {
      clearInterval(tickingIntervalRef.current);
      tickingIntervalRef.current = null;
    }

    return () => {
      if (tickingIntervalRef.current) {
        clearInterval(tickingIntervalRef.current);
      }
    };
  }, [activeTimer]);

  const handleStartTimer = () => {
    if (otherTimerRunning) {
      toast.error(`A timer is already running in this workspace for project: ${otherTimerRunning.projectName}`);
      return;
    }

    const newTimer: ActiveTimer = {
      workspaceId: project.workspaceId,
      projectId: project.id,
      projectName: project.name,
      taskId: timerTaskId === 'none' ? null : timerTaskId,
      startTime: new Date().toISOString(),
      notes: timerNotes,
      billable: timerBillable,
    };

    localStorage.setItem(timerStorageKey, JSON.stringify(newTimer));
    setActiveTimer(newTimer);
    setElapsedSeconds(0);
    toast.success('Timer started');
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;

    setIsLoading(true);
    try {
      const endTime = new Date();
      const startTime = new Date(activeTimer.startTime);
      const diffMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.max(1, Math.round(diffMs / 60000));

      const res = await createTimeEntryAction(project.workspaceId, {
        projectId: project.id,
        taskId: activeTimer.taskId,
        startTime,
        endTime,
        durationMinutes,
        billable: activeTimer.billable,
        notes: activeTimer.notes || 'Timer log',
      });

      if (res.success) {
        toast.success('Time entry logged successfully');
        localStorage.removeItem(timerStorageKey);
        setActiveTimer(null);
        setElapsedSeconds(0);
        setTimerNotes('');
        setTimerTaskId('none');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to save time entry');
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardTimer = () => {
    if (window.confirm('Are you sure you want to discard this running timer?')) {
      localStorage.removeItem(timerStorageKey);
      setActiveTimer(null);
      setElapsedSeconds(0);
      toast.info('Timer discarded');
    }
  };

  const handleCreateManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const startDateTimeStr = `${manualDate}T${manualStartTime}:00`;
      const endDateTimeStr = `${manualDate}T${manualEndTime}:00`;
      const startTime = new Date(startDateTimeStr);
      const endTime = new Date(endDateTimeStr);

      if (endTime < startTime) {
        // If end time is before start time, assume it spans to the next day
        endTime.setDate(endTime.getDate() + 1);
      }

      const diffMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.max(1, Math.round(diffMs / 60000));

      const res = await createTimeEntryAction(project.workspaceId, {
        projectId: project.id,
        taskId: manualTaskId === 'none' ? null : manualTaskId,
        startTime,
        endTime,
        durationMinutes,
        billable: manualBillable,
        notes: manualNotes || 'Manual time entry',
      });

      if (res.success) {
        toast.success('Time logged successfully');
        setIsManualOpen(false);
        setManualNotes('');
        setManualTaskId('none');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to log time');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditModal = (entry: ExtendedTimeEntry) => {
    setSelectedEntry(entry);
    setEditNotes(entry.notes);
    setEditBillable(entry.billable);
    setEditTaskId(entry.taskId || 'none');

    const start = new Date(entry.startTime);
    const end = new Date(entry.endTime);

    // Format date: YYYY-MM-DD local time
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    
    // Format times: HH:MM
    const startTimeStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const endTimeStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

    setEditDate(dateStr);
    setEditStartTime(startTimeStr);
    setEditEndTime(endTimeStr);
    setIsEditOpen(true);
  };

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    setIsLoading(true);
    try {
      const startDateTimeStr = `${editDate}T${editStartTime}:00`;
      const endDateTimeStr = `${editDate}T${editEndTime}:00`;
      const startTime = new Date(startDateTimeStr);
      const endTime = new Date(endDateTimeStr);

      if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }

      const diffMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.max(1, Math.round(diffMs / 60000));

      const res = await updateTimeEntryAction(
        selectedEntry.id,
        project.workspaceId,
        project.id,
        {
          taskId: editTaskId === 'none' ? null : editTaskId,
          startTime,
          endTime,
          durationMinutes,
          billable: editBillable,
          notes: editNotes,
        }
      );

      if (res.success) {
        toast.success('Time entry updated successfully');
        setIsEditOpen(false);
        setSelectedEntry(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update time entry');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;

    setIsLoading(true);
    try {
      const res = await deleteTimeEntryAction(
        entryToDelete.id,
        project.workspaceId,
        project.id
      );

      if (res.success) {
        toast.success('Time entry deleted successfully');
        setIsDeleteOpen(false);
        setEntryToDelete(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to delete time entry');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Format seconds to HH:MM:SS
  const formatSeconds = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  };

  // Helper: Format minutes to readable duration
  const formatDuration = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${remMins}m`;
    }
    return `${remMins}m`;
  };

  // Helper: Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper: Format time range
  const formatTimeRange = (start: Date | string, end: Date | string) => {
    const formatTime = (d: Date) => {
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };
    return `${formatTime(new Date(start))} - ${formatTime(new Date(end))}`;
  };

  // Calculations for summary metrics
  const totalMinutes = timeEntries.reduce((acc, entry) => acc + entry.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const billableMinutes = timeEntries.reduce((acc, entry) => acc + (entry.billable ? entry.durationMinutes : 0), 0);
  const billableHours = (billableMinutes / 60).toFixed(1);

  const totalEntriesCount = timeEntries.length;

  return (
    <div className="space-y-6">
      {/* Metrics Summary Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-950 dark:text-slate-50">{totalHours} hrs</div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">All entries combined</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">Billable Hours</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-950 dark:text-slate-50">{billableHours} hrs</div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              {totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0}% of total time
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-950 dark:text-slate-50">{totalEntriesCount}</div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Logged sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Other Timer Running Alert */}
      {otherTimerRunning && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50 text-blue-850 dark:text-blue-300 text-xs">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <span className="font-bold">Timer Running Elsewhere:</span> A timer is currently running in this workspace for project <span className="font-semibold underline">&ldquo;{otherTimerRunning.projectName}&rdquo;</span>.
            You must stop it or discard it before starting a timer on this project.
          </div>
        </div>
      )}

      {/* Core Time Tracker Panel */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden">
        {activeTimer ? (
          /* Running Timer UI */
          <div className="bg-gradient-to-r from-indigo-50/60 via-white to-violet-50/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-violet-950/15 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">TIMER ACTIVE</span>
                </div>
                <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                  {formatSeconds(elapsedSeconds)}
                </div>
                <div className="space-y-1">
                  {activeTimer.taskId && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      <Tag className="h-3.5 w-3.5" />
                      <span>
                        {project.tasks?.find(t => t.id === activeTimer.taskId)?.title || 'Task'}
                      </span>
                    </div>
                  )}
                  {activeTimer.notes && (
                    <p className="text-sm text-slate-600 dark:text-slate-350 italic">
                      &ldquo;{activeTimer.notes}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Badge variant="outline" className={`text-[10px] font-semibold tracking-wide uppercase ${activeTimer.billable ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30' : 'bg-slate-50 text-slate-650 border-slate-200 dark:bg-slate-950/20 dark:text-slate-300 dark:border-slate-800'}`}>
                      {activeTimer.billable ? 'Billable' : 'Non-Billable'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleStopTimer}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-5 shadow-lg shadow-red-500/10"
                >
                  <Square className="mr-2 h-4.5 w-4.5 fill-white" /> Stop Timer
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDiscardTimer}
                  className="border-slate-250 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-5"
                >
                  Discard
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Start Timer Form UI */
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Play className="h-4.5 w-4.5 text-indigo-500 fill-indigo-500" /> Start Live Time Tracker
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsManualOpen(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 px-3 h-8"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Log Manual Time
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3 md:items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Select Task (Optional)</label>
                  <Select value={timerTaskId} onValueChange={(val) => setTimerTaskId(val ?? 'none')}>
                    <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 text-xs">
                      <SelectValue placeholder="No Task Linked">
                        {timerTaskId && timerTaskId !== 'none' ? (project.tasks?.find(t => t.id === timerTaskId)?.title || timerTaskId) : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-950 border-slate-250 dark:border-slate-800">
                      <SelectItem value="none">No Task Linked</SelectItem>
                      {project.tasks?.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">What are you working on?</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Design homepage mobile mockups..."
                      value={timerNotes}
                      onChange={(e) => setTimerNotes(e.target.value)}
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 text-xs"
                    />
                    <div className="flex items-center px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 gap-2 shrink-0">
                      <input
                        type="checkbox"
                        id="timerBillableCheck"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                        checked={timerBillable}
                        onChange={(e) => setTimerBillable(e.target.checked)}
                      />
                      <label htmlFor="timerBillableCheck" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                        Billable
                      </label>
                    </div>
                    <Button 
                      onClick={handleStartTimer}
                      disabled={!!otherTimerRunning}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shrink-0 h-9 px-4.5 text-xs shadow-md shadow-indigo-500/10"
                    >
                      <Play className="mr-1.5 h-3.5 w-3.5 fill-white" /> Start
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Log History */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-850 pb-4">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" /> Log History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {timeEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-550 dark:text-slate-400 space-y-2">
              <Clock className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold">No time entries logged yet</p>
              <p className="text-xs text-slate-400">Start the timer or add a manual entry to track project hours.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 font-bold">Date & Time Range</th>
                    <th className="py-3 px-4 font-bold">Linked Task</th>
                    <th className="py-3 px-4 font-bold">Description</th>
                    <th className="py-3 px-4 font-bold text-center">Duration</th>
                    <th className="py-3 px-4 font-bold text-center">Billing</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                  {timeEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-300">
                        <div>{formatDate(entry.startTime)}</div>
                        <div className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">
                          {formatTimeRange(entry.startTime, entry.endTime)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[150px] truncate">
                        {entry.task ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-650 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/25 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30">
                            <Tag className="h-3 w-3 shrink-0" />
                            <span className="truncate">{entry.task.title}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-normal max-w-[250px] break-words">
                        {entry.notes}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-slate-100">
                        {formatDuration(entry.durationMinutes)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant="outline" className={`text-[9px] font-semibold uppercase px-1.5 py-0 ${entry.billable ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30' : 'bg-slate-50 text-slate-650 border-slate-200 dark:bg-slate-950/20 dark:text-slate-300 dark:border-slate-800'}`}>
                          {entry.billable ? 'Billable' : 'Non-Bill'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
                            onClick={() => handleOpenEditModal(entry)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:text-red-650 dark:hover:text-red-400"
                            onClick={() => {
                              setEntryToDelete(entry);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Entry Dialog */}
      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" /> Log Time Manually
            </DialogTitle>
            <DialogDescription className="text-slate-550 dark:text-slate-400 text-xs">
              Log project progress by manually specifying date, hours, and notes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateManualEntry} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date</label>
              <Input
                type="date"
                required
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Time</label>
                <Input
                  type="time"
                  required
                  value={manualStartTime}
                  onChange={(e) => setManualStartTime(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Time</label>
                <Input
                  type="time"
                  required
                  value={manualEndTime}
                  onChange={(e) => setManualEndTime(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Task (Optional)</label>
              <Select value={manualTaskId} onValueChange={(val) => setManualTaskId(val ?? 'none')}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                  <SelectValue placeholder="No Task Linked">
                    {manualTaskId && manualTaskId !== 'none' ? (project.tasks?.find(t => t.id === manualTaskId)?.title || manualTaskId) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-950 border-slate-250 dark:border-slate-800">
                  <SelectItem value="none">No Task Linked</SelectItem>
                  {project.tasks?.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Work Details / Notes</label>
              <Textarea
                placeholder="Describe what was accomplished..."
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                required
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs min-h-[80px]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="manualBillable"
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                checked={manualBillable}
                onChange={(e) => setManualBillable(e.target.checked)}
              />
              <label htmlFor="manualBillable" className="text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                This time entry is billable
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsManualOpen(false)}
                className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {isLoading ? 'Saving...' : 'Log Time'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Edit className="h-5 w-5 text-indigo-500" /> Edit Time Entry
            </DialogTitle>
            <DialogDescription className="text-slate-550 dark:text-slate-400 text-xs">
              Modify the start/end logs, note details, or status of this entry.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateEntry} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date</label>
              <Input
                type="date"
                required
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Time</label>
                <Input
                  type="time"
                  required
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Time</label>
                <Input
                  type="time"
                  required
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Task (Optional)</label>
              <Select value={editTaskId} onValueChange={(val) => setEditTaskId(val ?? 'none')}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                  <SelectValue placeholder="No Task Linked">
                    {editTaskId && editTaskId !== 'none' ? (project.tasks?.find(t => t.id === editTaskId)?.title || editTaskId) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-950 border-slate-250 dark:border-slate-800">
                  <SelectItem value="none">No Task Linked</SelectItem>
                  {project.tasks?.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Work Details / Notes</label>
              <Textarea
                placeholder="Describe what was accomplished..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                required
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs min-h-[80px]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editBillable"
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                checked={editBillable}
                onChange={(e) => setEditBillable(e.target.checked)}
              />
              <label htmlFor="editBillable" className="text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                This time entry is billable
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedEntry(null);
                }}
                className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Delete Time Entry</DialogTitle>
            <DialogDescription className="text-slate-550 dark:text-slate-400 text-xs">
              Are you sure you want to delete this time entry? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {entryToDelete && (
            <div className="py-2 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Date:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(entryToDelete.startTime)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Duration:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDuration(entryToDelete.durationMinutes)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Notes:</span>
                <span className="font-semibold text-slate-705 dark:text-slate-300 max-w-[200px] truncate">{entryToDelete.notes}</span>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setIsDeleteOpen(false);
                setEntryToDelete(null);
              }}
              className="border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-305"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDeleteEntry}
              className="bg-red-650 hover:bg-red-700 text-white font-medium"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
