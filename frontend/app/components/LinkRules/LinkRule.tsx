/**
 * LinkRule Component
 * Displays and edits a complete rule with conditions and actions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RuleCondition } from './RuleCondition';
import { RuleAction } from './RuleAction';
import Button from '../ui/Button/Button';
import Switch from '../ui/Switch/Switch';
import Select from '../ui/Select/Select';
import { TbPlus, TbTrash, TbGripVertical } from 'react-icons/tb';
import {
  LinkRule as LinkRuleType,
  RuleCondition as RuleConditionType,
  MatchType,
  ActionType,
  ActionSettings
} from '@/app/types/linkRules';

interface LinkRuleProps {
  rule: LinkRuleType;
  priority: number;
  onChange: (rule: LinkRuleType) => void;
  onDelete: () => void;
  dragHandleProps?: any; // For drag & drop
  maxConditions: number; // Max conditions allowed per rule
}

export function LinkRule({ rule, priority, onChange, onDelete, dragHandleProps, maxConditions }: LinkRuleProps) {
  const [showElseAction, setShowElseAction] = useState(!!rule.elseActionType);

  // Handle enabled toggle
  const handleEnabledToggle = (enabled: boolean) => {
    onChange({ ...rule, enabled });
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
    setShowElseAction(false);
    onChange({
      ...rule,
      elseActionType: null,
      elseActionSettings: null
    });
  };

  // Handle add else action
  const handleAddElseAction = () => {
    setShowElseAction(true);
    onChange({
      ...rule,
      elseActionType: 'redirect',
      elseActionSettings: { url: '{{longUrl}}' }
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative rounded-2xl border border-dark/10 p-4 transition-colors"
    >
      {/* Drag Handle and Delete Button */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <button {...dragHandleProps} className="cursor-grab active:cursor-grabbing text-dark/30 hover:text-dark/50 transition-colors">
            <TbGripVertical size={16} />
          </button>
          <span className="text-sm font-bold text-dark/50">Rule {priority}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDelete}
          className="p-1 text-dark/30 hover:text-danger transition-colors rounded-md hover:bg-danger/10"
          title="Delete rule"
        >
          <TbTrash size={18} />
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="space-y-2">
        {/* Conditions Section - Notion style */}

        {/* Mobile IF and AND/OR selector */}
        <div className="flex sm:hidden items-start gap-2">
          <span className="text-sm font-bold text-dark/70 uppercase tracking-wide">If</span>
          {
            rule.conditions.length > 1 && (
              <Select
                options={[
                  { label: 'AND', value: 'AND' },
                  { label: 'OR', value: 'OR' }
                ]}
                value={rule.match}
                onChange={(value) => handleMatchChange(value as MatchType)}
                className='w-auto'
                buttonClassName="rounded-lg text-sm border border-dark/10 bg-light px-2 py-1 hover:border-dark/20 w-16"
                listClassName="rounded-lg w-auto shadow-lg"
                optionClassName='rounded-md p-2 text-sm'
              />
            )
          }
        </div>

        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {rule.conditions.map((condition, index) => (
              <motion.div
                key={`condition-${index}`}
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, x: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex items-center gap-2"
              >
                {/* First condition shows "If", rest show AND/OR */}
                {index === 0 ? (
                  <span className={`hidden sm:block text-sm font-bold text-dark/70 uppercase tracking-wide text-right ${rule.conditions.length > 1 ? 'w-16' : ''}`}>If</span>
                ) : index === 1 ? (
                  // Second condition has editable AND/OR selector
                  <Select
                    options={[
                      { label: 'And', value: 'AND' },
                      { label: 'Or', value: 'OR' }
                    ]}
                    value={rule.match}
                    onChange={(value) => handleMatchChange(value as MatchType)}
                    className='hidden sm:block w-auto'
                    buttonClassName="rounded-lg text-sm border border-dark/10 bg-light px-2 py-1 hover:border-dark/20 w-16"
                    listClassName="rounded-lg w-auto shadow-lg"
                    optionClassName='rounded-md p-1.5 text-sm'
                  />
                ) : (
                  // Rest show non-editable AND/OR
                  <span className="hidden sm:block text-sm font-medium text-dark/50 w-16 text-right">{rule.match}</span>
                )}

                {/* The condition itself */}
                <RuleCondition
                  condition={condition}
                  onChange={(newCondition) => handleConditionChange(index, newCondition)}
                  onDelete={() => handleDeleteCondition(index)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Condition Button */}
          <div className="flex items-center gap-2">
            <span className={`hidden sm:block ${rule.conditions.length > 1 ? 'w-16' : 'hidden'}`}></span>
            <button
              onClick={handleAddCondition}
              disabled={rule.conditions.length >= maxConditions}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm text-dark/40 hover:text-dark/70 border border-dashed border-dark/20 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark/5 transition-colors"
              title={rule.conditions.length >= maxConditions ? `Maximum ${maxConditions} ${maxConditions === 1 ? 'condition' : 'conditions'} allowed` : ''}
            >
              <TbPlus size={12} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Main Action */}
        <RuleAction
          actionType={rule.actionType}
          actionSettings={rule.actionSettings}
          onChange={handleActionChange}
          label="Then"
        />

        {/* Else Action (Optional) */}
        <AnimatePresence mode="wait">
          {showElseAction ? (
            <motion.div
              key="else-action"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-center gap-2"
            >
              <RuleAction
                actionType={rule.elseActionType || 'redirect'}
                actionSettings={rule.elseActionSettings || { url: '' }}
                onChange={handleElseActionChange}
                label="Else"
              />
              <button
                onClick={handleRemoveElseAction}
                className="p-1 text-dark/30 hover:text-danger transition-colors rounded-md hover:bg-danger/10"
                title="Remove otherwise action"
              >
                <TbTrash size={18} />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="add-else-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleAddElseAction}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm text-dark/40 hover:text-dark/70 border border-dashed border-dark/20 rounded-md hover:bg-dark/5 transition-colors"
            >
              <TbPlus size={12} />
              <span>Add &quot;Else&quot; action</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
