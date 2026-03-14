import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../db';
import { generateId } from '../lib/utils';
import { ResourceTable, type Column } from '../components/scheduling/ResourceTable';
import { ResourceForm, type FieldDef } from '../components/scheduling/ResourceForm';
import { toast } from '../components/ui/Toast';
import type { StudentGroup } from '../types/scheduling';

export function StudentGroupsPage() {
  const { t } = useTranslation();
  const data = useLiveQuery(() => db.studentGroups.toArray()) ?? [];
  const programs = useLiveQuery(() => db.programs.toArray()) ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StudentGroup | null>(null);

  const fields: FieldDef[] = [
    { name: 'programId', label: 'Filiere', type: 'select', required: true, options: programs.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` })) },
    { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'GRP-A1' },
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'yearLevel', label: 'Annee', type: 'number', defaultValue: 1 },
    { name: 'size', label: 'Effectif', type: 'number', defaultValue: 30 },
  ];

  const columns: Column<StudentGroup>[] = [
    { key: 'code', header: 'Code', className: 'font-mono' },
    { key: 'name', header: 'Nom' },
    { key: 'yearLevel', header: 'Annee', className: 'w-16 text-center' },
    { key: 'size', header: 'Effectif', className: 'w-20 text-center' },
  ];

  const handleSubmit = async (values: Record<string, unknown>) => {
    const now = new Date();
    if (editing) {
      await db.studentGroups.update(editing.id, { ...values, updatedAt: now });
      toast('Groupe modifie', 'success');
    } else {
      await db.studentGroups.add({ id: generateId(), ...values, createdAt: now, updatedAt: now } as StudentGroup);
      toast('Groupe ajoute', 'success');
    }
    setEditing(null);
  };

  const handleDelete = async (item: StudentGroup) => {
    if (confirm(`Supprimer "${item.name}" ?`)) {
      await db.studentGroups.delete(item.id);
      toast('Groupe supprime', 'success');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ResourceTable title={t('nav.groups')} columns={columns} data={data} onAdd={() => { setEditing(null); setFormOpen(true); }} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={handleDelete} searchField="name" />
      <ResourceForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? t('actions.edit') : t('actions.add')} fields={fields} initialValues={editing ?? undefined} onSubmit={handleSubmit} />
    </div>
  );
}
