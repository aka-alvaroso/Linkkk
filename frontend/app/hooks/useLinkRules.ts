/**
 * useLinkRules Hook
 * Connects Link Rules store with API service
 */

import { useCallback } from 'react';
import { useLinkRulesStore } from '@/app/stores/linkRulesStore';
import { linkRulesService } from '@/app/services';
import { CreateRuleDTO, UpdateRuleDTO } from '@/app/types/linkRules';
import { useAuth } from './useAuth';

export function useLinkRules() {
  const {
    rules,
    isLoading,
    error,
    setRules,
    addRule,
    updateRule: updateRuleInStore,
    removeRule,
    reorderRules: reorderRulesInStore,
    setLoading,
    setError,
    reset,
  } = useLinkRulesStore();

  const { ensureSession } = useAuth();

  /**
   * Fetch all rules for a link
   */
  const fetchRules = useCallback(
    async (shortUrl: string) => {
      setLoading(true);
      setError(null);
      try {
        const fetchedRules = await linkRulesService.getRules(shortUrl);
        setRules(fetchedRules);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch rules';
        setError(message);
        console.error('Error fetching rules:', err);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setRules]
  );

  /**
   * Create a new rule
   */
  const createRule = useCallback(
    async (shortUrl: string, ruleData: CreateRuleDTO) => {
      // Ensure we have a session before creating a rule
      const hasSession = await ensureSession();
      if (!hasSession) {
        const error = new Error('Unable to create session');
        setError('Unable to create session');
        throw error;
      }

      setLoading(true);
      setError(null);
      try {
        const newRule = await linkRulesService.createRule(shortUrl, ruleData);
        addRule(newRule);
        return newRule;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create rule';
        setError(message);
        console.error('Error creating rule:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, addRule, ensureSession]
  );

  /**
   * Update an existing rule
   */
  const updateRule = useCallback(
    async (shortUrl: string, ruleId: number, updates: UpdateRuleDTO) => {
      // Ensure we have a session before updating
      const hasSession = await ensureSession();
      if (!hasSession) {
        const error = new Error('Unable to create session');
        setError('Unable to create session');
        throw error;
      }

      setLoading(true);
      setError(null);
      try {
        const updatedRule = await linkRulesService.updateRule(shortUrl, ruleId, updates);
        updateRuleInStore(ruleId, updatedRule);
        return updatedRule;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update rule';
        setError(message);
        console.error('Error updating rule:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, updateRuleInStore, ensureSession]
  );

  /**
   * Delete a rule
   */
  const deleteRule = useCallback(
    async (shortUrl: string, ruleId: number) => {
      // Ensure we have a session before deleting
      const hasSession = await ensureSession();
      if (!hasSession) {
        const error = new Error('Unable to create session');
        setError('Unable to create session');
        throw error;
      }

      setLoading(true);
      setError(null);
      try {
        await linkRulesService.deleteRule(shortUrl, ruleId);
        removeRule(ruleId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete rule';
        setError(message);
        console.error('Error deleting rule:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, removeRule, ensureSession]
  );

  /**
   * Reorder rules (update priorities)
   */
  const reorderRules = useCallback(
    async (shortUrl: string, ruleIds: number[]) => {
      // Ensure we have a session before reordering
      const hasSession = await ensureSession();
      if (!hasSession) {
        const error = new Error('Unable to create session');
        setError('Unable to create session');
        throw error;
      }

      setLoading(true);
      setError(null);
      try {
        const reorderedRules = await linkRulesService.reorderRules(shortUrl, ruleIds);
        reorderRulesInStore(reorderedRules);
        return reorderedRules;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reorder rules';
        setError(message);
        console.error('Error reordering rules:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, reorderRulesInStore, ensureSession]
  );

  return {
    // State
    rules,
    isLoading,
    error,

    // Actions
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    reorderRules,
    reset,
  };
}
