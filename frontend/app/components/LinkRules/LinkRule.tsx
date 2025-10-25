/**
 * LinkRule Component
 * Displays and edits a complete rule with conditions and actions
 */

import React, { useState } from 'react';
import { RuleCondition } from './RuleCondition';
import { RuleAction } from './RuleAction';
import Button from '../ui/Button/Button';
import Switch from '../ui/Switch/Switch';
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
}

export function LinkRule({ rule, priority, onChange, onDelete, dragHandleProps }: LinkRuleProps) {
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
    if (rule.conditions.length === 1) return; // Must have at least 1 condition
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
    <div className="relative bg-dark/5 rounded-2xl p-3">
      {/* Delete Rule Button */}
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 p-1.5 text-dark/40 hover:text-danger hover:cursor-pointer transition-colors rounded-full hover:bg-light border border-transparent hover:border-dark/10 z-10"
        title="Delete rule"
      >
        <TbTrash size={20} />
      </button>

      {/* Main Content */}
      <div className="flex gap-4">

        {/* Conditions and Actions */}
        <div className="flex-1 space-y-6">
          {/* Conditions Section */}
          <div className="space-y-3">
            <div className="font-black text-dark uppercase tracking-wide">
              If
            </div>

            {/* Conditions List */}
            <div className="space-y-2">
              {rule.conditions.map((condition, index) => (
                <RuleCondition
                  key={index}
                  condition={condition}
                  onChange={(newCondition) => handleConditionChange(index, newCondition)}
                  onDelete={rule.conditions.length > 1 ? () => handleDeleteCondition(index) : undefined}
                />
              ))}
            </div>

            {/* Add Condition Button */}
            <Button
              variant="ghost"
              size="sm"
              rounded="2xl"
              leftIcon={<TbPlus size={16} />}
              onClick={handleAddCondition}
              className="w-40 text-dark/40 hover:text-dark/70 border border-dashed border-dark/20"
            >
              Add Condition
            </Button>
          </div>

          {/* Main Action */}
          <RuleAction
            actionType={rule.actionType}
            actionSettings={rule.actionSettings}
            onChange={handleActionChange}
            label="Then"
          />

          {/* Else Action (Optional) */}
          {showElseAction ? (
            <div className="relative">
              <button
                onClick={handleRemoveElseAction}
                className="absolute -top-2 right-0 p-1 text-dark/40 hover:text-danger hover:cursor-pointer transition-colors rounded-full bg-light border border-dark/10"
                title="Remove otherwise action"
              >
                <TbTrash size={20} />
              </button>
              <RuleAction
                actionType={rule.elseActionType || 'redirect'}
                actionSettings={rule.elseActionSettings || { url: '' }}
                onChange={handleElseActionChange}
                label="Else"
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              rounded="2xl"
              leftIcon={<TbPlus size={16} />}
              onClick={handleAddElseAction}
              className="w-48 text-dark/40 hover:text-dark/70 border border-dashed border-dark/20"
            >
              Add &#34;Else&#34; Action
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
