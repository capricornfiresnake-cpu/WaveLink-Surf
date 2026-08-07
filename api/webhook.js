/* =====================================================================
   WAVELINK — Stripe webhook (OPTIONAL but recommended)
   Stripe calls this URL when a payment truly succeeds, so you can trust
   the booking is paid (more reliable than the browser redirect).
   Requires env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
   Point your Stripe webhook at:  https://YOUR-DOMAIN/api/webhook
   Listen for event: checkout.session.completed
   ===================================================================== */
const Stripe = require("stripe");

module.exports = async (req, res) => {
  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whSecret) {
    res.status(500).end("Webhook not configured");
    return;
  }
  const stripe = Stripe(key);

  // read the raw body (required for signature verification)
  let raw = "";
  await new Promise(function (resolve) {
    req.on("data", function (c) { raw += c; });
    req.on("end", resolve);
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, req.headers["stripe-signature"], whSecret);
  } catch (e) {
    res.status(400).end("Webhook signature verification failed: " + e.message);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    // ---- FULFILLMENT ----
    // Payment succeeded. `s.customer_email`, `s.customer_details.phone`,
    // and `s.metadata` (customer_name, notes, booking) hold the details.
    // Add your confirmation here, e.g. email Ari with the booking, or
    // write it to a spreadsheet / calendar.
    console.log("Paid booking:", s.customer_email, s.metadata);
  }

  res.status(200).json({ received: true });
};

// Stripe needs the raw, unparsed body to verify the signature
module.exports.config = { api: { bodyParser: false } };
