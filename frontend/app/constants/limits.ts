/**
 * Plan limits for different user types
 * These should match the backend limits in backend/v2/utils/limits.js
 */

export const PLAN_LIMITS = {
  guest: {
    rulesPerLink: 1,
    conditionsPerRule: 1,
    groups: 0,
    tags: 0,
    tagsPerLink: 0,
  },
  user: {
    rulesPerLink: 3,
    conditionsPerRule: 2,
    groups: 5,
    tags: 20,
    tagsPerLink: 5,
  },
  pro: {
    rulesPerLink: null,
    conditionsPerRule: null,
    groups: null,
    tags: null,
    tagsPerLink: null,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
