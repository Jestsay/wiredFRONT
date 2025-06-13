import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatusItemProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  className?: string;
}

export function StatusItem({ icon: Icon, label, value, className }: StatusItemProps) {
  return (
    <div className={cn("wf-status-item", className)}>
      <Icon className="w-3.5 h-3.5" />
      <span>{value ? `${label}: ${value}` : label}</span>
    </div>
  );
}