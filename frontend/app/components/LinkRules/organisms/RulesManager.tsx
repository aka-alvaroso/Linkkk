import React, { useState, useEffect } from 'react';
import { TbPlus, TbAlertCircle, TbCheck } from 'react-icons/tb';
import Button from '@/app/components/ui/Button/Button';
import RuleCard from './RuleCard';
import { useLinkRules } from '@/app/hooks';
import type { LinkRule, CreateRuleDTO } from '@/app/types';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';

interface RulesManagerProps {
  shortUrl: string;
}

export default function RulesManager({ shortUrl }: RulesManagerProps) {
  const { rules, isLoading, error, fetchRules, createRule, updateRule, deleteRule } = useLinkRules();
  const [localRules, setLocalRules] = useState<Partial<LinkRule>[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load rules on mount
  useEffect(() => {
    fetchRules(shortUrl);
  }, [shortUrl, fetchRules]);

  // Sync local rules with store
  useEffect(() => {
    setLocalRules(rules);
    setHasChanges(false);
  }, [rules]);

  const addNewRule = () => {
    const newRule: Partial<LinkRule> = {
      priority: localRules.length,
      enabled: true,
      match: 'AND',
      conditions: [
        {
          field: 'country',
          operator: 'in',
          value: [],
        },
      ],
      actionType: 'redirect',
      actionSettings: { url: '' },
    };

    setLocalRules([...localRules, newRule]);
    setHasChanges(true);
  };

  const updateLocalRule = (index: number, rule: Partial<LinkRule>) => {
    const updated = [...localRules];
    updated[index] = rule;
    setLocalRules(updated);
    setHasChanges(true);
  };

  const removeLocalRule = (index: number) => {
    setLocalRules(localRules.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = async () => {
    for (const rule of localRules) {
      // If rule has an ID, it's an existing rule - update it
      if (rule.id) {
        await updateRule(shortUrl, rule.id, {
          priority: rule.priority,
          enabled: rule.enabled,
          match: rule.match,
          conditions: rule.conditions?.map(c => ({
            field: c.field,
            operator: c.operator,
            value: c.value,
          })),
          action: {
            type: rule.actionType!,
            settings: rule.actionSettings,
          },
          elseAction: rule.elseActionType ? {
            type: rule.elseActionType,
            settings: rule.elseActionSettings,
          } : undefined,
        });
      } else {
        // New rule - create it
        const createData: CreateRuleDTO = {
          priority: rule.priority || 0,
          enabled: rule.enabled ?? true,
          match: rule.match || 'AND',
          conditions: (rule.conditions || []).map(c => ({
            field: c.field,
            operator: c.operator,
            value: c.value,
          })),
          action: {
            type: rule.actionType || 'redirect',
            settings: rule.actionSettings,
          },
          elseAction: rule.elseActionType ? {
            type: rule.elseActionType,
            settings: rule.elseActionSettings,
          } : undefined,
        };

        await createRule(shortUrl, createData);
      }
    }

    // Check for deleted rules
    const deletedRules = rules.filter(r => !localRules.find(lr => lr.id === r.id));
    for (const rule of deletedRules) {
      if (rule.id) {
        await deleteRule(shortUrl, rule.id);
      }
    }

    // Refresh rules
    await fetchRules(shortUrl);
  };

  const handleCancel = () => {
    setLocalRules(rules);
    setHasChanges(false);
  };

  if (isLoading && localRules.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-dark/50">Loading rules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black">Link Rules</h3>
          <p className="text-sm text-dark/50">
            Create conditional routing based on visitor attributes
          </p>
        </div>

        <Button
          variant="solid"
          size="sm"
          rounded="xl"
          leftIcon={<TbPlus size={16} />}
          className="bg-primary text-dark hover:shadow-[4px_4px_0_var(--color-dark)]"
          onClick={addNewRule}
        >
          Add Rule
        </Button>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-danger/10 border border-danger/20 rounded-xl p-3 flex items-center gap-2"
        >
          <TbAlertCircle size={20} className="text-danger" />
          <p className="text-sm text-danger">{error}</p>
        </motion.div>
      )}

      {/* Rules List */}
      {localRules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-2 border-dashed border-dark/10 rounded-2xl p-8 text-center"
        >
          <p className="text-dark/50 mb-4">No rules configured yet</p>
          <Button
            variant="outline"
            size="md"
            rounded="xl"
            leftIcon={<TbPlus size={18} />}
            onClick={addNewRule}
          >
            Create Your First Rule
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {localRules.map((rule, index) => (
              <RuleCard
                key={rule.id || `new-${index}`}
                rule={rule}
                onChange={(updated) => updateLocalRule(index, updated)}
                onRemove={() => removeLocalRule(index)}
                index={index}
                isNew={!rule.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Save/Cancel Bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="sticky bottom-4 bg-light border-2 border-dark/10 rounded-2xl p-4 flex items-center justify-between shadow-lg"
          >
            <p className="text-sm text-dark/70">
              You have unsaved changes
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                rounded="xl"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                size="sm"
                rounded="xl"
                leftIcon={<TbCheck size={16} />}
                className="bg-primary text-dark hover:shadow-[4px_4px_0_var(--color-dark)]"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
