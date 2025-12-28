/**
 * Plan limits for different user types
 * These should match the backend limits in backend/v2/utils/limits.js
 */

export const PLAN_LIMITS = {
  guest: {
    rulesPerLink: 1,
    conditionsPerRule: 1,
  },
  user: {
    rulesPerLink: 3,
    conditionsPerRule: 2,
  },
  pro: {
    rulesPerLink: null, // unlimited
    conditionsPerRule: null, // unlimited
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
