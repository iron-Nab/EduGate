import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface ResourceTableProps<T extends { id: string }> {
  title: string;
  columns: Column<T>[];
  data: T[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  searchField?: keyof T;
}

export function ResourceTable<T extends { id: string }>({
  title, columns, data, onAdd, onEdit, onDelete, searchField,
}: ResourceTableProps<T>) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = searchField
    ? data.filter((item) => {
        const val = item[searchField];
        return typeof val === 'string' && val.toLowerCase().includes(search.toLowerCase());
      })
    : data;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <Button onClick={onAdd} size="sm">
          <Plus className="w-4 h-4" />
          {t('actions.add')}
        </Button>
      </div>

      {searchField && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('actions.search') + '...'}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                {columns.map((col) => (
                  <th key={col.key} className={cn('px-4 py-3 text-left font-medium text-text-secondary', col.className)}>
                    {col.header}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium text-text-secondary w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3', col.className)}>
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-surface-alt transition-colors cursor-pointer">
                        <Pencil className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4 text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-text-muted mt-2">{filtered.length} element(s)</p>
    </div>
  );
}
