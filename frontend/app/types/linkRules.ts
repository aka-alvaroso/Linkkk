/**
 * Link Rules Types
 * Simple and clear type definitions for link rules functionality
 */

// ===== ENUMS =====

export type MatchType = 'AND' | 'OR';

export type FieldType =
  | 'always'       // Always execute (no condition)
  | 'country'      // Country code (ES, US, FR, etc)
  | 'device'       // Device type
  | 'ip'           // IP address
  | 'is_bot'       // Bot detection
  | 'is_vpn'       // VPN detection
  | 'date'         // Date/time
  | 'access_count';// Number of accesses

export type OperatorType =
  | 'equals'       // field === value
  | 'not_equals'   // field !== value
  | 'in'           // value includes field (for arrays)
  | 'not_in'       // value doesn't include field
  | 'greater_than' // field > value
  | 'less_than'    // field < value
  | 'before'       // date before
  | 'after'        // date after
  | 'contains'     // string contains
  | 'not_contains';// string doesn't contain

export type ActionType =
  | 'redirect'      // Redirect to URL
  | 'block_access'  // Block access with message
  | 'password_gate' // Require password
  | 'notify';       // Send notification

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// ===== VALUE TYPES =====

export type ConditionValue =
  | string         // For: ip, date (ISO string)
  | string[]       // For: country codes (e.g., ['ES', 'US'])
  | number         // For: access_count
  | boolean        // For: is_bot, is_vpn
  | DeviceType;    // For: device

// ===== ACTION SETTINGS =====

export interface RedirectSettings {
  url: string; // Can use {{longUrl}} and {{shortUrl}} placeholders
}

export interface BlockAccessSettings {
  reason?: string;
}

export interface PasswordGateSettings {
  passwordHash: string;
  hint?: string;
}

export interface NotifySettings {
  webhookUrl?: string;
  message?: string;
}

export type ActionSettings =
  | RedirectSettings
  | BlockAccessSettings
  | PasswordGateSettings
  | NotifySettings;

// ===== CORE ENTITIES =====

export interface RuleCondition {
  field: FieldType;
  operator: OperatorType;
  value: ConditionValue;
}

export interface LinkRule {
  id: number;
  name?: string | null;
  priority: number;
  enabled: boolean;
  match: MatchType;
  conditions: RuleCondition[];
  actionType: ActionType;
  actionSettings: ActionSettings;
  elseActionType?: ActionType | null;
  elseActionSettings?: ActionSettings | null;
  createdAt: string;
  updatedAt: string;
}

// ===== DTOs (Data Transfer Objects) =====

export interface CreateRuleDTO {
  name?: string;
  priority: number;
  enabled: boolean;
  match: MatchType;
  conditions: RuleCondition[];
  action: {
    type: ActionType;
    settings: ActionSettings;
  };
  elseAction?: {
    type: ActionType;
    settings: ActionSettings;
  };
}

export interface UpdateRuleDTO {
  name?: string | null;
  priority?: number;
  enabled?: boolean;
  match?: MatchType;
  conditions?: RuleCondition[];
  action?: {
    type: ActionType;
    settings: ActionSettings;
  };
  elseAction?: {
    type: ActionType;
    settings: ActionSettings;
  } | null;
}

// ===== API RESPONSES =====

export interface GetRulesResponse {
  success: boolean;
  data: LinkRule[];
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
