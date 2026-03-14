import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../db';
import { generateId } from '../lib/utils';
import { ResourceTable, type Column } from '../components/scheduling/ResourceTable';
import { ResourceForm, type FieldDef } from '../components/scheduling/ResourceForm';
import { toast } from '../components/ui/Toast';
import type { Building } from '../types/scheduling';

const fields: FieldDef[] = [
  { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'BAT-A' },
  { name: 'name', label: 'Nom', type: 'text', required: true, placeholder: 'Batiment A' },
  { name: 'address', label: 'Adresse', type: 'text' },
  { name: 'floors', label: 'Etages', type: 'number', defaultValue: 1 },
];

const columns: Column<Building>[] = [
  { key: 'code', header: 'Code', className: 'font-mono' },
  { key: 'name', header: 'Nom' },
  { key: 'address', header: 'Adresse' },
  { key: 'floors', header: 'Etages', className: 'w-20 text-center' },
];

export function BuildingsPage() {
  const { t } = useTranslation();
  const data = useLiveQuery(() => db.buildings.toArray()) ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);

  const handleSubmit = async (values: Record<string, unknown>) => {
    const now = new Date();
    if (editing) {
      await db.buildings.update(editing.id, { ...values, updatedAt: now });
      toast('Batiment modifie', 'success');
    } else {
      await db.buildings.add({ id: generateId(), ...values, createdAt: now, updatedAt: now } as Building);
      toast('Batiment ajoute', 'success');
    }
    setEditing(null);
  };

  const handleDelete = async (item: Building) => {
    if (confirm(`Supprimer "${item.name}" ?`)) {
      await db.buildings.delete(item.id);
      toast('Batiment supprime', 'success');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ResourceTable
        title={t('nav.buildings')}
        columns={columns}
        data={data}
        onAdd={() => { setEditing(null); setFormOpen(true); }}
        onEdit={(item) => { setEditing(item); setFormOpen(true); }}
        onDelete={handleDelete}
        searchField="name"
      />
      <ResourceForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        title={editing ? t('actions.edit') : t('actions.add')}
        fields={fields}
        initialValues={editing ?? undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
