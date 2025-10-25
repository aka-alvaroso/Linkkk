/**
 * RuleCondition Component
 * Displays and edits a single rule condition (field, operator, value)
 */

import React from 'react';
import Select from '../ui/Select/Select';
import Input from '../ui/Input/Input';
import { TbTrash } from 'react-icons/tb';
import { RuleCondition as RuleConditionType, FieldType, OperatorType, DeviceType } from '@/app/types/linkRules';

interface RuleConditionProps {
  condition: RuleConditionType;
  onChange: (condition: RuleConditionType) => void;
  onDelete?: () => void;
}

// Field options
const FIELD_OPTIONS = [
  { label: 'Country', value: 'country' },
  { label: 'Device', value: 'device' },
  { label: 'IP Address', value: 'ip' },
  { label: 'Is Bot', value: 'is_bot' },
  { label: 'Is VPN', value: 'is_vpn' },
  { label: 'Date', value: 'date' },
  { label: 'Access Count', value: 'access_count' },
];

// Operator options per field type
const OPERATOR_OPTIONS: Record<FieldType, { label: string; value: OperatorType }[]> = {
  country: [
    { label: 'is one of', value: 'in' },
    { label: 'is not one of', value: 'not_in' },
  ],
  device: [
    { label: 'equals', value: 'equals' },
    { label: 'not equals', value: 'not_equals' },
  ],
  ip: [
    { label: 'equals', value: 'equals' },
    { label: 'not equals', value: 'not_equals' },
    { label: 'contains', value: 'contains' },
  ],
  is_bot: [{ label: 'equals', value: 'equals' }],
  is_vpn: [{ label: 'equals', value: 'equals' }],
  date: [
    { label: 'before', value: 'before' },
    { label: 'after', value: 'after' },
  ],
  access_count: [
    { label: 'equals', value: 'equals' },
    { label: 'greater than', value: 'greater_than' },
    { label: 'less than', value: 'less_than' },
  ],
};

// Device options
const DEVICE_OPTIONS = [
  { label: 'Mobile', value: 'mobile' },
  { label: 'Tablet', value: 'tablet' },
  { label: 'Desktop', value: 'desktop' },
];

// Boolean options
const BOOLEAN_OPTIONS = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

export function RuleCondition({ condition, onChange, onDelete }: RuleConditionProps) {
  const handleFieldChange = (newField: string | number | null) => {
    const fieldType = newField as FieldType;
    const availableOperators = OPERATOR_OPTIONS[fieldType];

    // Set default value based on field type
    let defaultValue: any = '';
    if (fieldType === 'country') defaultValue = [];
    else if (fieldType === 'device') defaultValue = 'mobile';
    else if (fieldType === 'is_bot' || fieldType === 'is_vpn') defaultValue = false;
    else if (fieldType === 'access_count') defaultValue = 0;

    onChange({
      field: fieldType,
      operator: availableOperators[0].value,
      value: defaultValue,
    });
  };

  const handleOperatorChange = (newOperator: string | number | null) => {
    onChange({
      ...condition,
      operator: newOperator as OperatorType,
    });
  };

  const handleValueChange = (newValue: any) => {
    onChange({
      ...condition,
      value: newValue,
    });
  };

  // Render value input based on field type
  const renderValueInput = () => {
    switch (condition.field) {
      case 'country':
        return (
          <Input
            placeholder="ES, US, FR (comma separated)"
            value={Array.isArray(condition.value) ? condition.value.join(', ') : ''}
            onChange={(e) => {
              const countries = e.target.value
                .split(',')
                .map(c => c.trim().toUpperCase())
                .filter(c => c.length > 0);
              handleValueChange(countries);
            }}
            className='bg-light border-none outline-none'
            size="md"
            rounded="2xl"
          />
        );

      case 'device':
        return (
          <Select
            options={DEVICE_OPTIONS}
            value={condition.value as DeviceType}
            onChange={handleValueChange}
            className='max-w-30'
            buttonClassName="rounded-2xl border-dark/10 border-none"
            listClassName="rounded-2xl w-auto shadow-none"
            optionClassName='rounded-2xl p-2'
          />
        );

      case 'is_bot':
      case 'is_vpn':
        return (
          <Select
            options={BOOLEAN_OPTIONS}
            value={condition.value ? 'true' : 'false'}
            onChange={(v) => handleValueChange(v === 'true')}
            className='max-w-24'
            buttonClassName="rounded-2xl border-dark/10 border-none"
            listClassName="rounded-2xl w-auto shadow-none"
            optionClassName='rounded-2xl p-2'
          />
        );

      case 'date':
        return (
          <Input
            type="datetime-local"
            value={condition.value as string}
            onChange={(e) => handleValueChange(e.target.value)}
            size="md"
            rounded="2xl"
            className='bg-light border-none outline-none'
          />
        );

      case 'access_count':
        return (
          <Input
            type="number"
            min="0"
            value={condition.value as number}
            onChange={(e) => handleValueChange(parseInt(e.target.value) || 0)}
            size="md"
            rounded="2xl"
            className='bg-light border-none outline-none'
          />
        );

      case 'ip':
        return (
          <Input
            placeholder="192.168.1.1"
            value={condition.value as string}
            onChange={(e) => handleValueChange(e.target.value)}
            size="md"
            rounded="2xl"
            className='bg-light border-none outline-none'
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-2xl hover:bg-dark/5 transition p-1">
      {/* Field Select */}
      <div className="flex-shrink-0">
        <Select
          options={FIELD_OPTIONS}
          value={condition.field}
          onChange={handleFieldChange}
          buttonClassName="rounded-2xl text-sm border-none bg-light p-2"
          listClassName="rounded-2xl w-auto shadow-none"
          optionClassName='rounded-2xl p-2'
        />
      </div>

      {/* Operator Select */}
      <div className="flex-shrink-0">
        <Select
          options={OPERATOR_OPTIONS[condition.field]}
          value={condition.operator}
          onChange={handleOperatorChange}
          buttonClassName="rounded-2xl text-sm border-none bg-light p-2"
          listClassName="rounded-2xl w-auto shadow-none"
          optionClassName='rounded-2xl p-2'
        />
      </div>

      {/* Value Input */}
      <div className="flex-shrink-0">
        {renderValueInput()}
      </div>

      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex-shrink-0 p-2 text-danger transition-colors rounded-xl hover:cursor-pointer hover:bg-danger/10"
          title="Delete condition"
        >
          <TbTrash size={18} />
        </button>
      )}
    </div>
  );
}
