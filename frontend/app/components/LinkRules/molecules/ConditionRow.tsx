import React, { useEffect } from 'react';
import { TbTrash } from 'react-icons/tb';
import Button from '@/app/components/ui/Button/Button';
import FieldSelector from '../atoms/FieldSelector';
import OperatorSelector from '../atoms/OperatorSelector';
import ValueInput from '../atoms/ValueInput';
import type { RuleCondition, FieldType, OperatorType, ConditionValue } from '@/app/types';
import * as motion from 'motion/react-client';

interface ConditionRowProps {
  condition: Omit<RuleCondition, 'id' | 'ruleId'>;
  onChange: (condition: Omit<RuleCondition, 'id' | 'ruleId'>) => void;
  onRemove: () => void;
  showRemove?: boolean;
  index: number;
}

// Default values for each field type
const getDefaultValue = (fieldType: FieldType): ConditionValue => {
  switch (fieldType) {
    case 'country':
      return [];
    case 'device':
      return 'mobile';
    case 'ip':
      return '';
    case 'is_bot':
    case 'is_vpn':
      return false;
    case 'date':
      return new Date().toISOString().slice(0, 16);
    case 'access_count':
      return 0;
    default:
      return '';
  }
};

// Default operator for each field type
const getDefaultOperator = (fieldType: FieldType): OperatorType => {
  switch (fieldType) {
    case 'country':
      return 'in';
    case 'device':
      return 'equals';
    case 'ip':
      return 'equals';
    case 'is_bot':
    case 'is_vpn':
      return 'equals';
    case 'date':
      return 'after';
    case 'access_count':
      return 'greater_than';
    default:
      return 'equals';
  }
};

export default function ConditionRow({ condition, onChange, onRemove, showRemove = true, index }: ConditionRowProps) {
  // When field type changes, reset operator and value to appropriate defaults
  useEffect(() => {
    const defaultOperator = getDefaultOperator(condition.field);
    const defaultValue = getDefaultValue(condition.field);

    // Only update if the current operator is not valid for the new field type
    onChange({
      ...condition,
      operator: defaultOperator,
      value: defaultValue,
    });
  }, [condition.field]);

  const handleFieldChange = (field: FieldType) => {
    const defaultOperator = getDefaultOperator(field);
    const defaultValue = getDefaultValue(field);
    onChange({
      field,
      operator: defaultOperator,
      value: defaultValue,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="flex items-center gap-2"
    >
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
        <FieldSelector
          value={condition.field}
          onChange={handleFieldChange}
        />
        <OperatorSelector
          value={condition.operator}
          onChange={(operator) => onChange({ ...condition, operator })}
          fieldType={condition.field}
        />
        <ValueInput
          fieldType={condition.field}
          value={condition.value}
          onChange={(value) => onChange({ ...condition, value })}
        />
      </div>

      {showRemove && (
        <Button
          iconOnly
          variant="ghost"
          size="sm"
          rounded="xl"
          leftIcon={<TbTrash size={18} />}
          className="text-danger hover:bg-danger/10"
          onClick={onRemove}
        />
      )}
    </motion.div>
  );
}
