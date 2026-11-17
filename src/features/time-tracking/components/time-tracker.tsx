'use client';

import { getErrorMessage } from '@/lib/errors';

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

export function TimeTracker({ project, initialTimeEntries }: TimeTrackerProps) {
  const router = useRouter();
  const timeEntries = initialTimeEntries;
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
      {/* Metrics Summary Strip */}
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border border border-border rounded-lg bg-card overflow-hidden">
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Total Hours Logged</span>
            <Clock className="h-4 w-4 text-brand" />
          </div>
          <div className="font-mono text-2xl font-bold tabular-nums text-foreground">{totalHours} hrs</div>
          <p className="text-[11px] text-muted-foreground">All entries combined</p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Billable Hours</span>
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-bold tabular-nums text-foreground">{billableHours} hrs</div>
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0}% of total time
          </p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Total Logs</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="font-mono text-2xl font-bold tabular-nums text-foreground">{totalEntriesCount}</div>
          <p className="text-[11px] text-muted-foreground">Logged sessions</p>
        </div>
      </div>

      {/* Other Timer Running Alert */}
      {otherTimerRunning && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Timer Running Elsewhere:</span> A timer is currently running in this workspace for project <span className="font-semibold underline">&ldquo;{otherTimerRunning.projectName}&rdquo;</span>.
            You must stop it or discard it before starting a timer on this project.
          </div>
        </div>
      )}

      {/* Core Time Tracker Panel */}
      <Card className="border-border bg-card rounded-lg overflow-hidden">
        {activeTimer ? (
          /* Running Timer UI */
          <div className="bg-muted/30 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-brand" />
                  <span className="text-xs font-semibold text-foreground">Timer Active</span>
                </div>
                <div className="text-4xl font-bold text-foreground font-mono tabular-nums tracking-tight">
                  {formatSeconds(elapsedSeconds)}
                </div>
                <div className="space-y-1">
                  {activeTimer.taskId && (
                    <div className="flex items-center gap-1.5 text-xs text-brand font-semibold">
                      <Tag className="h-3.5 w-3.5" />
                      <span>
                        {project.tasks?.find(t => t.id === activeTimer.taskId)?.title || 'Task'}
                      </span>
                    </div>
                  )}
                  {activeTimer.notes && (
                    <p className="text-sm text-muted-foreground">
                      &ldquo;{activeTimer.notes}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Badge variant="outline" className={`text-[11px] font-semibold ${activeTimer.billable ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400' : 'bg-muted text-muted-foreground border-border'}`}>
                      {activeTimer.billable ? 'Billable' : 'Non-Billable'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="destructive"
                  onClick={handleStopTimer}
                  disabled={isLoading}
                  className="font-semibold px-6 py-5"
                >
                  <Square className="mr-2 h-4 w-4 fill-current" /> Stop Timer
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDiscardTimer}
                  className="border-border text-foreground hover:bg-muted py-5"
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
                <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                  <Play className="h-4 w-4 text-brand fill-brand" /> Start Live Time Tracker
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsManualOpen(true)}
                  className="text-xs text-foreground font-semibold hover:bg-muted px-3 h-8"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Log Manual Time
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3 md:items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Select Task (Optional)</label>
                  <Select value={timerTaskId} onValueChange={(val) => setTimerTaskId(val ?? 'none')}>
                    <SelectTrigger className="bg-background border-border h-9 text-xs">
                      <SelectValue placeholder="No Task Linked">
                        {timerTaskId && timerTaskId !== 'none' ? (project.tasks?.find(t => t.id === timerTaskId)?.title || timerTaskId) : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
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
                  <label className="text-xs font-medium text-muted-foreground">What are you working on?</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Design homepage mobile mockups..."
                      value={timerNotes}
                      onChange={(e) => setTimerNotes(e.target.value)}
                      className="bg-background border-border h-9 text-xs"
                    />
                    <div className="flex items-center px-3 border border-border rounded-lg bg-background gap-2 shrink-0">
                      <input
                        type="checkbox"
                        id="timerBillableCheck"
                        className="rounded border-border accent-brand h-4 w-4 cursor-pointer"
                        checked={timerBillable}
                        onChange={(e) => setTimerBillable(e.target.checked)}
                      />
                      <label htmlFor="timerBillableCheck" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                        Billable
                      </label>
                    </div>
                    <Button 
                      onClick={handleStartTimer}
                      disabled={!!otherTimerRunning}
                      className="font-semibold shrink-0 h-9 px-4.5 text-xs"
                    >
                      <Play className="mr-1.5 h-3.5 w-3.5 fill-current" /> Start
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Log History */}
      <Card className="border-border bg-card rounded-lg overflow-hidden">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand" /> Log History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {timeEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <Clock className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <p className="text-sm font-semibold text-foreground">No time entries logged yet</p>
              <p className="text-xs text-muted-foreground">Start the timer or add a manual entry to track project hours.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <th className="py-3 px-4 font-semibold">Date & Time Range</th>
                    <th className="py-3 px-4 font-semibold">Linked Task</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-4 font-semibold text-center">Duration</th>
                    <th className="py-3 px-4 font-semibold text-center">Billing</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {timeEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        <div>{formatDate(entry.startTime)}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                          {formatTimeRange(entry.startTime, entry.endTime)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[150px] truncate">
                        {entry.task ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                            <Tag className="h-3 w-3 shrink-0" />
                            <span className="truncate">{entry.task.title}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-normal max-w-[250px] break-words">
                        {entry.notes}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold tabular-nums text-foreground">
                        {formatDuration(entry.durationMinutes)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant="outline" className={`text-[11px] font-semibold px-1.5 py-0 ${entry.billable ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400' : 'bg-muted text-muted-foreground border-border'}`}>
                          {entry.billable ? 'Billable' : 'Non-Bill'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEditModal(entry)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer h-7 w-7 text-muted-foreground hover:text-destructive"
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
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand" /> Log Time Manually
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Log project progress by manually specifying date, hours, and notes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateManualEntry} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Date</label>
              <Input
                type="date"
                required
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="bg-background border-border text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Start Time</label>
                <Input
                  type="time"
                  required
                  value={manualStartTime}
                  onChange={(e) => setManualStartTime(e.target.value)}
                  className="bg-background border-border text-xs font-mono tabular-nums"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">End Time</label>
                <Input
                  type="time"
                  required
                  value={manualEndTime}
                  onChange={(e) => setManualEndTime(e.target.value)}
                  className="bg-background border-border text-xs font-mono tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Task (Optional)</label>
              <Select value={manualTaskId} onValueChange={(val) => setManualTaskId(val ?? 'none')}>
                <SelectTrigger className="bg-background border-border text-xs">
                  <SelectValue placeholder="No Task Linked">
                    {manualTaskId && manualTaskId !== 'none' ? (project.tasks?.find(t => t.id === manualTaskId)?.title || manualTaskId) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
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
              <label className="text-xs font-semibold text-foreground">Work Details / Notes</label>
              <Textarea
                placeholder="Describe what was accomplished..."
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                required
                className="bg-background border-border text-xs min-h-[80px]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="manualBillable"
                className="rounded border-border accent-brand h-4 w-4 cursor-pointer"
                checked={manualBillable}
                onChange={(e) => setManualBillable(e.target.checked)}
              />
              <label htmlFor="manualBillable" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                This time entry is billable
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsManualOpen(false)}
                className="border-border text-foreground font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="font-semibold"
              >
                {isLoading ? 'Saving...' : 'Log Time'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground flex items-center gap-2">
              <Edit className="h-5 w-5 text-brand" /> Edit Time Entry
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Modify the start/end logs, note details, or status of this entry.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateEntry} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Date</label>
              <Input
                type="date"
                required
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="bg-background border-border text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Start Time</label>
                <Input
                  type="time"
                  required
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className="bg-background border-border text-xs font-mono tabular-nums"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">End Time</label>
                <Input
                  type="time"
                  required
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  className="bg-background border-border text-xs font-mono tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Task (Optional)</label>
              <Select value={editTaskId} onValueChange={(val) => setEditTaskId(val ?? 'none')}>
                <SelectTrigger className="bg-background border-border text-xs">
                  <SelectValue placeholder="No Task Linked">
                    {editTaskId && editTaskId !== 'none' ? (project.tasks?.find(t => t.id === editTaskId)?.title || editTaskId) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
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
              <label className="text-xs font-semibold text-foreground">Work Details / Notes</label>
              <Textarea
                placeholder="Describe what was accomplished..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                required
                className="bg-background border-border text-xs min-h-[80px]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editBillable"
                className="rounded border-border accent-brand h-4 w-4 cursor-pointer"
                checked={editBillable}
                onChange={(e) => setEditBillable(e.target.checked)}
              />
              <label htmlFor="editBillable" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
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
                className="border-border text-foreground font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="font-semibold"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Delete Time Entry</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Are you sure you want to delete this time entry? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {entryToDelete && (
            <div className="py-2 space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Date:</span>
                <span className="font-semibold text-foreground">{formatDate(entryToDelete.startTime)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Duration:</span>
                <span className="font-semibold font-mono tabular-nums text-foreground">{formatDuration(entryToDelete.durationMinutes)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Notes:</span>
                <span className="font-semibold text-foreground max-w-[200px] truncate">{entryToDelete.notes}</span>
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
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDeleteEntry}
              className="font-medium"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
