/**
 * RuleCondition Component
 * Displays and edits a single rule condition (field, operator, value)
 */

import React from 'react';
import Select from '../ui/Select/Select';
import Input from '../ui/Input/Input';
import { TbTrash, TbCircleDashedCheck, TbWorld, TbDeviceMobile, TbRobot, TbShieldLock, TbCalendar, TbClick, TbDots, TbServer, TbBolt, TbLink } from 'react-icons/tb';
import { RuleCondition as RuleConditionType, FieldType, OperatorType, DeviceType, ConditionValue, BurstValue, QueryParamValue } from '@/app/types/linkRules';
import { useTranslations } from 'next-intl';

interface RuleConditionProps {
  condition: RuleConditionType;
  onChange: (condition: RuleConditionType) => void;
  onDelete?: () => void;
}

export function RuleCondition({ condition, onChange, onDelete }: RuleConditionProps) {
  const t = useTranslations('RuleCondition');

  // Field options
  const FIELD_OPTIONS = [
    { label: t('fieldAlways'), value: 'always', leftIcon: <TbCircleDashedCheck size={16} className='group-hover:color-primary' /> },
    { label: t('fieldCountry'), value: 'country', leftIcon: <TbWorld size={16} className='group-hover:color-primary' /> },
    { label: t('fieldDevice'), value: 'device', leftIcon: <TbDeviceMobile size={16} /> },
    { label: t('fieldIp'), value: 'ip', leftIcon: <TbDots size={16} /> },
    { label: t('fieldIsBot'), value: 'is_bot', leftIcon: <TbRobot size={16} /> },
    { label: t('fieldIsVpn'), value: 'is_vpn', leftIcon: <TbShieldLock size={16} /> },
    { label: t('fieldIsDatacenter'), value: 'is_datacenter', leftIcon: <TbServer size={16} /> },
    { label: t('fieldBurst'), value: 'burst', leftIcon: <TbBolt size={16} /> },
    { label: t('fieldDate'), value: 'date', leftIcon: <TbCalendar size={16} /> },
    { label: t('fieldAccessCount'), value: 'access_count', leftIcon: <TbClick size={16} /> },
    { label: t('fieldQueryParam'), value: 'query_param', leftIcon: <TbLink size={16} /> },
  ];

  // Operator options per field type
  const OPERATOR_OPTIONS: Record<FieldType, { label: string; value: OperatorType }[]> = {
    always: [{ label: '', value: 'equals' }],
    country: [
      { label: t('operatorIn'), value: 'in' },
      { label: t('operatorNotIn'), value: 'not_in' },
    ],
    device: [
      { label: t('operatorEquals'), value: 'equals' },
      { label: t('operatorNotEquals'), value: 'not_equals' },
    ],
    ip: [
      { label: t('operatorEquals'), value: 'equals' },
      { label: t('operatorNotEquals'), value: 'not_equals' },
      { label: t('operatorIn'), value: 'in' },
      { label: t('operatorNotIn'), value: 'not_in' },
    ],
    is_bot: [{ label: t('operatorEquals'), value: 'equals' }],
    is_vpn: [{ label: t('operatorEquals'), value: 'equals' }],
    is_datacenter: [{ label: t('operatorEquals'), value: 'equals' }],
    burst: [{ label: t('operatorBurst'), value: 'equals' }],
    date: [
      { label: t('operatorBefore'), value: 'before' },
      { label: t('operatorAfter'), value: 'after' },
    ],
    access_count: [
      { label: t('operatorEquals'), value: 'equals' },
      { label: t('operatorGreaterThan'), value: 'greater_than' },
      { label: t('operatorLessThan'), value: 'less_than' },
    ],
    query_param: [
      { label: t('operatorEquals'), value: 'equals' },
      { label: t('operatorNotEquals'), value: 'not_equals' },
      { label: t('operatorIn'), value: 'in' },
      { label: t('operatorNotIn'), value: 'not_in' },
      { label: t('operatorContains'), value: 'contains' },
      { label: t('operatorNotContains'), value: 'not_contains' },
    ],
  };

  // Device options
  const DEVICE_OPTIONS = [
    { label: t('deviceMobile'), value: 'mobile' },
    { label: t('deviceTablet'), value: 'tablet' },
    { label: t('deviceDesktop'), value: 'desktop' },
  ];

  // Boolean options
  const BOOLEAN_OPTIONS = [
    { label: t('yes'), value: 'true' },
    { label: t('no'), value: 'false' },
  ];

  const handleFieldChange = (newField: React.SetStateAction<string | number | null>) => {
    // Handle both direct values and functions (SetStateAction)
    const resolvedField = typeof newField === 'function'
      ? newField(condition.field)
      : newField;

    const fieldType = resolvedField as FieldType;
    const availableOperators = OPERATOR_OPTIONS[fieldType];

    // Set default value based on field type
    let defaultValue: ConditionValue = '';
    if (fieldType === 'always') defaultValue = true;
    else if (fieldType === 'country') defaultValue = '';
    else if (fieldType === 'device') defaultValue = 'mobile';
    else if (fieldType === 'is_bot' || fieldType === 'is_vpn' || fieldType === 'is_datacenter') defaultValue = false;
    else if (fieldType === 'burst') defaultValue = { links: 3, seconds: 10 };
    else if (fieldType === 'access_count') defaultValue = 0;
    else if (fieldType === 'query_param') defaultValue = { key: 'utm_source', value: '' };

    onChange({
      field: fieldType,
      operator: availableOperators[0].value,
      value: defaultValue,
    });
  };

  const handleOperatorChange = (newOperator: React.SetStateAction<string | number | null>) => {
    // Handle both direct values and functions (SetStateAction)
    const resolvedOperator = typeof newOperator === 'function'
      ? newOperator(condition.operator)
      : newOperator;

    onChange({
      ...condition,
      operator: resolvedOperator as OperatorType,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleValueChange = (newValue: any) => {
    // Handle both direct values and functions (SetStateAction) for Select compatibility
    const resolvedValue = typeof newValue === 'function'
      ? newValue(condition.value)
      : newValue;

    onChange({
      ...condition,
      value: resolvedValue,
    });
  };

  // Render value input based on field type
  const renderValueInput = () => {
    switch (condition.field) {
      case 'always':
        return (
          <p className="w-auto text-xs text-dark/50 italic whitespace-nowrap">
            {t('noConditionsRequired')}
          </p>
        );

      case 'country':
        return (
          <Input
            placeholder={t('countryPlaceholder')}
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
      case 'is_datacenter':
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ type: "datetime-local" } as any)}
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ type: "number", min: "0" } as any)}
            value={condition.value as number}
            onChange={(e) => handleValueChange(parseInt(e.target.value) || 0)}
            size="sm"
            rounded="lg"
            className='bg-light border border-dark/10 text-sm px-2 py-1 rounded-lg w-20 hover:border-dark/20'
          />
        );

      case 'burst': {
        const burst = (condition.value as BurstValue) ?? { links: 3, seconds: 10 };
        const numberInputClass = 'bg-light border border-dark/10 text-sm px-2 py-1 rounded-lg w-16 hover:border-dark/20';
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Input
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ type: "number", min: "2", max: "50" } as any)}
              value={burst.links}
              onChange={(e) => handleValueChange({ ...burst, links: parseInt(e.target.value) || 2 })}
              size="sm"
              rounded="lg"
              className={numberInputClass}
            />
            <span className="text-xs text-dark/60">{t('burstLinksIn')}</span>
            <Input
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ type: "number", min: "1", max: "300" } as any)}
              value={burst.seconds}
              onChange={(e) => handleValueChange({ ...burst, seconds: parseInt(e.target.value) || 1 })}
              size="sm"
              rounded="lg"
              className={numberInputClass}
            />
            <span className="text-xs text-dark/60">{t('burstSeconds')}</span>
          </div>
        );
      }

      case 'query_param': {
        const param = (condition.value as QueryParamValue) ?? { key: '', value: '' };
        const isList = condition.operator === 'in' || condition.operator === 'not_in';
        const inputClass = 'bg-light border border-dark/10 text-sm px-2 py-1 rounded-lg hover:border-dark/20';
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <Input
              placeholder={t('queryParamKeyPlaceholder')}
              aria-label={t('queryParamKeyPlaceholder')}
              value={param.key}
              onChange={(e) => handleValueChange({ ...param, key: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) })}
              size="sm"
              rounded="lg"
              autoComplete="off"
              spellCheck={false}
              className={`${inputClass} w-36`}
            />
            <Input
              placeholder={isList ? t('queryParamListPlaceholder') : t('queryParamValuePlaceholder')}
              aria-label={t('queryParamValuePlaceholder')}
              value={Array.isArray(param.value) ? param.value.join(', ') : param.value}
              onChange={(e) => handleValueChange({ ...param, value: e.target.value })}
              size="sm"
              rounded="lg"
              autoComplete="off"
              spellCheck={false}
              className={`${inputClass} ${isList ? 'w-56' : 'w-40'}`}
            />
          </div>
        );
      }

      case 'ip':
        return (
          <Input
            placeholder={condition.operator === 'in' || condition.operator === 'not_in' ? t('ipListPlaceholder') : t('ipPlaceholder')}
            value={condition.value as string}
            onChange={(e) => handleValueChange(e.target.value)}
            size="sm"
            rounded="lg"
            className={`bg-light border border-dark/10 text-sm px-2 py-1 rounded-lg hover:border-dark/20 ${condition.operator === 'in' || condition.operator === 'not_in' ? 'w-56' : 'w-32'}`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="inline-flex flex-col sm:flex-row sm:flex-wrap max-w-full items-start sm:items-center gap-1.5 text-sm">
      {/* Field Select */}
      <Select
        options={FIELD_OPTIONS}
        value={condition.field}
        onChange={handleFieldChange}
        maxHeight={150}
        useFixedPosition={true}
        buttonClassName="w-auto rounded-lg text-sm border border-dark/10 bg-light px-2 py-1 hover:border-dark/20 whitespace-nowrap"
        listClassName="rounded-lg min-w-48 max-w-48 shadow-lg h-48 overflow-auto"
        optionClassName='rounded-md p-1.5 text-sm hover:color-primary group'
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
          title={t('deleteCondition')}
        >
          <TbTrash size={14} />
        </button>
      )}
    </div>
  );
}
