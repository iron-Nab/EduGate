import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Building2, DoorOpen, BookOpen, GraduationCap,
  Users, Clock, CalendarDays, CalendarRange, MessageSquare, Settings,
  ChevronLeft, ChevronRight, School, Layers
} from 'lucide-react';
import { useSettingsStore } from '../../stores/settings-store';
import { cn } from '../../lib/utils';

const navGroups = [
  {
    items: [
      { to: '/', icon: LayoutDashboard, label: 'nav.dashboard' },
    ],
  },
  {
    titleKey: 'nav.resources',
    items: [
      { to: '/buildings', icon: Building2, label: 'nav.buildings' },
      { to: '/rooms', icon: DoorOpen, label: 'nav.rooms' },
      { to: '/departments', icon: Layers, label: 'nav.departments' },
      { to: '/programs', icon: School, label: 'nav.programs' },
      { to: '/courses', icon: BookOpen, label: 'nav.courses' },
      { to: '/instructors', icon: GraduationCap, label: 'nav.instructors' },
      { to: '/groups', icon: Users, label: 'nav.groups' },
      { to: '/timeslots', icon: Clock, label: 'nav.timeslots' },
      { to: '/semesters', icon: CalendarRange, label: 'nav.semesters' },
    ],
  },
  {
    items: [
      { to: '/timetable', icon: CalendarDays, label: 'nav.timetable' },
      { to: '/chat', icon: MessageSquare, label: 'nav.chat' },
    ],
  },
  {
    items: [
      { to: '/settings', icon: Settings, label: 'nav.settings' },
    ],
  },
];

export function Sidebar() {
  const { t } = useTranslation();
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const toggle = useSettingsStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col border-r border-border bg-surface-alt transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          E
        </div>
        {!collapsed && (
          <span className="font-semibold text-lg">EduGate</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.titleKey && !collapsed && (
              <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                {t(group.titleKey)}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 mx-2 px-2 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                  )
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{t(item.label)}</span>}
              </NavLink>
            ))}
            {gi < navGroups.length - 1 && (
              <div className="mx-4 my-1 border-b border-border" />
            )}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="flex items-center justify-center h-10 border-t border-border hover:bg-surface-hover transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
