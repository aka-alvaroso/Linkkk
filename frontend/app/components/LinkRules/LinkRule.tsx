/**
 * LinkRule Component
 * Compact summary view of a rule with expandable inline editor
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TbGripVertical, TbX, TbChevronDown, TbPlus, TbTrash, TbCircleDashed, TbCircleDashedCheck } from 'react-icons/tb';
import Button from '../ui/Button/Button';
import { LinkRule as LinkRuleType, RuleCondition as RuleConditionType, MatchType, ActionType, ActionSettings } from '@/app/types/linkRules';
import { useTranslations } from 'next-intl';
import { getRuleConditionsSummary, getActionSummary } from '@/app/utils/ruleSummary';
import { RuleCondition } from './RuleCondition';
import { RuleAction } from './RuleAction';
import Select from '../ui/Select/Select';
import Input from '../ui/Input/Input';

interface LinkRuleProps {
  rule: LinkRuleType;
  priority: number;
  onChange: (rule: LinkRuleType) => void;
  onDelete: () => void;
  maxConditions: number | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleProps?: any;
}

export function LinkRule({ rule, priority, onChange, onDelete, maxConditions, isExpanded, onToggleExpand, dragHandleProps }: LinkRuleProps) {
  const t = useTranslations('LinkRule');

  const conditionsSummary = getRuleConditionsSummary(rule.conditions, rule.match);
  const actionSummary = getActionSummary(rule.actionType, rule.actionSettings);
  const elseActionSummary = rule.elseActionType && rule.elseActionSettings
    ? getActionSummary(rule.elseActionType, rule.elseActionSettings)
    : null;

  const displayName = rule.name || `${t('rule')} ${priority}`;

  // Toggle enabled
  const handleToggleEnabled = (enabled: boolean) => {
    onChange({ ...rule, enabled });
  };

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...rule, name: e.target.value });
  };

  // Handle match type change
  const handleMatchChange = (match: MatchType) => {
    onChange({ ...rule, match });
  };

  // Handle condition change
  const handleConditionChange = (index: number, condition: RuleConditionType) => {
    const newConditions = [...rule.conditions];
    newConditions[index] = condition;
    onChange({ ...rule, conditions: newConditions });
  };

  // Add new condition
  const handleAddCondition = () => {
    const newCondition: RuleConditionType = {
      field: 'country',
      operator: 'in',
      value: []
    };
    onChange({ ...rule, conditions: [...rule.conditions, newCondition] });
  };

  // Delete condition
  const handleDeleteCondition = (index: number) => {
    const newConditions = rule.conditions.filter((_, i) => i !== index);
    onChange({ ...rule, conditions: newConditions });
  };

  // Handle main action change
  const handleActionChange = (type: ActionType, settings: ActionSettings) => {
    onChange({
      ...rule,
      actionType: type,
      actionSettings: settings
    });
  };

  // Handle else action change
  const handleElseActionChange = (type: ActionType, settings: ActionSettings) => {
    onChange({
      ...rule,
      elseActionType: type,
      elseActionSettings: settings
    });
  };

  // Handle remove else action
  const handleRemoveElseAction = () => {
    onChange({
      ...rule,
      elseActionType: null,
      elseActionSettings: null
    });
  };

  // Handle add else action
  const handleAddElseAction = () => {
    onChange({
      ...rule,
      elseActionType: 'redirect',
      elseActionSettings: { url: '' }
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: rule.enabled ? 1 : 0.6, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative rounded-2xl bg-dark/5 p-4 transition-all ${!rule.enabled ? 'grayscale' : ''}`}
      onClick={onToggleExpand}
    >
      {/* Compact Header */}
      <div className='sm:hidden w-full flex items-center justify-between'>
        <span className=" font-black italic text-dark truncate">
          {displayName}
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-dark/30"
        >
          <TbChevronDown size={20} />
        </motion.div>
      </div>
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...dragHandleProps}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing text-dark/30 hover:text-dark/50 transition-colors flex-shrink-0"
        >
          <TbGripVertical size={20} />
        </button>

        {/* Rule Info */}
        <div className="hidden sm:flex items-center flex-grow min-w-0 hover:cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="font-black italic text-dark truncate">
              {displayName}
            </span>
          </div>
          {!isExpanded && (
            <div className="ml-2 text-sm text-dark/60 truncate">
              <span>{conditionsSummary}</span>
              <span className="mx-1">→</span>
              <span>{actionSummary}</span>
              {elseActionSummary && (
                <>
                  <span className="mx-1 text-dark/40">|</span>
                  <span className="text-dark/40">{t('else')}: {elseActionSummary}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Toggle Enabled Button */}
          <Button
            variant="solid"
            size="xs"
            rounded="xl"
            leftIcon={rule.enabled ? <TbCircleDashedCheck size={16} /> : <TbCircleDashed size={16} />}
            className={rule.enabled ? 'bg-success text-dark' : 'bg-danger text-light'}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleEnabled(!rule.enabled);
            }}
          >
            {rule.enabled ? t('active') : t('inactive')}
          </Button>

            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-dark/30 p-1.5 hover:cursor-pointer hover:text-dark/50 transition-colors h"
            >
              <TbChevronDown size={20} />
            </motion.div>

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-dark/30 hover:cursor-pointer hover:text-danger transition-colors rounded-md hover:bg-danger/10"
            title={t('deleteRule')}
          >
            <TbX size={18} />
          </motion.button>
        </div>
      </div>

      {/* Expanded Editor */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-4 mt-4 border-t border-dark/10 space-y-4">
              {/* Rule Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-dark/70 whitespace-nowrap">
                  {t('ruleName')}
                </label>
                <Input
                  value={rule.name || ''}
                  onChange={handleNameChange}
                  placeholder={t('ruleNamePlaceholder')}
                  size="sm"
                  rounded="lg"
                  className="w-full max-w-xs"
                />
              </div>

              {/* Conditions Section */}
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-2">
                  {t('conditions')}
                </label>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {rule.conditions.map((condition, index) => (
                      <motion.div
                        key={`condition-${index}`}
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, x: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="flex items-center gap-2 flex-wrap"
                      >
                        {/* First condition shows "If", rest show AND/OR */}
                        {index === 0 ? (
                          <span className="text-sm font-black italic text-dark uppercase tracking-wide">
                            {t('if')}
                          </span>
                        ) : index === 1 ? (
                          <Select
                            options={[
                              { label: t('and'), value: 'AND' },
                              { label: t('or'), value: 'OR' }
                            ]}
                            value={rule.match}
                            onChange={(value) => handleMatchChange(value as MatchType)}
                            className='w-12'
                            buttonClassName="rounded-lg text-sm border border-dark/10 bg-light px-2 py-1 hover:border-dark/20 w-12"
                            listClassName="rounded-lg w-auto shadow-lg"
                            optionClassName="rounded-md p-1.5 text-sm"
                          />
                        ) : (
                          <span className="text-sm font-medium text-dark/50 w-12 text-center">
                            {rule.match}
                          </span>
                        )}

                        <RuleCondition
                          condition={condition}
                          onChange={(newCondition) => handleConditionChange(index, newCondition)}
                          onDelete={() => handleDeleteCondition(index)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add Condition Button */}
                  <button
                    onClick={handleAddCondition}
                    disabled={maxConditions !== null && rule.conditions.length >= maxConditions}
                    className="inline-flex items-center gap-1 ml-6 px-3 py-1 text-sm text-dark/40 hover:text-dark/70 border border-dashed border-dark/20 rounded-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark/5 transition-colors"
                    title={maxConditions !== null && rule.conditions.length >= maxConditions ? t('maxConditionsTitle', { count: maxConditions, plural: maxConditions === 1 ? t('condition') : t('conditions') }) : ''}
                  >
                    <TbPlus size={14} />
                    <span>{t('addCondition')}</span>
                  </button>
                </div>
              </div>

              {/* Main Action */}
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-2">
                  {t('action')}
                </label>
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="text-sm font-black italic text-dark uppercase tracking-wide py-2">
                    {t('then')}
                  </span>
                  <RuleAction
                    actionType={rule.actionType}
                    actionSettings={rule.actionSettings}
                    onChange={handleActionChange}
                  />
                </div>
              </div>

              {/* Else Action (Optional) */}
              <div>
                {rule.elseActionType ? (
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-sm font-black italic text-dark uppercase tracking-wide py-2">
                      {t('else')}
                    </span>
                    <RuleAction
                      actionType={rule.elseActionType}
                      actionSettings={rule.elseActionSettings || { url: '' }}
                      onChange={handleElseActionChange}
                    />
                    <button
                      onClick={handleRemoveElseAction}
                      className="p-1 text-dark/30 hover:text-danger transition-colors rounded-md hover:bg-danger/10 mt-1.5"
                      title={t('removeElseAction')}
                    >
                      <TbTrash size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddElseAction}
                    className="inline-flex items-center gap-1 ml-6 px-3 py-1 text-sm text-dark/40 hover:text-dark/70 border border-dashed border-dark/20 rounded-lg hover:cursor-pointer hover:bg-dark/5 transition-colors"
                  >
                    <TbPlus size={14} />
                    <span>{t('addElseAction')}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
