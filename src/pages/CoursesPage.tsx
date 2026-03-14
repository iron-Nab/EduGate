import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../db';
import { generateId, SESSION_TYPES, ROOM_TYPES } from '../lib/utils';
import { ResourceTable, type Column } from '../components/scheduling/ResourceTable';
import { ResourceForm, type FieldDef } from '../components/scheduling/ResourceForm';
import { Badge } from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';
import type { Course } from '../types/scheduling';

export function CoursesPage() {
  const { t } = useTranslation();
  const data = useLiveQuery(() => db.courses.toArray()) ?? [];
  const departments = useLiveQuery(() => db.departments.toArray()) ?? [];
  const programs = useLiveQuery(() => db.programs.toArray()) ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const fields: FieldDef[] = [
    { name: 'departmentId', label: 'Departement', type: 'select', required: true, options: departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` })) },
    { name: 'programId', label: 'Filiere', type: 'select', options: programs.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` })) },
    { name: 'code', label: 'Code', type: 'text', required: true },
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'sessionType', label: 'Type de seance', type: 'select', required: true, options: SESSION_TYPES },
    { name: 'credits', label: 'Credits', type: 'number', defaultValue: 3 },
    { name: 'hoursPerWeek', label: 'Heures/semaine', type: 'number', defaultValue: 2 },
    { name: 'sessionDuration', label: 'Duree seance (min)', type: 'number', defaultValue: 90 },
    { name: 'yearLevel', label: 'Annee', type: 'number', defaultValue: 1 },
    { name: 'requiredRoomType', label: 'Type de salle requis', type: 'select', options: ROOM_TYPES },
  ];

  const columns: Column<Course>[] = [
    { key: 'code', header: 'Code', className: 'font-mono' },
    { key: 'name', header: 'Nom' },
    { key: 'sessionType', header: 'Type', render: (c) => <Badge variant="info">{c.sessionType}</Badge> },
    { key: 'hoursPerWeek', header: 'H/sem', className: 'w-16 text-center' },
    { key: 'credits', header: 'Credits', className: 'w-16 text-center' },
  ];

  const handleSubmit = async (values: Record<string, unknown>) => {
    const now = new Date();
    if (editing) {
      await db.courses.update(editing.id, { ...values, updatedAt: now });
      toast('Cours modifie', 'success');
    } else {
      await db.courses.add({ id: generateId(), ...values, createdAt: now, updatedAt: now } as Course);
      toast('Cours ajoute', 'success');
    }
    setEditing(null);
  };

  const handleDelete = async (item: Course) => {
    if (confirm(`Supprimer "${item.name}" ?`)) {
      await db.courses.delete(item.id);
      toast('Cours supprime', 'success');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ResourceTable title={t('nav.courses')} columns={columns} data={data} onAdd={() => { setEditing(null); setFormOpen(true); }} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={handleDelete} searchField="name" />
      <ResourceForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? t('actions.edit') : t('actions.add')} fields={fields} initialValues={editing ?? undefined} onSubmit={handleSubmit} />
    </div>
  );
}
