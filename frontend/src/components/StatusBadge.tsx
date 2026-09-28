import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  let config = {
    bg: 'bg-sand-light',
    text: 'text-petroleum-navy',
    border: 'border-sand-warm',
    label: status,
    dot: 'bg-petroleum-navy',
  };

  switch (status) {
    case 'PEAK_PRODUCTION':
      config = {
        bg: 'bg-sage-pale',
        text: 'text-sage-dark',
        border: 'border-sage-green/40',
        label: 'Peak Production',
        dot: 'bg-sage-green',
      };
      break;
    case 'NORMAL':
      config = {
        bg: 'bg-teal-subtle',
        text: 'text-teal-dark',
        border: 'border-teal-muted/40',
        label: 'Normal Operation',
        dot: 'bg-teal-muted',
      };
      break;
    case 'ATTENTION_REQUIRED':
      config = {
        bg: 'bg-amber-pale',
        text: 'text-amber-dark',
        border: 'border-amber-copper/40',
        label: 'Attention Required',
        dot: 'bg-amber-copper',
      };
      break;
    case 'CRITICAL_ALERT':
      config = {
        bg: 'bg-alert-pale',
        text: 'text-alert-dark',
        border: 'border-alert-red/50',
        label: 'Critical Alert',
        dot: 'bg-alert-red animate-pulse',
      };
      break;
    case 'SOAKING':
      config = {
        bg: 'bg-sand-light',
        text: 'text-sand-dark',
        border: 'border-sand-warm/60',
        label: 'Steam Soaking',
        dot: 'bg-sand-dark',
      };
      break;
    case 'STEAM_INJECTION':
      config = {
        bg: 'bg-amber-pale',
        text: 'text-amber-copper',
        border: 'border-amber-copper/50',
        label: 'Steam Injection',
        dot: 'bg-amber-copper animate-pulse',
      };
      break;
    default:
      config = {
        bg: 'bg-desert-beige',
        text: 'text-petroleum-navy',
        border: 'border-sand-muted',
        label: status.replace(/_/g, ' '),
        dot: 'bg-petroleum-light',
      };
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-sm ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
