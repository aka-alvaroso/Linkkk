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
    rulesPerLink: 5,
    conditionsPerRule: 3,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
