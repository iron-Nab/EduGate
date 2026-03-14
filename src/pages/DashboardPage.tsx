import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Building2, DoorOpen, BookOpen, GraduationCap, Users, CalendarDays, AlertTriangle, Wifi } from 'lucide-react';
import { db } from '../db';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useSettingsStore } from '../stores/settings-store';
import { detectConflicts } from '../lib/conflict-engine';
import { useMemo } from 'react';

export function DashboardPage() {
  const { t } = useTranslation();
  const connectionStatus = useSettingsStore((s) => s.connectionStatus);

  const buildings = useLiveQuery(() => db.buildings.count()) ?? 0;
  const rooms = useLiveQuery(() => db.rooms.count()) ?? 0;
  const courses = useLiveQuery(() => db.courses.count()) ?? 0;
  const instructors = useLiveQuery(() => db.instructors.count()) ?? 0;
  const groups = useLiveQuery(() => db.studentGroups.count()) ?? 0;
  const entries = useLiveQuery(() => db.scheduleEntries.toArray()) ?? [];

  const conflicts = useMemo(() => detectConflicts(entries), [entries]);

  const stats = [
    { label: t('dashboard.totalBuildings'), value: buildings, icon: Building2, color: 'text-blue-600' },
    { label: t('dashboard.totalRooms'), value: rooms, icon: DoorOpen, color: 'text-violet-600' },
    { label: t('dashboard.totalCourses'), value: courses, icon: BookOpen, color: 'text-emerald-600' },
    { label: t('dashboard.totalInstructors'), value: instructors, icon: GraduationCap, color: 'text-amber-600' },
    { label: t('dashboard.totalGroups'), value: groups, icon: Users, color: 'text-pink-600' },
    { label: t('dashboard.totalEntries'), value: entries.length, icon: CalendarDays, color: 'text-indigo-600' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-col items-center py-5">
            <s.icon className={`w-6 h-6 mb-2 ${s.color}`} />
            <span className="text-2xl font-bold">{s.value}</span>
            <span className="text-xs text-text-secondary mt-1">{s.label}</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="font-semibold">{t('dashboard.conflicts')}</h3>
          </div>
          {conflicts.length === 0 ? (
            <p className="text-sm text-text-muted">{t('timetable.noConflicts')}</p>
          ) : (
            <div className="space-y-1">
              {conflicts.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant="danger">{t(`conflicts.${c.type.toLowerCase()}`)}</Badge>
                  <span className="text-text-secondary truncate">{c.message}</span>
                </div>
              ))}
              {conflicts.length > 5 && (
                <p className="text-xs text-text-muted">+{conflicts.length - 5} autres</p>
              )}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold">{t('dashboard.gatewayStatus')}</h3>
          </div>
          <Badge variant={connectionStatus === 'ok' ? 'success' : connectionStatus === 'error' ? 'danger' : 'default'}>
            {connectionStatus === 'ok' ? t('settings.connected') : connectionStatus === 'error' ? t('settings.disconnected') : 'Non teste'}
          </Badge>
        </Card>
      </div>
    </div>
  );
}
