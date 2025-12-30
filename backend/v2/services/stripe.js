/**
 * Stripe Service
 * Handles all Stripe-related operations
 */

const Stripe = require('stripe');
const config = require('../config/environment');

let stripe;

/**
 * Initialize Stripe SDK
 */
const initializeStripe = () => {
  if (!config.stripe.secretKey) {
    throw new Error('Stripe secret key is not configured');
  }

  if (!stripe) {
    stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2024-12-18.acacia', // Latest stable version
    });
  }

  return stripe;
};

/**
 * Create a Checkout Session for subscription
 * @param {number} userId - User ID
 * @param {string} userEmail - User email
 * @param {string} priceId - Stripe Price ID
 * @returns {Promise<Object>} Checkout session with URL
 */
const createCheckoutSession = async (userId, userEmail, priceId) => {
  const stripeInstance = initializeStripe();

  const session = await stripeInstance.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${config.frontend.url}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend.url}/dashboard`,
    customer_email: userEmail,
    client_reference_id: userId.toString(), // Link user to session
    metadata: {
      userId: userId.toString(),
    },
    allow_promotion_codes: true, // Allow discount codes
    billing_address_collection: 'auto',
  });

  return {
    sessionId: session.id,
    sessionUrl: session.url,
  };
};

/**
 * Create a Customer Portal Session for managing subscription
 * @param {string} stripeCustomerId - Stripe Customer ID
 * @returns {Promise<Object>} Portal session with URL
 */
const createCustomerPortalSession = async (stripeCustomerId) => {
  const stripeInstance = initializeStripe();

  const session = await stripeInstance.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${config.frontend.url}/settings`,
  });

  return {
    sessionUrl: session.url,
  };
};

/**
 * Construct and verify webhook event
 * @param {Buffer} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} Verified Stripe event
 */
const constructWebhookEvent = (payload, signature) => {
  const stripeInstance = initializeStripe();

  if (!config.stripe.webhookSecret) {
    throw new Error('Stripe webhook secret is not configured');
  }

  return stripeInstance.webhooks.constructEvent(
    payload,
    signature,
    config.stripe.webhookSecret
  );
};

/**
 * Cancel a subscription at period end
 * @param {string} subscriptionId - Stripe Subscription ID
 * @returns {Promise<Object>} Updated subscription
 */
const cancelSubscriptionAtPeriodEnd = async (subscriptionId) => {
  const stripeInstance = initializeStripe();

  const subscription = await stripeInstance.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
};

/**
 * Reactivate a canceled subscription
 * @param {string} subscriptionId - Stripe Subscription ID
 * @returns {Promise<Object>} Updated subscription
 */
const reactivateSubscription = async (subscriptionId) => {
  const stripeInstance = initializeStripe();

  const subscription = await stripeInstance.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
};

module.exports = {
  initializeStripe,
  createCheckoutSession,
  createCustomerPortalSession,
  constructWebhookEvent,
  cancelSubscriptionAtPeriodEnd,
  reactivateSubscription,
};
