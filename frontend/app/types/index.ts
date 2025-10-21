/**
 * Shared Types
 */

// Link types
export interface Link {
  shortUrl: string;
  longUrl: string;
  status: boolean;
  createdAt: string;
}

export interface CreateLinkDTO {
  longUrl: string;
  status?: boolean;
}

export interface UpdateLinkDTO {
  longUrl?: string;
  status?: boolean;
}

// Filter types
export interface LinkFilters {
  search: string;
  status: "all" | "active" | "inactive";
}

// Stats types
export interface LinkStats {
  totalLinks: number;
  activeLinks: number;
  inactiveLinks: number;
  totalClicks: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  details?: any;
}

// GetAllLinks response type
export interface GetAllLinksResponse {
  links: Link[];
  stats: {
    totalClicks: number;
  };
}

// Link Rules types

// Enums
export type MatchType = 'AND' | 'OR';

export type FieldType =
  | 'country'
  | 'device'
  | 'ip'
  | 'is_bot'
  | 'is_vpn'
  | 'date'
  | 'access_count';

export type OperatorType =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'greater_than'
  | 'less_than'
  | 'before'
  | 'after'
  | 'contains'
  | 'not_contains';

export type ActionType =
  | 'redirect'
  | 'block_access'
  | 'notify'
  | 'password_gate';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Condition value types based on field type
export type ConditionValue =
  | string         // ip, date (ISO string)
  | string[]       // country codes (e.g., ['ES', 'US'])
  | number         // access_count
  | boolean        // is_bot, is_vpn
  | DeviceType;    // device

// Action Settings based on action type
export interface RedirectActionSettings {
  url: string; // Supports {{longUrl}} and {{shortUrl}} template variables
}

export interface BlockAccessActionSettings {
  reason?: string;
  message?: string;
}

export interface PasswordGateActionSettings {
  passwordHash: string;
  hint?: string;
}

export interface NotifyActionSettings {
  webhookUrl?: string;
  message?: string;
}

export type ActionSettings =
  | RedirectActionSettings
  | BlockAccessActionSettings
  | PasswordGateActionSettings
  | NotifyActionSettings
  | Record<string, never>; // Empty object for actions without settings

// Rule Condition
export interface RuleCondition {
  id?: number;
  ruleId?: number;
  field: FieldType;
  operator: OperatorType;
  value: ConditionValue;
}

// Link Rule
export interface LinkRule {
  id?: number;
  linkId?: number;
  priority: number;          // 0-999, lower = higher priority
  enabled: boolean;
  match: MatchType;          // AND or OR logic
  conditions: RuleCondition[];
  actionType: ActionType;
  actionSettings?: ActionSettings;
  elseActionType?: ActionType;
  elseActionSettings?: ActionSettings;
  createdAt?: string;
  updatedAt?: string;
}

// DTOs for creating/updating rules
export interface CreateRuleDTO {
  priority: number;
  enabled?: boolean;
  match: MatchType;
  conditions: Omit<RuleCondition, 'id' | 'ruleId'>[];
  action: {
    type: ActionType;
    settings?: ActionSettings;
  };
  elseAction?: {
    type: ActionType;
    settings?: ActionSettings;
  };
}

export interface UpdateRuleDTO {
  priority?: number;
  enabled?: boolean;
  match?: MatchType;
  conditions?: Omit<RuleCondition, 'id' | 'ruleId'>[];
  action?: {
    type: ActionType;
    settings?: ActionSettings;
  };
  elseAction?: {
    type: ActionType;
    settings?: ActionSettings;
  };
}

// Batch create rules
export interface BatchCreateRulesDTO {
  rules: CreateRuleDTO[]; // 1-20 rules
}

// API Response types for rules
export interface GetRulesResponse {
  success: boolean;
  data: LinkRule[];
}

export interface GetRuleResponse {
  success: boolean;
  data: LinkRule;
}

export interface CreateRuleResponse {
  success: boolean;
  data: LinkRule;
}

export interface UpdateRuleResponse {
  success: boolean;
  data: LinkRule;
}

export interface DeleteRuleResponse {
  success: boolean;
  message: string;
}

export interface BatchCreateRulesResponse {
  success: boolean;
  data: LinkRule[];
}
