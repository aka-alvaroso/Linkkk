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
  { label: 'Always', value: 'always' },
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
  always: [{ label: '', value: 'equals' }], // No operator for "always"
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
    if (fieldType === 'always') defaultValue = true;
    else if (fieldType === 'country') defaultValue = '';
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
      case 'always':
        return (
          <p className="w-auto text-xs text-dark/50 italic whitespace-nowrap">
            (no conditions required)
          </p>
        );

      case 'country':
        return (
          <Input
            placeholder="ES, US, FR"
            value={condition.value as string || ''}
            onChange={(e) => {
              handleValueChange(e.target.value.toUpperCase());
            }}
            className='bg-light border border-dark/10 text-sm px-2 py-1 rounded-lg w-32 hover:border-dark/20'
            size="sm"
            rounded="lg"
          />
        );

      case 'device':
        return (
          <Select
            options={DEVICE_OPTIONS}
            value={condition.value as DeviceType}
            onChange={handleValueChange}
            buttonClassName="rounded-lg text-sm border border-dark/10 bg-light px-2 py-1 hover:border-dark/20"
            listClassName="rounded-lg w-auto shadow-lg"
            optionClassName='rounded-md p-1.5 text-sm'
          />
        );

      case 'is_bot':
      case 'is_vpn':
        return (
          <Select
            options={BOOLEAN_OPTIONS}
            value={condition.value ? 'true' : 'false'}
            onChange={(v) => handleValueChange(v === 'true')}
            buttonClassName="w-auto rounded-lg text-sm border border-dark/10 bg-light px-2 py-1 hover:border-dark/20"
            listClassName="rounded-lg w-auto shadow-lg"
            optionClassName='rounded-md p-1.5 text-sm'
          />
        );

      case 'date':
        return (
          <Input
            type="datetime-local"
            value={condition.value as string}
            onChange={(e) => handleValueChange(e.target.value)}
            size="sm"
            rounded="lg"
            className='bg-light border border-dark/10 text-sm px-2 py-1 rounded-lg hover:border-dark/20'
          />
        );

      case 'access_count':
        return (
          <Input
            type="number"
            min="0"
            value={condition.value as number}
            onChange={(e) => handleValueChange(parseInt(e.target.value) || 0)}
            size="sm"
            rounded="lg"
            className='bg-light border border-dark/10 text-sm px-2 py-1 rounded-lg w-20 hover:border-dark/20'
          />
        );

      case 'ip':
        return (
          <Input
            placeholder="192.168.1.1"
            value={condition.value as string}
            onChange={(e) => handleValueChange(e.target.value)}
            size="sm"
            rounded="lg"
            className='bg-light border border-dark/10 text-sm px-2 py-1 rounded-lg w-32 hover:border-dark/20'
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-1.5 text-sm">
      {/* Field Select */}
      <Select
        options={FIELD_OPTIONS}
        value={condition.field}
        onChange={handleFieldChange}
        buttonClassName="w-auto rounded-lg text-sm border border-dark/10 bg-light px-2 py-1 hover:border-dark/20 whitespace-nowrap"
        listClassName="rounded-lg w-auto shadow-lg h-48 overflow-auto"
        optionClassName='rounded-md p-1.5 text-sm'
      />

      {/* Operator Select - Hide for "always" */}
      {condition.field !== 'always' && (
        <Select
          options={OPERATOR_OPTIONS[condition.field]}
          value={condition.operator}
          onChange={handleOperatorChange}
          buttonClassName="w-auto rounded-lg text-sm border border-dark/10 bg-light px-2 py-1 hover:border-dark/20 whitespace-nowrap"
          listClassName="rounded-lg w-auto shadow-lg"
          optionClassName='rounded-md p-1.5 text-sm'
        />
      )}

      {/* Value Input */}
      {renderValueInput()}

      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="p-1 text-dark/30 hover:text-danger transition-colors rounded-md hover:bg-danger/10"
          title="Delete condition"
        >
          <TbTrash size={14} />
        </button>
      )}
    </div>
  );
}
