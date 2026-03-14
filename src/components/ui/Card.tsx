import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border bg-surface p-4',
        onClick && 'cursor-pointer hover:border-primary-300 transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
}
