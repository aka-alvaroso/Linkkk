/**
 * Link Rules Service
 * Handles all API communication for link rules
 */

import {
  LinkRule,
  CreateRuleDTO,
  UpdateRuleDTO,
  GetRulesResponse,
  CreateRuleResponse,
  UpdateRuleResponse,
  DeleteRuleResponse,
} from '@/app/types/linkRules';

import { API_CONFIG } from '@/app/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

class LinkRulesService {
  /**
   * Get all rules for a specific link
   */
  async getRules(shortUrl: string): Promise<LinkRule[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/link/${shortUrl}/rules`, {
        credentials: 'include',
      });

      // If endpoint doesn't exist or link has no rules, return empty array
      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch rules:', response.status, errorText);
        throw new Error(`Failed to fetch rules: ${response.statusText}`);
      }

      const data: GetRulesResponse = await response.json();
      return data.data || [];
    } catch (err) {
      // If it's a network error or endpoint doesn't exist, return empty array
      if (err instanceof TypeError || (err as any).code === 'ECONNREFUSED') {
        console.warn('Network error, returning empty rules array');
        return [];
      }
      throw err;
    }
  }

  /**
   * Create a new rule for a link
   */
  async createRule(shortUrl: string, ruleData: CreateRuleDTO): Promise<LinkRule> {
    // Clean up action settings - remove empty optional fields
    const cleanedData = {
      ...ruleData,
      action: {
        type: ruleData.action.type,
        settings: Object.fromEntries(
          Object.entries(ruleData.action.settings).filter(([_, value]) =>
            value !== '' && value !== null && value !== undefined
          )
        )
      },
      ...(ruleData.elseAction && {
        elseAction: {
          type: ruleData.elseAction.type,
          settings: Object.fromEntries(
            Object.entries(ruleData.elseAction.settings).filter(([_, value]) =>
              value !== '' && value !== null && value !== undefined
            )
          )
        }
      })
    };

    const response = await fetch(`${API_BASE_URL}/link/${shortUrl}/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(cleanedData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Backend validation error:', error);
      console.error('Validation details:', JSON.stringify(error.validation, null, 2));
      throw new Error(error.message || 'Failed to create rule');
    }

    const data: CreateRuleResponse = await response.json();
    return data.data;
  }

  /**
   * Update an existing rule
   */
  async updateRule(
    shortUrl: string,
    ruleId: number,
    updates: UpdateRuleDTO
  ): Promise<LinkRule> {
    // Clean up action settings if present - remove empty optional fields
    let cleanedUpdates: any = { ...updates };

    if (updates.action) {
      cleanedUpdates.action = {
        type: updates.action.type,
        settings: Object.fromEntries(
          Object.entries(updates.action.settings).filter(([_, value]) =>
            value !== '' && value !== null && value !== undefined
          )
        )
      };
    }

    if (updates.elseAction !== undefined) {
      if (updates.elseAction === null) {
        // Send null to backend to remove elseAction
        cleanedUpdates.elseAction = null;
      } else {
        cleanedUpdates.elseAction = {
          type: updates.elseAction.type,
          settings: Object.fromEntries(
            Object.entries(updates.elseAction.settings).filter(([_, value]) =>
              value !== '' && value !== null && value !== undefined
            )
          )
        };
      }
    }

    const response = await fetch(`${API_BASE_URL}/link/${shortUrl}/rules/${ruleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(cleanedUpdates),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Backend validation error (update):', error);
      console.error('Validation details:', JSON.stringify(error.validation, null, 2));
      throw new Error(error.message || 'Failed to update rule');
    }

    const data: UpdateRuleResponse = await response.json();
    return data.data;
  }

  /**
   * Delete a rule
   */
  async deleteRule(shortUrl: string, ruleId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/link/${shortUrl}/rules/${ruleId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete rule');
    }
  }

  /**
   * Reorder rules (update priorities in batch)
   */
  async reorderRules(shortUrl: string, ruleIds: number[]): Promise<LinkRule[]> {
    // Update priority for each rule based on its position in the array
    const updates = ruleIds.map((id, index) => ({
      id,
      priority: index,
    }));

    const response = await fetch(`${API_BASE_URL}/link/${shortUrl}/rules/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ updates }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reorder rules');
    }

    const data: GetRulesResponse = await response.json();
    return data.data;
  }
}

export const linkRulesService = new LinkRulesService();
