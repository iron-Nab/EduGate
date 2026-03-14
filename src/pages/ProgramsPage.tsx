import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../db';
import { generateId, LEVELS } from '../lib/utils';
import { ResourceTable, type Column } from '../components/scheduling/ResourceTable';
import { ResourceForm, type FieldDef } from '../components/scheduling/ResourceForm';
import { Badge } from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';
import type { Program } from '../types/scheduling';

export function ProgramsPage() {
  const { t } = useTranslation();
  const data = useLiveQuery(() => db.programs.toArray()) ?? [];
  const departments = useLiveQuery(() => db.departments.toArray()) ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);

  const fields: FieldDef[] = [
    { name: 'departmentId', label: 'Departement', type: 'select', required: true, options: departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` })) },
    { name: 'code', label: 'Code', type: 'text', required: true },
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'level', label: 'Niveau', type: 'select', required: true, options: LEVELS },
    { name: 'durationYears', label: 'Duree (annees)', type: 'number', defaultValue: 3 },
  ];

  const columns: Column<Program>[] = [
    { key: 'code', header: 'Code', className: 'font-mono' },
    { key: 'name', header: 'Nom' },
    { key: 'level', header: 'Niveau', render: (p) => <Badge>{p.level}</Badge> },
    { key: 'durationYears', header: 'Duree', className: 'w-20 text-center', render: (p) => `${p.durationYears} ans` },
  ];

  const handleSubmit = async (values: Record<string, unknown>) => {
    const now = new Date();
    if (editing) {
      await db.programs.update(editing.id, { ...values, updatedAt: now });
      toast('Filiere modifiee', 'success');
    } else {
      await db.programs.add({ id: generateId(), ...values, createdAt: now, updatedAt: now } as Program);
      toast('Filiere ajoutee', 'success');
    }
    setEditing(null);
  };

  const handleDelete = async (item: Program) => {
    if (confirm(`Supprimer "${item.name}" ?`)) {
      await db.programs.delete(item.id);
      toast('Filiere supprimee', 'success');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ResourceTable title={t('nav.programs')} columns={columns} data={data} onAdd={() => { setEditing(null); setFormOpen(true); }} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={handleDelete} searchField="name" />
      <ResourceForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? t('actions.edit') : t('actions.add')} fields={fields} initialValues={editing ?? undefined} onSubmit={handleSubmit} />
    </div>
  );
}
