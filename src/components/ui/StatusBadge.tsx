import React from 'react';
import Badge from './Badge';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'trialing':
      case 'paid':
      case 'completed':
        return { variant: 'success' as const, label: status };
      case 'pending_payment':
      case 'pending_approval':
      case 'pending':
      case 'draft':
        return { variant: 'warning' as const, label: status.replace('_', ' ') };
      case 'inactive':
      case 'expired':
      case 'suspended':
      case 'failed':
      case 'cancelled':
        return { variant: 'error' as const, label: status };
      default:
        return { variant: 'default' as const, label: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant}>
      {config.label.charAt(0).toUpperCase() + config.label.slice(1)}
    </Badge>
  );
}