/* =====================================================================
   WAVELINK — Stripe Checkout Session creator (Vercel serverless function)
   POST { cart:[{key,surfers,dateLabel,time,...}], customer:{name,email,phone,notes} }
   -> { url } : the Stripe-hosted checkout page to redirect the buyer to.

   SECURITY: prices are defined HERE on the server, never trusted from the
   browser. The client only says WHICH lesson and HOW MANY surfers.
   Requires env var: STRIPE_SECRET_KEY
   ===================================================================== */
const Stripe = require("stripe");

// amounts are in cents (USD)
const PRICES = {
  private: { name: "Private Lesson",      amount: 12500, min: 1, max: 1 },
  semi:    { name: "Semi-Private Lesson", amount: 9800,  min: 2, max: 2 },
  group:   { name: "Group Lesson",        amount: 8000,  min: 3, max: 8 }
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    res.status(500).json({ error: "Payments are not configured yet (missing STRIPE_SECRET_KEY)." });
    return;
  }
  const stripe = Stripe(key);

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const cart = Array.isArray(body.cart) ? body.cart : [];
    const customer = body.customer || {};
    if (!cart.length) {
      res.status(400).json({ error: "Your cart is empty." });
      return;
    }

    const line_items = [];
    const summary = [];

    for (const item of cart) {
      const p = PRICES[item.key];
      if (!p) {
        res.status(400).json({ error: "Unknown lesson type in cart." });
        return;
      }
      let surfers = parseInt(item.surfers, 10);
      if (!Number.isFinite(surfers) || surfers < p.min) surfers = p.min;
      if (surfers > p.max) surfers = p.max;

      const when = [item.dateLabel, item.time].filter(Boolean).join(" · ");
      const product_data = { name: p.name };
      if (when) product_data.description = "Lesson: " + when;

      line_items.push({
        quantity: surfers,
        price_data: { currency: "usd", unit_amount: p.amount, product_data: product_data }
      });
      summary.push(p.name + " (" + when + ") x" + surfers);
    }

    const origin =
      req.headers.origin ||
      (req.headers.host ? "https://" + req.headers.host : "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: line_items,
      customer_email: customer.email || undefined,
      phone_number_collection: { enabled: true },
      success_url: origin + "/success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/checkout.html",
      metadata: {
        customer_name: String(customer.name || "").slice(0, 400),
        customer_phone: String(customer.phone || "").slice(0, 100),
        notes: String(customer.notes || "").slice(0, 480),
        booking: summary.join(" | ").slice(0, 480)
      }
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message || "Could not start checkout." });
  }
};
