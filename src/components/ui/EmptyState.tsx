import { useTranslation } from 'react-i18next';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  description?: string;
}

export function EmptyState({ message, description }: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
      <PackageOpen className="w-12 h-12 mb-3 opacity-40" />
      <p className="font-medium">{message || t('empty.noData')}</p>
      <p className="text-sm mt-1">{description || t('empty.addFirst')}</p>
    </div>
  );
}
