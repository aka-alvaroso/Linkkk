/**
 * RulesManager Component
 * Manages all rules for a link with drag & drop and unified save
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkRule } from './LinkRule';
import Button from '../ui/Button/Button';
import { TbPlus, TbRocket, TbChevronDown } from 'react-icons/tb';
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
import { useAuth } from '@/app/stores/authStore';
import { PLAN_LIMITS } from '@/app/constants/limits';
import Link from 'next/link';

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
  maxConditions: number;
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
  const { isAuthenticated } = useAuth();

  const [originalRules, setOriginalRules] = useState<LinkRuleType[]>([]);
  const [localRules, setLocalRules] = useState<LinkRuleType[]>([]);
  const [showRules, setShowRules] = useState(false);

  // Get limits based on user type
  const limits = isAuthenticated ? PLAN_LIMITS.user : PLAN_LIMITS.guest;

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

  // Convert conditions from backend format (array) to UI format (string for countries)
  const normalizeConditionsForUI = (conditions: any[]) => {
    // If no conditions, add "always" condition for UI
    if (conditions.length === 0) {
      return [{ field: 'always', operator: 'equals', value: true }];
    }

    return conditions.map(condition => {
      if (condition.field === 'country' && Array.isArray(condition.value)) {
        return { ...condition, value: condition.value.join(', ') };
      }
      return condition;
    });
  };

  // Update local state when fetched rules change
  useEffect(() => {
    const normalizedRules = fetchedRules.map(rule => ({
      ...rule,
      conditions: normalizeConditionsForUI(rule.conditions)
    }));
    setOriginalRules(normalizedRules);
    setLocalRules(normalizedRules);
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
        const value = typeof condition.value === 'string'
          ? condition.value
          : Array.isArray(condition.value)
            ? condition.value.join(',')
            : '';
        if (!value || value.trim() === '') {
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

  // Process conditions to convert country string to array and filter "always"
  const processConditions = (conditions: any[]) => {
    return conditions
      .filter(condition => condition.field !== 'always') // Remove "always" conditions (frontend-only)
      .map(condition => {
        if (condition.field === 'country' && typeof condition.value === 'string') {
          // Convert comma-separated string to array
          const countries = condition.value
            .split(',')
            .map((c: string) => c.trim())
            .filter((c: string) => c.length > 0);
          return { ...condition, value: countries };
        }
        return condition;
      });
  };

  // Save callback
  const saveRules = useCallback(async () => {
    try {
      // Validate limits
      if (localRules.length > limits.rulesPerLink) {
        throw new Error(`Maximum ${limits.rulesPerLink} ${limits.rulesPerLink === 1 ? 'rule' : 'rules'} allowed per link`);
      }

      // Validate all rules before saving
      for (let i = 0; i < localRules.length; i++) {
        const rule = localRules[i];

        // Validate conditions limit
        if (rule.conditions.length > limits.conditionsPerRule) {
          throw new Error(`Rule ${i + 1}: Maximum ${limits.conditionsPerRule} ${limits.conditionsPerRule === 1 ? 'condition' : 'conditions'} allowed per rule`);
        }

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
            conditions: processConditions(localRule.conditions),
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
            conditions: processConditions(localRule.conditions),
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
  }, [localRules, originalRules, shortUrl, createRule, updateRule, deleteRule, limits]);

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
      conditions: [{ field: 'always', operator: 'equals', value: true }], // Start with "Always" condition
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
    <div className="space-y-2 mt-4">
      {/* Collapsible Header */}
      <button
        onClick={() => setShowRules(!showRules)}
        className='w-full flex items-center justify-between p-3 rounded-2xl border border-dark/10 hover:border-dark/20 hover:bg-dark/5 transition-all'
      >
        <div className='flex items-center gap-2'>
          <TbRocket size={20} />
          <span className='font-black italic'>Link Rules</span>
          <span className='text-xs text-dark/50'>
            ({localRules.length}/{limits.rulesPerLink})
          </span>
        </div>
        <motion.div
          animate={{ rotate: showRules ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <TbChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, height: 'auto', y: 0, scale: 1 }}
            exit={{ opacity: 0, height: 0, y: -20, scale: 0.9 }}
            transition={{
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
              height: { duration: 0.4 }
            }}
            className='overflow-hidden'
          >
            <div className="space-y-4 mt-4">
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
                <>
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
                        <AnimatePresence mode="popLayout">
                          {localRules.map((rule, index) => (
                            <SortableLinkRule
                              key={rule.id}
                              rule={rule}
                              priority={index + 1}
                              onChange={(updatedRule) => handleRuleChange(rule.id, updatedRule)}
                              onDelete={() => handleDeleteRule(rule.id)}
                              maxConditions={limits.conditionsPerRule}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Add rule button */}
                  <Button
                    variant="solid"
                    size="md"
                    rounded="2xl"
                    leftIcon={<TbPlus size={20} />}
                    onClick={handleAddRule}
                    disabled={localRules.length >= limits.rulesPerLink}
                    className="bg-primary text-dark hover:bg-primary hover:shadow-[4px_4px_0_var(--color-dark)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    title={localRules.length >= limits.rulesPerLink ? `Maximum ${limits.rulesPerLink} ${limits.rulesPerLink === 1 ? 'rule' : 'rules'} allowed` : ''}
                  >
                    Add Rule
                  </Button>

                  {/* Info Message */}
                  <p className='text-xs text-dark/50 text-center'>
                    Rules are evaluated in order from top to bottom
                  </p>
                </>
              ) : (
                /* Empty State */
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    rounded="2xl"
                    leftIcon={<TbPlus size={20} />}
                    onClick={handleAddRule}
                    className="w-full bg-dark/5 hover:bg-dark/10"
                  >
                    Create Your First Rule
                  </Button>
                  <p className='text-xs text-dark/50 text-center'>
                    Rules are evaluated in order from top to bottom
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
