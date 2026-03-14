import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../db';
import { generateId } from '../lib/utils';
import { ResourceTable, type Column } from '../components/scheduling/ResourceTable';
import { ResourceForm, type FieldDef } from '../components/scheduling/ResourceForm';
import { toast } from '../components/ui/Toast';
import type { Department } from '../types/scheduling';

const fields: FieldDef[] = [
  { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'INFO' },
  { name: 'name', label: 'Nom', type: 'text', required: true, placeholder: 'Informatique' },
  { name: 'nameFr', label: 'Nom (FR)', type: 'text' },
  { name: 'nameAr', label: 'Nom (AR)', type: 'text' },
];

const columns: Column<Department>[] = [
  { key: 'code', header: 'Code', className: 'font-mono' },
  { key: 'name', header: 'Nom' },
  { key: 'nameFr', header: 'Nom FR' },
];

export function DepartmentsPage() {
  const { t } = useTranslation();
  const data = useLiveQuery(() => db.departments.toArray()) ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const handleSubmit = async (values: Record<string, unknown>) => {
    const now = new Date();
    if (editing) {
      await db.departments.update(editing.id, { ...values, updatedAt: now });
      toast('Departement modifie', 'success');
    } else {
      await db.departments.add({ id: generateId(), ...values, createdAt: now, updatedAt: now } as Department);
      toast('Departement ajoute', 'success');
    }
    setEditing(null);
  };

  const handleDelete = async (item: Department) => {
    if (confirm(`Supprimer "${item.name}" ?`)) {
      await db.departments.delete(item.id);
      toast('Departement supprime', 'success');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ResourceTable title={t('nav.departments')} columns={columns} data={data} onAdd={() => { setEditing(null); setFormOpen(true); }} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={handleDelete} searchField="name" />
      <ResourceForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? t('actions.edit') : t('actions.add')} fields={fields} initialValues={editing ?? undefined} onSubmit={handleSubmit} />
    </div>
  );
}
