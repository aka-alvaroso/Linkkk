import React from 'react';
import Select from '@/app/components/ui/Select/Select';
import { TbWorld, TbDeviceMobile, TbNetwork, TbRobot, TbShield, TbCalendar, TbChartBar } from 'react-icons/tb';
import type { FieldType } from '@/app/types';

interface FieldSelectorProps {
  value: FieldType;
  onChange: (value: FieldType) => void;
  className?: string;
}

const FIELD_OPTIONS = [
  {
    label: 'Country',
    value: 'country' as FieldType,
    leftIcon: <TbWorld size={16} />,
  },
  {
    label: 'Device',
    value: 'device' as FieldType,
    leftIcon: <TbDeviceMobile size={16} />,
  },
  {
    label: 'IP Address',
    value: 'ip' as FieldType,
    leftIcon: <TbNetwork size={16} />,
  },
  {
    label: 'Is Bot',
    value: 'is_bot' as FieldType,
    leftIcon: <TbRobot size={16} />,
  },
  {
    label: 'Is VPN',
    value: 'is_vpn' as FieldType,
    leftIcon: <TbShield size={16} />,
  },
  {
    label: 'Date',
    value: 'date' as FieldType,
    leftIcon: <TbCalendar size={16} />,
  },
  {
    label: 'Access Count',
    value: 'access_count' as FieldType,
    leftIcon: <TbChartBar size={16} />,
  },
];

export default function FieldSelector({ value, onChange, className }: FieldSelectorProps) {
  return (
    <Select
      options={FIELD_OPTIONS}
      value={value}
      onChange={(v) => onChange(v as FieldType)}
      buttonClassName={`rounded-xl border-dark/10 ${className || ''}`}
      listClassName="rounded-xl p-1 shadow-lg"
      optionClassName="rounded-lg"
    />
  );
}
