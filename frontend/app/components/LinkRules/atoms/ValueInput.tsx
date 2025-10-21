import React from 'react';
import Input from '@/app/components/ui/Input/Input';
import Select from '@/app/components/ui/Select/Select';
import { TbCheck, TbX } from 'react-icons/tb';
import type { FieldType, ConditionValue, DeviceType } from '@/app/types';

interface ValueInputProps {
  fieldType: FieldType;
  value: ConditionValue;
  onChange: (value: ConditionValue) => void;
  className?: string;
}

export default function ValueInput({ fieldType, value, onChange, className }: ValueInputProps) {
  // Boolean fields (is_bot, is_vpn)
  if (fieldType === 'is_bot' || fieldType === 'is_vpn') {
    return (
      <Select
        options={[
          { label: 'True', value: 'true', leftIcon: <TbCheck size={16} /> },
          { label: 'False', value: 'false', leftIcon: <TbX size={16} /> },
        ]}
        value={value ? 'true' : 'false'}
        onChange={(v) => onChange(v === 'true')}
        buttonClassName={`rounded-xl border-dark/10 ${className || ''}`}
        listClassName="rounded-xl p-1 shadow-lg"
        optionClassName="rounded-lg"
      />
    );
  }

  // Device field
  if (fieldType === 'device') {
    return (
      <Select
        options={[
          { label: 'Mobile', value: 'mobile' },
          { label: 'Tablet', value: 'tablet' },
          { label: 'Desktop', value: 'desktop' },
        ]}
        value={value as DeviceType}
        onChange={(v) => onChange(v as DeviceType)}
        buttonClassName={`rounded-xl border-dark/10 ${className || ''}`}
        listClassName="rounded-xl p-1 shadow-lg"
        optionClassName="rounded-lg"
      />
    );
  }

  // Country field (multiple selection)
  if (fieldType === 'country') {
    const currentValue = Array.isArray(value) ? value.join(', ') : '';
    return (
      <Input
        value={currentValue}
        onChange={(e) => {
          const countries = e.target.value
            .split(',')
            .map((c) => c.trim().toUpperCase())
            .filter((c) => c.length === 2);
          onChange(countries);
        }}
        placeholder="ES, US, FR (comma separated)"
        size="md"
        rounded="xl"
        className={className}
      />
    );
  }

  // Date field
  if (fieldType === 'date') {
    return (
      <Input
        type="datetime-local"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        size="md"
        rounded="xl"
        className={className}
      />
    );
  }

  // Access count field (number)
  if (fieldType === 'access_count') {
    return (
      <Input
        type="number"
        value={String(value || 0)}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        placeholder="0"
        size="md"
        rounded="xl"
        className={className}
      />
    );
  }

  // IP field (text)
  if (fieldType === 'ip') {
    return (
      <Input
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        placeholder="192.168.1.1"
        size="md"
        rounded="xl"
        className={className}
      />
    );
  }

  // Default fallback
  return (
    <Input
      value={value as string}
      onChange={(e) => onChange(e.target.value)}
      size="md"
      rounded="xl"
      className={className}
    />
  );
}
