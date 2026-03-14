import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../db';
import { generateId } from '../lib/utils';
import { ResourceTable, type Column } from '../components/scheduling/ResourceTable';
import { ResourceForm, type FieldDef } from '../components/scheduling/ResourceForm';
import { Badge } from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';
import type { Semester } from '../types/scheduling';

const fields: FieldDef[] = [
  { name: 'name', label: 'Nom', type: 'text', required: true, placeholder: 'S1 2025-2026' },
  { name: 'startDate', label: 'Date debut', type: 'text', required: true, placeholder: '2025-09-01' },
  { name: 'endDate', label: 'Date fin', type: 'text', required: true, placeholder: '2026-01-31' },
  { name: 'isCurrent', label: 'Semestre actuel', type: 'checkbox', defaultValue: false },
];

const columns: Column<Semester>[] = [
  { key: 'name', header: 'Nom' },
  { key: 'startDate', header: 'Debut', render: (s) => String(s.startDate).slice(0, 10) },
  { key: 'endDate', header: 'Fin', render: (s) => String(s.endDate).slice(0, 10) },
  { key: 'isCurrent', header: 'Actuel', render: (s) => s.isCurrent ? <Badge variant="success">Actuel</Badge> : null },
];

export function SemestersPage() {
  const { t } = useTranslation();
  const data = useLiveQuery(() => db.semesters.toArray()) ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);

  const handleSubmit = async (values: Record<string, unknown>) => {
    const now = new Date();
    if (editing) {
      await db.semesters.update(editing.id, { ...values, updatedAt: now });
      toast('Semestre modifie', 'success');
    } else {
      await db.semesters.add({ id: generateId(), ...values, createdAt: now, updatedAt: now } as Semester);
      toast('Semestre ajoute', 'success');
    }
    setEditing(null);
  };

  const handleDelete = async (item: Semester) => {
    if (confirm(`Supprimer "${item.name}" ?`)) {
      await db.semesters.delete(item.id);
      toast('Semestre supprime', 'success');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ResourceTable title={t('nav.semesters')} columns={columns} data={data} onAdd={() => { setEditing(null); setFormOpen(true); }} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={handleDelete} searchField="name" />
      <ResourceForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? t('actions.edit') : t('actions.add')} fields={fields} initialValues={editing ?? undefined} onSubmit={handleSubmit} />
    </div>
  );
}
