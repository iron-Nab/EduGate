import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarDays, Sparkles, Wand2, MessageSquare, AlertTriangle, Lock, Trash2 } from 'lucide-react';
import { db } from '../db';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { toast } from '../components/ui/Toast';
import { useSchedulingStore } from '../stores/scheduling-store';
import { useGateway } from '../hooks/use-gateway';
import { detectConflicts } from '../lib/conflict-engine';
import { serializeForGeneration, serializeForOptimization, serializeForConflictExplanation, parseScheduleResponse } from '../lib/schedule-serializer';
import { DAYS, generateId, cn } from '../lib/utils';

export function TimetablePage() {
  const { t } = useTranslation();
  const { activeSemesterId, setActiveSemester, viewMode, setViewMode, selectedRoomId, setSelectedRoomId, selectedInstructorId, setSelectedInstructorId, selectedGroupId, setSelectedGroupId, aiGenerating, setAiGenerating, highlightedEntryIds } = useSchedulingStore();
  const { isConfigured, sendMessage } = useGateway();

  const semesters = useLiveQuery(() => db.semesters.toArray()) ?? [];
  const timeSlots = useLiveQuery(() => db.timeSlots.orderBy('order').toArray()) ?? [];
  const entries = useLiveQuery(() => activeSemesterId ? db.scheduleEntries.where('semesterId').equals(activeSemesterId).toArray() : ([] as import('../types/scheduling').ScheduleEntry[]), [activeSemesterId]) ?? [];
  const rooms = useLiveQuery(() => db.rooms.toArray()) ?? [];
  const courses = useLiveQuery(() => db.courses.toArray()) ?? [];
  const instructors = useLiveQuery(() => db.instructors.toArray()) ?? [];
  const groups = useLiveQuery(() => db.studentGroups.toArray()) ?? [];

  const conflicts = useMemo(() => detectConflicts(entries), [entries]);

  // Filter entries by view mode
  const filteredEntries = useMemo(() => {
    if (viewMode === 'by-room' && selectedRoomId) return entries.filter((e) => e.roomId === selectedRoomId);
    if (viewMode === 'by-instructor' && selectedInstructorId) return entries.filter((e) => e.instructorId === selectedInstructorId);
    if (viewMode === 'by-group' && selectedGroupId) return entries.filter((e) => e.studentGroupId === selectedGroupId);
    return entries;
  }, [entries, viewMode, selectedRoomId, selectedInstructorId, selectedGroupId]);

  // Assign dialog state
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDay, setAssignDay] = useState(0);
  const [assignSlot, setAssignSlot] = useState('');
  const [assignValues, setAssignValues] = useState({ courseId: '', roomId: '', instructorId: '', studentGroupId: '' });
  const [aiResult, setAiResult] = useState<string | null>(null);

  const openAssign = (day: number, slotId: string) => {
    setAssignDay(day);
    setAssignSlot(slotId);
    setAssignValues({ courseId: '', roomId: '', instructorId: '', studentGroupId: '' });
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!activeSemesterId || !assignValues.courseId || !assignValues.roomId || !assignValues.instructorId || !assignValues.studentGroupId) return;
    const now = new Date();
    await db.scheduleEntries.add({
      id: generateId(),
      semesterId: activeSemesterId,
      courseId: assignValues.courseId,
      roomId: assignValues.roomId,
      instructorId: assignValues.instructorId,
      studentGroupId: assignValues.studentGroupId,
      timeSlotId: assignSlot,
      dayOfWeek: assignDay,
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    });
    setAssignOpen(false);
    toast('Seance ajoutee', 'success');
  };

  const handleDeleteEntry = async (entryId: string) => {
    await db.scheduleEntries.delete(entryId);
    toast('Seance supprimee', 'success');
  };

  const handleToggleLock = async (entryId: string, locked: boolean) => {
    await db.scheduleEntries.update(entryId, { isLocked: !locked });
  };

  // AI actions
  const handleGenerate = async () => {
    if (!isConfigured) { toast('Configurez le Gateway', 'warning'); return; }
    setAiGenerating(true);
    try {
      const systemPrompt = serializeForGeneration({ rooms, courses, instructors, studentGroups: groups, timeSlots });
      const response = await sendMessage('Generate an optimal timetable based on all provided resources and constraints. Return as JSON array.', undefined, systemPrompt);
      if (response) {
        const parsed = parseScheduleResponse(response.response);
        if (parsed.length > 0 && activeSemesterId) {
          // Clear non-locked entries first
          const toDelete = entries.filter((e) => !e.isLocked).map((e) => e.id);
          await db.scheduleEntries.bulkDelete(toDelete);
          // Add new entries
          const now = new Date();
          const newEntries = parsed.map((e) => ({
            ...e,
            id: generateId(),
            semesterId: activeSemesterId,
            isLocked: false,
            createdAt: now,
            updatedAt: now,
          }));
          await db.scheduleEntries.bulkAdd(newEntries);
          toast(`${newEntries.length} seances generees`, 'success');
        } else {
          setAiResult(response.response);
        }
      }
    } catch (err) {
      toast('Erreur generation IA', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleOptimize = async () => {
    if (!isConfigured) { toast('Configurez le Gateway', 'warning'); return; }
    setAiGenerating(true);
    try {
      const systemPrompt = serializeForOptimization({ rooms, courses, instructors, studentGroups: groups, timeSlots, entries, conflicts });
      const response = await sendMessage('Analyze the current schedule and suggest optimizations to reduce conflicts and improve quality.', undefined, systemPrompt);
      if (response) setAiResult(response.response);
    } catch {
      toast('Erreur optimisation IA', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleExplainConflicts = async () => {
    if (!isConfigured) { toast('Configurez le Gateway', 'warning'); return; }
    if (conflicts.length === 0) { toast(t('timetable.noConflicts'), 'warning'); return; }
    setAiGenerating(true);
    try {
      const systemPrompt = serializeForConflictExplanation({ rooms, courses, instructors, studentGroups: groups, timeSlots, conflicts });
      const response = await sendMessage('Explain these scheduling conflicts and how to resolve them.', undefined, systemPrompt);
      if (response) setAiResult(response.response);
    } catch {
      toast('Erreur explication IA', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const getEntryForCell = (day: number, slotId: string) =>
    filteredEntries.filter((e) => e.dayOfWeek === day && e.timeSlotId === slotId);

  const isConflict = (entryId: string) => conflicts.some((c) => c.entryAId === entryId || c.entryBId === entryId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <CalendarDays className="w-6 h-6" />
          {t('timetable.title')}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleGenerate} size="sm" disabled={aiGenerating || !activeSemesterId}>
            <Sparkles className="w-4 h-4" />
            {t('timetable.generateAi')}
          </Button>
          <Button onClick={handleOptimize} variant="secondary" size="sm" disabled={aiGenerating || !activeSemesterId}>
            <Wand2 className="w-4 h-4" />
            {t('timetable.optimizeAi')}
          </Button>
          <Button onClick={handleExplainConflicts} variant="secondary" size="sm" disabled={aiGenerating}>
            <MessageSquare className="w-4 h-4" />
            {t('timetable.explainConflicts')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Select
          options={semesters.map((s) => ({ value: s.id, label: s.name }))}
          value={activeSemesterId ?? ''}
          onChange={(e) => setActiveSemester(e.target.value || null)}
          label=""
        />
        <Select
          options={[
            { value: 'all', label: 'Tout' },
            { value: 'by-room', label: 'Par salle' },
            { value: 'by-instructor', label: 'Par enseignant' },
            { value: 'by-group', label: 'Par groupe' },
          ]}
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as 'all' | 'by-room' | 'by-instructor' | 'by-group')}
        />
        {viewMode === 'by-room' && (
          <Select options={rooms.map((r) => ({ value: r.id, label: `${r.code} - ${r.name}` }))} value={selectedRoomId ?? ''} onChange={(e) => setSelectedRoomId(e.target.value || null)} />
        )}
        {viewMode === 'by-instructor' && (
          <Select options={instructors.map((i) => ({ value: i.id, label: `${i.firstName} ${i.lastName}` }))} value={selectedInstructorId ?? ''} onChange={(e) => setSelectedInstructorId(e.target.value || null)} />
        )}
        {viewMode === 'by-group' && (
          <Select options={groups.map((g) => ({ value: g.id, label: `${g.code} - ${g.name}` }))} value={selectedGroupId ?? ''} onChange={(e) => setSelectedGroupId(e.target.value || null)} />
        )}
        {conflicts.length > 0 && (
          <Badge variant="danger">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {conflicts.length} {t('timetable.conflicts')}
          </Badge>
        )}
      </div>

      {/* Timetable Grid */}
      {!activeSemesterId ? (
        <EmptyState message={t('timetable.noSemester')} />
      ) : (
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-alt">
                <th className="px-3 py-2 border-b border-r border-border w-24 text-left text-text-secondary">Creneau</th>
                {DAYS.map((d) => (
                  <th key={d.value} className="px-3 py-2 border-b border-r border-border text-center font-medium">{d.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.filter((ts) => !ts.isBreak).map((slot) => (
                <tr key={slot.id}>
                  <td className="px-3 py-2 border-b border-r border-border bg-surface-alt text-xs font-mono text-text-secondary">
                    {slot.startTime}<br />{slot.endTime}
                  </td>
                  {DAYS.map((d) => {
                    const cellEntries = getEntryForCell(d.value, slot.id);
                    return (
                      <td
                        key={d.value}
                        className="px-1 py-1 border-b border-r border-border align-top min-h-[60px] hover:bg-surface-hover cursor-pointer"
                        onClick={() => cellEntries.length === 0 && openAssign(d.value, slot.id)}
                      >
                        {cellEntries.map((entry) => {
                          const course = courses.find((c) => c.id === entry.courseId);
                          const room = rooms.find((r) => r.id === entry.roomId);
                          const instructor = instructors.find((i) => i.id === entry.instructorId);
                          const hasConflict = isConflict(entry.id);
                          return (
                            <div
                              key={entry.id}
                              className={cn(
                                'rounded-lg px-2 py-1.5 mb-1 text-xs border',
                                hasConflict ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-800' : 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800',
                                highlightedEntryIds.includes(entry.id) && 'ring-2 ring-primary-500'
                              )}
                              style={course?.color ? { borderLeftColor: course.color, borderLeftWidth: 3 } : undefined}
                            >
                              <div className="font-medium truncate">{course?.code || '?'}</div>
                              <div className="text-text-muted truncate">{room?.code} | {instructor?.lastName}</div>
                              <div className="flex items-center gap-1 mt-1">
                                {entry.isLocked && <Lock className="w-3 h-3 text-text-muted" />}
                                <button onClick={(e) => { e.stopPropagation(); handleToggleLock(entry.id, entry.isLocked); }} className="p-0.5 rounded hover:bg-black/10 cursor-pointer">
                                  <Lock className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }} className="p-0.5 rounded hover:bg-red-100 cursor-pointer">
                                  <Trash2 className="w-3 h-3 text-danger" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} title={t('timetable.assign')}>
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">{DAYS.find((d) => d.value === assignDay)?.label} - {timeSlots.find((ts) => ts.id === assignSlot)?.name}</p>
          <Select label="Cours" options={courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` }))} value={assignValues.courseId} onChange={(e) => setAssignValues((v) => ({ ...v, courseId: e.target.value }))} />
          <Select label="Salle" options={rooms.map((r) => ({ value: r.id, label: `${r.code} - ${r.name} (${r.capacity})` }))} value={assignValues.roomId} onChange={(e) => setAssignValues((v) => ({ ...v, roomId: e.target.value }))} />
          <Select label="Enseignant" options={instructors.map((i) => ({ value: i.id, label: `${i.firstName} ${i.lastName}` }))} value={assignValues.instructorId} onChange={(e) => setAssignValues((v) => ({ ...v, instructorId: e.target.value }))} />
          <Select label="Groupe" options={groups.map((g) => ({ value: g.id, label: `${g.code} - ${g.name}` }))} value={assignValues.studentGroupId} onChange={(e) => setAssignValues((v) => ({ ...v, studentGroupId: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>{t('actions.cancel')}</Button>
            <Button onClick={handleAssign}>{t('actions.save')}</Button>
          </div>
        </div>
      </Dialog>

      {/* AI Result Dialog */}
      <Dialog open={!!aiResult} onClose={() => setAiResult(null)} title="Resultat IA" className="max-w-2xl">
        <div className="prose prose-sm max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
        </div>
        <div className="flex justify-end pt-3">
          <Button variant="secondary" onClick={() => setAiResult(null)}>{t('actions.close')}</Button>
        </div>
      </Dialog>
    </div>
  );
}
