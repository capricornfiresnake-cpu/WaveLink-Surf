# Connecting Stripe (Vercel + Stripe Checkout)

This site now has real card payment wired up. You just need to create the
accounts and plug in your keys — no coding required.

## What's already built for you
- `api/create-checkout-session.js` — creates the Stripe payment page. Prices
  live **here on the server** (Private $125, Semi-Private $98, Group $80), so
  they can't be tampered with from the browser.
- `api/webhook.js` — (optional) confirms a payment truly succeeded.
- `checkout.html` + `assets/js/checkout.js` — "Continue to Secure Payment"
  sends the cart to Stripe and redirects to Stripe's hosted checkout.
- `success.html` — the "thank you" page shown after payment (clears the cart).
- `package.json` — declares the Stripe library.

## One-time setup

### 1. Create your Stripe account
- Go to https://stripe.com and sign up.
- Add your business info and **connect your bank account** (Stripe → Settings →
  Payouts) so money can be paid out to you.

### 2. Get your secret key
- Stripe Dashboard → **Developers → API keys**.
- Copy the **Secret key** (starts with `sk_test_…` while testing, `sk_live_…`
  when you go live). Keep it private — never put it in the website files.

### 3. Put the site online with Vercel
- Create a free account at https://vercel.com (easiest: sign in with GitHub).
- Push this folder to a GitHub repo, then in Vercel click **Add New → Project**
  and import it. (Or install the Vercel CLI and run `vercel` in this folder.)
- Vercel auto-detects the static site and the `api/` functions. No build settings needed.

### 4. Add your key to Vercel
- Vercel → your project → **Settings → Environment Variables**.
- Add:  Name = `STRIPE_SECRET_KEY`  Value = your `sk_test_…` key.
- Redeploy (Vercel → Deployments → ⋯ → Redeploy) so the key takes effect.

### 5. Test it
- Open your live site, book a lesson, go to checkout, click **Continue to
  Secure Payment**.
- On Stripe's page use test card `4242 4242 4242 4242`, any future expiry, any
  CVC, any ZIP. You should land on the "thank you" page and see the payment in
  Stripe → Payments.

### 6. Go live
- In Stripe, toggle from **Test mode** to **Live mode**, copy the **live**
  secret key (`sk_live_…`), and update `STRIPE_SECRET_KEY` in Vercel with it.
- Redeploy. Real cards now work.

## Optional: payment confirmation webhook (recommended)
So you get a reliable "paid" signal even if the buyer closes the tab:
1. Stripe → **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://YOUR-DOMAIN/api/webhook`
3. Event to send: `checkout.session.completed`
4. Copy the **Signing secret** (`whsec_…`).
5. In Vercel, add env var `STRIPE_WEBHOOK_SECRET` = that value, and redeploy.
6. In `api/webhook.js`, the "FULFILLMENT" section is where you can email Ari the
   booking or add it to a calendar (currently it just logs it).

## If you change prices later
Update the amounts (in cents) in **`api/create-checkout-session.js`** (`PRICES`)
AND the displayed prices in `book.html` / `index.html` / `assets/js/booking.js`
so the page and the charge always match.

## Note
The payment flow only works on Vercel (or `vercel dev` locally) because it needs
the serverless function. Opening the files directly / `npx serve` will show a
graceful "couldn't start checkout" message on the checkout step — that's expected.
