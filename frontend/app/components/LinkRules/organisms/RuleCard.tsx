import React, { useState } from 'react';
import { TbTrash, TbPlus, TbGripVertical, TbToggleLeft, TbToggleRight } from 'react-icons/tb';
import Button from '@/app/components/ui/Button/Button';
import Select from '@/app/components/ui/Select/Select';
import Input from '@/app/components/ui/Input/Input';
import ConditionRow from '../molecules/ConditionRow';
import ActionRow from '../molecules/ActionRow';
import type { LinkRule, MatchType, RuleCondition, ActionType, ActionSettings } from '@/app/types';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';

interface RuleCardProps {
  rule: Partial<LinkRule>;
  onChange: (rule: Partial<LinkRule>) => void;
  onRemove: () => void;
  index: number;
  isNew?: boolean;
}

export default function RuleCard({ rule, onChange, onRemove, index, isNew = false }: RuleCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const conditions = rule.conditions || [];
  const hasConditions = conditions.length > 0;

  const addCondition = () => {
    const newCondition: Omit<RuleCondition, 'id' | 'ruleId'> = {
      field: 'country',
      operator: 'in',
      value: [],
    };
    onChange({
      ...rule,
      conditions: [...conditions, newCondition],
    });
  };

  const updateCondition = (idx: number, condition: Omit<RuleCondition, 'id' | 'ruleId'>) => {
    const newConditions = [...conditions];
    newConditions[idx] = condition;
    onChange({ ...rule, conditions: newConditions });
  };

  const removeCondition = (idx: number) => {
    onChange({
      ...rule,
      conditions: conditions.filter((_, i) => i !== idx),
    });
  };

  const updateAction = (type: ActionType, settings?: ActionSettings) => {
    onChange({
      ...rule,
      actionType: type,
      actionSettings: settings,
    });
  };

  const updateElseAction = (type: ActionType, settings?: ActionSettings) => {
    onChange({
      ...rule,
      elseActionType: type,
      elseActionSettings: settings,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-light border-2 border-dark/10 rounded-2xl p-4 space-y-4 hover:border-dark/20 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <TbGripVertical size={20} className="text-dark/30 cursor-move" />

          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-dark/70">Priority:</p>
            <Input
              type="number"
              value={String(rule.priority ?? 0)}
              onChange={(e) => onChange({ ...rule, priority: parseInt(e.target.value) || 0 })}
              className="w-20"
              size="sm"
              rounded="lg"
            />
          </div>

          <Button
            iconOnly
            variant="ghost"
            size="sm"
            rounded="xl"
            leftIcon={rule.enabled ? <TbToggleRight size={20} /> : <TbToggleLeft size={20} />}
            className={rule.enabled ? 'text-success' : 'text-dark/30'}
            onClick={() => onChange({ ...rule, enabled: !rule.enabled })}
          />

          {!isNew && (
            <p className="text-xs text-dark/50">
              Rule #{rule.id || 'new'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            rounded="xl"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </Button>
          <Button
            iconOnly
            variant="ghost"
            size="sm"
            rounded="xl"
            leftIcon={<TbTrash size={18} />}
            className="text-danger hover:bg-danger/10"
            onClick={onRemove}
          />
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Conditions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-dark/70">Conditions</p>
                {hasConditions && (
                  <Select
                    options={[
                      { label: 'Match ALL (AND)', value: 'AND' },
                      { label: 'Match ANY (OR)', value: 'OR' },
                    ]}
                    value={rule.match || 'AND'}
                    onChange={(v) => onChange({ ...rule, match: v as MatchType })}
                    buttonClassName="rounded-xl border-dark/10 text-xs"
                    listClassName="rounded-xl p-1 shadow-lg"
                    optionClassName="rounded-lg"
                  />
                )}
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {conditions.map((condition, idx) => (
                    <ConditionRow
                      key={idx}
                      condition={condition}
                      onChange={(c) => updateCondition(idx, c)}
                      onRemove={() => removeCondition(idx)}
                      showRemove={conditions.length > 1}
                      index={idx}
                    />
                  ))}
                </AnimatePresence>

                {!hasConditions && (
                  <p className="text-sm text-dark/50 italic">
                    No conditions (rule will always match)
                  </p>
                )}
              </div>

              {conditions.length < 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  rounded="xl"
                  leftIcon={<TbPlus size={16} />}
                  className="text-primary hover:bg-primary/10"
                  onClick={addCondition}
                >
                  Add Condition
                </Button>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-dark/10" />

            {/* Actions */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-dark/70">Action (if conditions match)</p>
              <ActionRow
                actionType={rule.actionType || 'redirect'}
                actionSettings={rule.actionSettings}
                onChange={updateAction}
              />
            </div>

            {/* Else Action (optional) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-dark/70">Else Action (optional)</p>
                {rule.elseActionType && (
                  <Button
                    variant="ghost"
                    size="sm"
                    rounded="xl"
                    onClick={() => onChange({ ...rule, elseActionType: undefined, elseActionSettings: undefined })}
                    className="text-xs text-danger"
                  >
                    Remove
                  </Button>
                )}
              </div>

              {rule.elseActionType ? (
                <ActionRow
                  actionType={rule.elseActionType}
                  actionSettings={rule.elseActionSettings}
                  onChange={updateElseAction}
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  rounded="xl"
                  leftIcon={<TbPlus size={16} />}
                  className="text-primary hover:bg-primary/10"
                  onClick={() => onChange({ ...rule, elseActionType: 'redirect' })}
                >
                  Add Else Action
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
