import { useState, useEffect, type FormEvent } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'checkbox';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

interface ResourceFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FieldDef[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, unknown>) => void;
}

export function ResourceForm({ open, onClose, title, fields, initialValues, onSubmit }: ResourceFormProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (open) {
      const defaults: Record<string, unknown> = {};
      fields.forEach((f) => {
        defaults[f.name] = initialValues?.[f.name] ?? f.defaultValue ?? (f.type === 'number' ? 0 : f.type === 'checkbox' ? false : '');
      });
      setValues(defaults);
    }
  }, [open, initialValues, fields]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => {
          if (field.type === 'select' && field.options) {
            return (
              <Select
                key={field.name}
                label={field.label}
                options={field.options}
                value={String(values[field.name] ?? '')}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                required={field.required}
              />
            );
          }
          if (field.type === 'checkbox') {
            return (
              <label key={field.name} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(values[field.name])}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.checked }))}
                  className="rounded border-border"
                />
                {field.label}
              </label>
            );
          }
          return (
            <Input
              key={field.name}
              label={field.label}
              type={field.type}
              value={String(values[field.name] ?? '')}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                }))
              }
              placeholder={field.placeholder}
              required={field.required}
            />
          );
        })}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit">{t('actions.save')}</Button>
        </div>
      </form>
    </Dialog>
  );
}
