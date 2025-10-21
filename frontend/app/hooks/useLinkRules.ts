/**
 * useLinkRules Hook - Business Logic for Link Rules
 * Combines link rules store state with link rules service API calls
 */

import { useCallback } from "react";
import { useLinkRulesStore } from "@/app/stores/linkRulesStore";
import { linkRulesService } from "@/app/services";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type { CreateRuleDTO, UpdateRuleDTO, BatchCreateRulesDTO } from "@/app/types";

export function useLinkRules() {
  const {
    rules,
    currentShortUrl,
    isLoading,
    error,
    setRules,
    addRule,
    updateRuleInStore,
    removeRuleFromStore,
    reorderRules,
    setLoading,
    setError,
    reset,
  } = useLinkRulesStore();

  /**
   * Get user-friendly error message from error object
   */
  const getErrorMessage = (err: unknown): string => {
    if (err instanceof HttpError) {
      return err.message;
    }
    if (err instanceof NetworkError || err instanceof TimeoutError) {
      return err.message;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return "An unexpected error occurred";
  };

  /**
   * Fetch all rules for a specific link
   */
  const fetchRules = useCallback(
    async (shortUrl: string) => {
      setLoading(true);
      setError(null);

      try {
        const data = await linkRulesService.getAll(shortUrl);
        setRules(data, shortUrl);
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        console.error("Error fetching rules:", err);
      } finally {
        setLoading(false);
      }
    },
    [setRules, setLoading, setError]
  );

  /**
   * Create a new rule
   */
  const createRule = useCallback(
    async (shortUrl: string, ruleData: CreateRuleDTO) => {
      setLoading(true);
      setError(null);

      try {
        const newRule = await linkRulesService.create(shortUrl, ruleData);
        addRule(newRule);
        return { success: true as const, data: newRule, error: null, errorCode: null };
      } catch (err) {
        const message = getErrorMessage(err);
        const errorCode = err instanceof HttpError ? err.code : null;
        setError(message);
        console.error("Error creating rule:", err);
        return { success: false as const, data: null, error: message, errorCode };
      } finally {
        setLoading(false);
      }
    },
    [addRule, setLoading, setError]
  );

  /**
   * Update an existing rule
   */
  const updateRule = useCallback(
    async (shortUrl: string, ruleId: number, ruleData: UpdateRuleDTO) => {
      setLoading(true);
      setError(null);

      try {
        const updatedRule = await linkRulesService.update(shortUrl, ruleId, ruleData);
        updateRuleInStore(ruleId, updatedRule);
        return { success: true as const, data: updatedRule, error: null, errorCode: null };
      } catch (err) {
        const message = getErrorMessage(err);
        const errorCode = err instanceof HttpError ? err.code : null;
        setError(message);
        console.error("Error updating rule:", err);
        return { success: false as const, data: null, error: message, errorCode };
      } finally {
        setLoading(false);
      }
    },
    [updateRuleInStore, setLoading, setError]
  );

  /**
   * Delete a rule
   */
  const deleteRule = useCallback(
    async (shortUrl: string, ruleId: number) => {
      setLoading(true);
      setError(null);

      try {
        await linkRulesService.delete(shortUrl, ruleId);
        removeRuleFromStore(ruleId);
        return { success: true as const, error: null, errorCode: null };
      } catch (err) {
        const message = getErrorMessage(err);
        const errorCode = err instanceof HttpError ? err.code : null;
        setError(message);
        console.error("Error deleting rule:", err);
        return { success: false as const, error: message, errorCode };
      } finally {
        setLoading(false);
      }
    },
    [removeRuleFromStore, setLoading, setError]
  );

  /**
   * Batch create multiple rules
   */
  const batchCreateRules = useCallback(
    async (shortUrl: string, batchData: BatchCreateRulesDTO) => {
      setLoading(true);
      setError(null);

      try {
        const newRules = await linkRulesService.batchCreate(shortUrl, batchData);
        // Refresh all rules to ensure correct state
        await fetchRules(shortUrl);
        return { success: true as const, data: newRules, error: null, errorCode: null };
      } catch (err) {
        const message = getErrorMessage(err);
        const errorCode = err instanceof HttpError ? err.code : null;
        setError(message);
        console.error("Error batch creating rules:", err);
        return { success: false as const, data: null, error: message, errorCode };
      } finally {
        setLoading(false);
      }
    },
    [fetchRules, setLoading, setError]
  );

  /**
   * Update rule priorities (for drag & drop)
   * This will update multiple rules with new priorities
   */
  const updateRulePriorities = useCallback(
    async (shortUrl: string, rulesWithNewPriorities: { id: number; priority: number }[]) => {
      setLoading(true);
      setError(null);

      try {
        // Update each rule's priority
        const updatePromises = rulesWithNewPriorities.map(({ id, priority }) =>
          linkRulesService.update(shortUrl, id, { priority })
        );

        await Promise.all(updatePromises);

        // Refresh rules to get updated state
        await fetchRules(shortUrl);

        return { success: true as const, error: null, errorCode: null };
      } catch (err) {
        const message = getErrorMessage(err);
        const errorCode = err instanceof HttpError ? err.code : null;
        setError(message);
        console.error("Error updating rule priorities:", err);
        return { success: false as const, error: message, errorCode };
      } finally {
        setLoading(false);
      }
    },
    [fetchRules, setLoading, setError]
  );

  return {
    // State
    rules,
    currentShortUrl,
    isLoading,
    error,

    // Actions
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    batchCreateRules,
    updateRulePriorities,
    reorderRules, // For optimistic UI updates before API call
    reset,
  };
}
