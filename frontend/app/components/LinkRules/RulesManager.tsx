/**
 * RulesManager Component
 * Manages all rules for a link with drag & drop and unified save
 */

import React, { useEffect, useState, useCallback } from 'react';
import { LinkRule } from './LinkRule';
import Button from '../ui/Button/Button';
import { TbPlus, TbRocket } from 'react-icons/tb';
import { useLinkRules } from '@/app/hooks';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LinkRule as LinkRuleType } from '@/app/types/linkRules';

interface RulesManagerProps {
  shortUrl: string;
  onRulesChange?: (
    hasChanges: boolean,
    saveRules: () => Promise<void>,
    cancelRules: () => void
  ) => void;
}

// Sortable wrapper for LinkRule
function SortableLinkRule(props: {
  rule: LinkRuleType;
  priority: number;
  onChange: (rule: LinkRuleType) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style}>
      <LinkRule
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export function RulesManager({ shortUrl, onRulesChange }: RulesManagerProps) {
  const { rules: fetchedRules, isLoading, error, fetchRules, createRule, updateRule, deleteRule, reorderRules } = useLinkRules();

  const [originalRules, setOriginalRules] = useState<LinkRuleType[]>([]);
  const [localRules, setLocalRules] = useState<LinkRuleType[]>([]);

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Fetch rules on mount
  useEffect(() => {
    if (shortUrl) {
      fetchRules(shortUrl);
    }
  }, [shortUrl, fetchRules]);

  // Update local state when fetched rules change
  useEffect(() => {
    setOriginalRules(fetchedRules);
    setLocalRules(fetchedRules);
  }, [fetchedRules]);

  // Detect changes
  const hasChanges = JSON.stringify(originalRules) !== JSON.stringify(localRules);

  // Validate a single rule
  const validateRule = (rule: LinkRuleType): string | null => {
    // Validate action settings based on type
    switch (rule.actionType) {
      case 'redirect':
        const url = (rule.actionSettings as any).url;
        if (!url || url.trim() === '') {
          return 'Redirect URL is required';
        }
        // Check if it's a valid URL or template variable
        if (!url.includes('{{') && !url.startsWith('http://') && !url.startsWith('https://')) {
          return 'Redirect URL must start with http:// or https://';
        }
        break;
      case 'password_gate':
        const passwordHash = (rule.actionSettings as any).passwordHash;
        if (!passwordHash || passwordHash.trim() === '') {
          return 'Password is required for password gate';
        }
        break;
      // block_access and notify have optional settings
    }

    // Validate conditions
    for (const condition of rule.conditions) {
      if (condition.field === 'country') {
        if (!Array.isArray(condition.value) || condition.value.length === 0) {
          return 'At least one country code is required';
        }
      } else if (condition.field === 'ip') {
        if (!condition.value || (condition.value as string).trim() === '') {
          return 'IP address is required';
        }
      }
    }

    return null;
  };

  // Save callback
  const saveRules = useCallback(async () => {
    try {
      // Validate all rules before saving
      for (let i = 0; i < localRules.length; i++) {
        const rule = localRules[i];
        const error = validateRule(rule);
        if (error) {
          throw new Error(`Rule ${i + 1}: ${error}`);
        }
      }

      // Update all modified rules
      for (const localRule of localRules) {
        const originalRule = originalRules.find(r => r.id === localRule.id);
        if (!originalRule) {
          // New rule (created locally)
          await createRule(shortUrl, {
            priority: localRule.priority,
            enabled: localRule.enabled,
            match: localRule.match,
            conditions: localRule.conditions,
            action: {
              type: localRule.actionType,
              settings: localRule.actionSettings
            },
            ...(localRule.elseActionType && {
              elseAction: {
                type: localRule.elseActionType,
                settings: localRule.elseActionSettings!
              }
            })
          });
        } else if (JSON.stringify(originalRule) !== JSON.stringify(localRule)) {
          // Modified rule
          const updatePayload: any = {
            priority: localRule.priority,
            enabled: localRule.enabled,
            match: localRule.match,
            conditions: localRule.conditions,
            action: {
              type: localRule.actionType,
              settings: localRule.actionSettings
            }
          };

          // Only include elseAction if it changed from original
          if (localRule.elseActionType !== originalRule.elseActionType ||
              JSON.stringify(localRule.elseActionSettings) !== JSON.stringify(originalRule.elseActionSettings)) {
            updatePayload.elseAction = localRule.elseActionType ? {
              type: localRule.elseActionType,
              settings: localRule.elseActionSettings!
            } : null; // Send null to remove elseAction
          }

          await updateRule(shortUrl, localRule.id, updatePayload);
        }
      }

      // Delete removed rules
      for (const originalRule of originalRules) {
        if (!localRules.find(r => r.id === originalRule.id)) {
          await deleteRule(shortUrl, originalRule.id);
        }
      }

      // Update original to match local (saved state)
      setOriginalRules(localRules);
    } catch (err) {
      console.error('Failed to save rules:', err);
      throw err;
    }
  }, [localRules, originalRules, shortUrl, createRule, updateRule, deleteRule]);

  // Cancel callback
  const cancelRules = useCallback(() => {
    setLocalRules(originalRules);
  }, [originalRules]);

  // Notify parent of changes
  useEffect(() => {
    if (onRulesChange) {
      onRulesChange(hasChanges, saveRules, cancelRules);
    }
  }, [hasChanges, saveRules, cancelRules, onRulesChange]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalRules((rules) => {
        const oldIndex = rules.findIndex(r => r.id === active.id);
        const newIndex = rules.findIndex(r => r.id === over.id);
        const newOrder = arrayMove(rules, oldIndex, newIndex);

        // Update priorities
        return newOrder.map((rule, index) => ({
          ...rule,
          priority: index
        }));
      });
    }
  };

  // Add new rule
  const handleAddRule = () => {
    const newRule: LinkRuleType = {
      id: Date.now(), // Temporary ID
      priority: localRules.length,
      enabled: true,
      match: 'AND',
      conditions: [{ field: 'device', operator: 'equals', value: 'mobile' }],
      actionType: 'redirect',
      actionSettings: { url: '{{longUrl}}' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLocalRules([...localRules, newRule]);
  };

  // Update rule
  const handleRuleChange = (ruleId: number, updatedRule: LinkRuleType) => {
    setLocalRules(localRules.map(r => r.id === ruleId ? updatedRule : r));
  };

  // Delete rule
  const handleDeleteRule = (ruleId: number) => {
    setLocalRules(localRules.filter(r => r.id !== ruleId));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-dark flex items-center gap-2">
            <TbRocket size={24} />
            Link Rules
          </h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-dark flex items-center gap-2">
            <TbRocket size={24} />
            Link Rules
          </h3>
          <p className="text-sm text-dark/50 mt-1">
            Define conditions and actions for this link
          </p>
        </div>
        <Button
          variant="solid"
          size="md"
          rounded="2xl"
          leftIcon={<TbPlus size={20} />}
          onClick={handleAddRule}
          className="bg-primary text-dark hover:bg-primary hover:shadow-[4px_4px_0_var(--color-dark)]"
        >
          Add Rule
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl">
          <div className="flex items-center gap-2 text-danger text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error loading rules: {error}</span>
          </div>
        </div>
      )}

      {/* Rules List with Drag & Drop */}
      {localRules.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm font-medium text-dark/50">
            {localRules.length} {localRules.length === 1 ? 'rule' : 'rules'} configured
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localRules.map(r => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {localRules.map((rule, index) => (
                  <SortableLinkRule
                    key={rule.id}
                    rule={rule}
                    priority={index + 1}
                    onChange={(updatedRule) => handleRuleChange(rule.id, updatedRule)}
                    onDelete={() => handleDeleteRule(rule.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Info Message */}
          <div className="flex items-start gap-2 p-4 bg-info/5 rounded-2xl border border-info/20 text-sm text-info">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              Rules are evaluated in order from top to bottom. Drag to reorder. The first matching rule will be applied.
            </p>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 rounded-4xl border-2 border-dashed border-dark/20">
          <TbRocket className="w-12 h-12 mx-auto text-dark/30 mb-3" />
          <p className="text-dark/50 mb-4">
            No rules configured yet
          </p>
          <Button
            variant="solid"
            size="md"
            rounded="2xl"
            leftIcon={<TbPlus size={20} />}
            onClick={handleAddRule}
            className="bg-primary text-dark hover:bg-primary hover:shadow-[4px_4px_0_var(--color-dark)]"
          >
            Create Your First Rule
          </Button>
        </div>
      )}
    </div>
  );
}
