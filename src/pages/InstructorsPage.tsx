import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../db';
import { generateId } from '../lib/utils';
import { ResourceTable, type Column } from '../components/scheduling/ResourceTable';
import { ResourceForm, type FieldDef } from '../components/scheduling/ResourceForm';
import { toast } from '../components/ui/Toast';
import type { Instructor } from '../types/scheduling';

export function InstructorsPage() {
  const { t } = useTranslation();
  const data = useLiveQuery(() => db.instructors.toArray()) ?? [];
  const departments = useLiveQuery(() => db.departments.toArray()) ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Instructor | null>(null);

  const fields: FieldDef[] = [
    { name: 'firstName', label: 'Prenom', type: 'text', required: true },
    { name: 'lastName', label: 'Nom', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'title', label: 'Titre', type: 'text', placeholder: 'Pr., Dr.' },
    { name: 'departmentId', label: 'Departement', type: 'select', options: departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` })) },
    { name: 'maxHoursPerWeek', label: 'Max heures/semaine', type: 'number', defaultValue: 20 },
    { name: 'maxHoursPerDay', label: 'Max heures/jour', type: 'number', defaultValue: 6 },
  ];

  const columns: Column<Instructor>[] = [
    { key: 'lastName', header: 'Nom', render: (i) => `${i.title ? i.title + ' ' : ''}${i.lastName}` },
    { key: 'firstName', header: 'Prenom' },
    { key: 'email', header: 'Email' },
    { key: 'maxHoursPerWeek', header: 'Max H/sem', className: 'w-24 text-center' },
  ];

  const handleSubmit = async (values: Record<string, unknown>) => {
    const now = new Date();
    if (editing) {
      await db.instructors.update(editing.id, { ...values, updatedAt: now });
      toast('Enseignant modifie', 'success');
    } else {
      await db.instructors.add({ id: generateId(), ...values, createdAt: now, updatedAt: now } as Instructor);
      toast('Enseignant ajoute', 'success');
    }
    setEditing(null);
  };

  const handleDelete = async (item: Instructor) => {
    if (confirm(`Supprimer "${item.firstName} ${item.lastName}" ?`)) {
      await db.instructors.delete(item.id);
      toast('Enseignant supprime', 'success');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ResourceTable title={t('nav.instructors')} columns={columns} data={data} onAdd={() => { setEditing(null); setFormOpen(true); }} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={handleDelete} searchField="lastName" />
      <ResourceForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? t('actions.edit') : t('actions.add')} fields={fields} initialValues={editing ?? undefined} onSubmit={handleSubmit} />
    </div>
  );
}
