import React from 'react';
import Select from '@/app/components/ui/Select/Select';
import type { OperatorType, FieldType } from '@/app/types';

interface OperatorSelectorProps {
  value: OperatorType;
  onChange: (value: OperatorType) => void;
  fieldType: FieldType;
  className?: string;
}

// Operators available for each field type
const FIELD_OPERATORS: Record<FieldType, OperatorType[]> = {
  country: ['in', 'not_in'],
  device: ['equals', 'not_equals'],
  ip: ['equals', 'not_equals'],
  is_bot: ['equals'],
  is_vpn: ['equals'],
  date: ['before', 'after', 'equals'],
  access_count: ['equals', 'greater_than', 'less_than'],
};

const OPERATOR_LABELS: Record<OperatorType, string> = {
  equals: 'is',
  not_equals: 'is not',
  in: 'is in',
  not_in: 'is not in',
  greater_than: 'is greater than',
  less_than: 'is less than',
  before: 'is before',
  after: 'is after',
  contains: 'contains',
  not_contains: 'does not contain',
};

export default function OperatorSelector({ value, onChange, fieldType, className }: OperatorSelectorProps) {
  const availableOperators = FIELD_OPERATORS[fieldType] || [];

  const options = availableOperators.map((op) => ({
    label: OPERATOR_LABELS[op],
    value: op,
  }));

  return (
    <Select
      options={options}
      value={value}
      onChange={(v) => onChange(v as OperatorType)}
      buttonClassName={`rounded-xl border-dark/10 ${className || ''}`}
      listClassName="rounded-xl p-1 shadow-lg"
      optionClassName="rounded-lg"
    />
  );
}
