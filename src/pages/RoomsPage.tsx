import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../db';
import { generateId, ROOM_TYPES } from '../lib/utils';
import { ResourceTable, type Column } from '../components/scheduling/ResourceTable';
import { ResourceForm, type FieldDef } from '../components/scheduling/ResourceForm';
import { Badge } from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';
import type { Room } from '../types/scheduling';

export function RoomsPage() {
  const { t } = useTranslation();
  const data = useLiveQuery(() => db.rooms.toArray()) ?? [];
  const buildings = useLiveQuery(() => db.buildings.toArray()) ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);

  const fields: FieldDef[] = [
    { name: 'buildingId', label: 'Batiment', type: 'select', required: true, options: buildings.map((b) => ({ value: b.id, label: `${b.code} - ${b.name}` })) },
    { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'A-101' },
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: ROOM_TYPES },
    { name: 'capacity', label: 'Capacite', type: 'number', defaultValue: 30 },
    { name: 'floor', label: 'Etage', type: 'number', defaultValue: 0 },
    { name: 'isAvailable', label: 'Disponible', type: 'checkbox', defaultValue: true },
  ];

  const columns: Column<Room>[] = [
    { key: 'code', header: 'Code', className: 'font-mono' },
    { key: 'name', header: 'Nom' },
    { key: 'type', header: 'Type', render: (r) => <Badge>{ROOM_TYPES.find((t) => t.value === r.type)?.label ?? r.type}</Badge> },
    { key: 'capacity', header: 'Capacite', className: 'w-20 text-center' },
    { key: 'isAvailable', header: 'Dispo', render: (r) => <Badge variant={r.isAvailable ? 'success' : 'danger'}>{r.isAvailable ? 'Oui' : 'Non'}</Badge>, className: 'w-16' },
  ];

  const handleSubmit = async (values: Record<string, unknown>) => {
    const now = new Date();
    if (editing) {
      await db.rooms.update(editing.id, { ...values, equipment: [], updatedAt: now });
      toast('Salle modifiee', 'success');
    } else {
      await db.rooms.add({ id: generateId(), ...values, equipment: [], createdAt: now, updatedAt: now } as unknown as Room);
      toast('Salle ajoutee', 'success');
    }
    setEditing(null);
  };

  const handleDelete = async (item: Room) => {
    if (confirm(`Supprimer "${item.name}" ?`)) {
      await db.rooms.delete(item.id);
      toast('Salle supprimee', 'success');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ResourceTable title={t('nav.rooms')} columns={columns} data={data} onAdd={() => { setEditing(null); setFormOpen(true); }} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={handleDelete} searchField="name" />
      <ResourceForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? t('actions.edit') : t('actions.add')} fields={fields} initialValues={editing ?? undefined} onSubmit={handleSubmit} />
    </div>
  );
}
