const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../prisma/client");

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️  Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (!userId || !planId) {
          console.warn("Faltan userId o planId en session metadata");
          break;
        }

        await prisma.user.update({
          where: { id: Number(userId) },
          data: {
            planId: Number(planId),
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            subscriptionStatus: "active",
          },
        });
        // Eliminado log informativo
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { subscriptionStatus: subscription.status },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            planId: 1,
            subscriptionStatus: "canceled",
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { subscriptionStatus: "past_due" },
        });
        break;
      }

      // Puedes eliminar estos casos si no haces nada con ellos
      case "payment_intent.succeeded": {
        // No hacer nada ni log
        break;
      }

      case "customer.subscription.created": {
        // No hacer nada ni log
        break;
      }

      case "invoice.payment_succeeded": {
        // No hacer nada ni log
        break;
      }

      default:
        // No loguear eventos no manejados
        break;
    }
  } catch (error) {
    console.error("Error procesando evento webhook:", error);
    return res.status(500).send("Error interno");
  }

  res.status(200).json({ received: true });
};

module.exports = { handleStripeWebhook };
