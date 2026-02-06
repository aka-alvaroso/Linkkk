import { RuleCondition, ActionType, ActionSettings, RedirectSettings } from '@/app/types/linkRules';

/**
 * Returns a human-readable summary of a single condition
 */
export const getConditionSummary = (condition: RuleCondition): string => {
  const { field, operator, value } = condition;

  switch (field) {
    case 'always':
      return 'Always';
    case 'country': {
      const countries = Array.isArray(value) ? value.join(', ') : value;
      return `Country ${operator === 'in' ? 'is' : 'is not'} ${countries}`;
    }
    case 'device':
      return `Device ${operator === 'equals' ? 'is' : 'is not'} ${value}`;
    case 'ip':
      return `IP ${operator === 'equals' ? 'is' : 'is not'} ${value}`;
    case 'is_bot':
      return value ? 'Is a bot' : 'Is not a bot';
    case 'is_vpn':
      return value ? 'Using VPN' : 'Not using VPN';
    case 'date': {
      const dateStr = typeof value === 'string' ? new Date(value).toLocaleString() : String(value);
      return `Date ${operator === 'before' ? 'before' : 'after'} ${dateStr}`;
    }
    case 'access_count': {
      const opStr = operator === 'equals' ? '=' : operator === 'greater_than' ? '>' : '<';
      return `Accesses ${opStr} ${value}`;
    }
    default:
      return `${field} ${operator} ${value}`;
  }
};

/**
 * Returns a human-readable summary of an action
 */
export const getActionSummary = (actionType: ActionType, settings: ActionSettings): string => {
  switch (actionType) {
    case 'redirect': {
      const url = (settings as RedirectSettings).url || '';
      const display = url.length > 25 ? url.substring(0, 22) + '...' : url;
      return `Redirect → ${display}`;
    }
    case 'block_access':
      return 'Block access';
    case 'password_gate':
      return 'Password gate';
    case 'notify':
      return 'Notify';
    default:
      return actionType;
  }
};

/**
 * Returns a summary of all conditions combined
 */
export const getRuleConditionsSummary = (conditions: RuleCondition[], matchType: 'AND' | 'OR'): string => {
  if (conditions.length === 0) {
    return 'No conditions';
  }

  // Check for "always" condition
  if (conditions.some(c => c.field === 'always')) {
    return 'Always';
  }

  const summaries = conditions.map(getConditionSummary);

  if (summaries.length === 1) {
    return summaries[0];
  }

  return summaries.join(` ${matchType} `);
};
