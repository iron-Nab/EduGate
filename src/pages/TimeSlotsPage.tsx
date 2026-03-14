import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../db';
import { generateId } from '../lib/utils';
import { ResourceTable, type Column } from '../components/scheduling/ResourceTable';
import { ResourceForm, type FieldDef } from '../components/scheduling/ResourceForm';
import { Badge } from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';
import type { TimeSlot } from '../types/scheduling';

const fields: FieldDef[] = [
  { name: 'name', label: 'Nom', type: 'text', required: true, placeholder: '08h30-10h00' },
  { name: 'startTime', label: 'Debut', type: 'text', required: true, placeholder: '08:30' },
  { name: 'endTime', label: 'Fin', type: 'text', required: true, placeholder: '10:00' },
  { name: 'order', label: 'Ordre', type: 'number', defaultValue: 1 },
  { name: 'isBreak', label: 'Pause', type: 'checkbox', defaultValue: false },
];

const columns: Column<TimeSlot>[] = [
  { key: 'order', header: '#', className: 'w-12 text-center' },
  { key: 'name', header: 'Nom' },
  { key: 'startTime', header: 'Debut', className: 'font-mono' },
  { key: 'endTime', header: 'Fin', className: 'font-mono' },
  { key: 'isBreak', header: 'Pause', render: (ts) => ts.isBreak ? <Badge variant="warning">Pause</Badge> : null, className: 'w-16' },
];

export function TimeSlotsPage() {
  const { t } = useTranslation();
  const data = useLiveQuery(() => db.timeSlots.orderBy('order').toArray()) ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TimeSlot | null>(null);

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editing) {
      await db.timeSlots.update(editing.id, values);
      toast('Creneau modifie', 'success');
    } else {
      await db.timeSlots.add({ id: generateId(), ...values, createdAt: new Date() } as TimeSlot);
      toast('Creneau ajoute', 'success');
    }
    setEditing(null);
  };

  const handleDelete = async (item: TimeSlot) => {
    if (confirm(`Supprimer "${item.name}" ?`)) {
      await db.timeSlots.delete(item.id);
      toast('Creneau supprime', 'success');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ResourceTable title={t('nav.timeslots')} columns={columns} data={data} onAdd={() => { setEditing(null); setFormOpen(true); }} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={handleDelete} searchField="name" />
      <ResourceForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? t('actions.edit') : t('actions.add')} fields={fields} initialValues={editing ?? undefined} onSubmit={handleSubmit} />
    </div>
  );
}
