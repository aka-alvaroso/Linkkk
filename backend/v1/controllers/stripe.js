const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../prisma/client");

const createCheckoutSession = async (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  try {
    const plan = await prisma.plan.findUnique({
      where: { id: Number(planId) },
    });

    if (!plan) {
      return res.status(404).json({ error: "Plan no encontrado." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: { userId: userId.toString(), planId: planId.toString() },
      success_url: `https://linkkk.dev/success`,
      cancel_url: `https://linkkk.dev/`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
};

const createPaymentIntent = async (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  try {
    if (planId !== 2) {
      return res.status(400).json({ error: "No es una suscripción" });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: Number(planId) },
    });

    if (!plan) {
      return res.status(404).json({ error: "Plan no encontrado." });
    }

    const amount = plan.price * 100;
    const currency = "usd";

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      metadata: { userId: userId, planId: planId },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  createPaymentIntent,
};
