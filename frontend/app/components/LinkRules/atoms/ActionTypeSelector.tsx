import React from 'react';
import Select from '@/app/components/ui/Select/Select';
import { TbArrowForward, TbLock, TbBell, TbShieldLock } from 'react-icons/tb';
import type { ActionType } from '@/app/types';

interface ActionTypeSelectorProps {
  value: ActionType;
  onChange: (value: ActionType) => void;
  className?: string;
}

const ACTION_OPTIONS = [
  {
    label: 'Redirect',
    value: 'redirect' as ActionType,
    leftIcon: <TbArrowForward size={16} />,
  },
  {
    label: 'Block Access',
    value: 'block_access' as ActionType,
    leftIcon: <TbLock size={16} />,
  },
  {
    label: 'Password Gate',
    value: 'password_gate' as ActionType,
    leftIcon: <TbShieldLock size={16} />,
  },
  {
    label: 'Notify Webhook',
    value: 'notify' as ActionType,
    leftIcon: <TbBell size={16} />,
  },
];

export default function ActionTypeSelector({ value, onChange, className }: ActionTypeSelectorProps) {
  return (
    <Select
      options={ACTION_OPTIONS}
      value={value}
      onChange={(v) => onChange(v as ActionType)}
      buttonClassName={`rounded-xl border-dark/10 ${className || ''}`}
      listClassName="rounded-xl p-1 shadow-lg"
      optionClassName="rounded-lg"
    />
  );
}
