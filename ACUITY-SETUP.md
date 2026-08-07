# Connecting Acuity Scheduling (calendar + payments)

Goal: real-time booking that **prevents double-booking**, with payment taken
through your Stripe account. With one instructor (Ari), Acuity will only offer
times that are actually free — so two people can never grab the same slot.

## Order of operations
Do these in order; each unlocks the next.

### 1. Activate Stripe (now possible — the site is live)
- Log in at https://dashboard.stripe.com
- Finish "Activate payments": business info + connect your bank for payouts.
- When it asks for a **business website**, use your live URL
  (e.g. `https://wave-link-surf.vercel.app`).

### 2. Create your Acuity account
- Go to https://acuityscheduling.com and start the free trial.
- To accept payments you'll need a paid plan (~$20/mo, the "Emerging" plan).

### 3. Create your 3 appointment types
Acuity → **Availability / Appointment Types → New Type of Service**. Make three:
| Name              | Duration | Price | Notes                          |
|-------------------|----------|-------|--------------------------------|
| Private Lesson    | 1h 30m   | $125  | 1 client                       |
| Semi-Private Lesson | 1h 30m | $98   | price is per surfer (2 total)  |
| Group Lesson      | 1h 30m   | $80   | price per person, 3+ clients   |

### 3a. Set up the Group Lesson as a group class (per-person price + quantity)
A normal appointment type has no "number of people" selector. To let clients
pick 3+ surfers at $80 each, the Group Lesson must be a **group class**:

1. Acuity → **Appointment Types → + New Type of Service** (or edit Group Lesson).
2. Choose the option that makes it a **class / group** ("multiple clients can book
   the same time"). Set: Name = Group Lesson · Duration = 1h 30m · **Price = $80
   (per person)**.
3. Set **minimum group size = 3** and a **maximum** (e.g., 6). Acuity enforces the
   minimum, so nobody can book a group of 1–2.
4. Turn on the quantity selector: **Scheduling Page settings → check "Classes:
   Allow clients to book multiple spots."** This adds the +/– (Quantity) so one
   person can book 3, 4, 5… surfers and it charges $80 each ($240 for 3, $320 for
   4, and so on).
5. Add the **class times** you want to offer groups (classes appear at set times,
   and the page shows how many spots are left).

Note: classes are open-enrollment by default — another party could join the same
class time up to your maximum. If you'd rather each group booking be private to one
party, use a regular appointment at a $240 base + an "$80 extra surfer" add-on
instead.

### 4. Set your availability
Acuity → **Availability** → set the weekly hours/days you actually coach.
Acuity blocks out anything already booked automatically.

### 5. Connect Stripe to Acuity
Acuity → **Settings → Payments → Connect** → choose **Stripe** → log in / authorize.
Then set each appointment type to **require full payment at the time of booking**
(or a deposit, if you prefer).

### 6. Send me two things and I'll wire it into the site
1. Your Acuity **scheduling page link** — Acuity → **Client's Scheduling Page**,
   it looks like `https://app.acuityscheduling.com/schedule.php?owner=XXXXXXX`
2. (Optional) the **appointment type IDs** if you want each "Book Now" button to
   jump straight to that specific lesson. In Acuity, open an appointment type and
   copy the number in its "Direct scheduling link."

## What I'll do once you send those
- Embed Acuity's live booking calendar into the **Book Online** page (keeping your
  three lesson cards — each "Book Now" opens Acuity to that lesson).
- Retire the old custom cart / checkout / request-email flow (Acuity replaces it).
- Commit + push so it goes live on the same URL.

## Result
Clients pick a real, available time → pay by card (via your Stripe) → the slot is
instantly reserved so no one else can take it → you get a booking notification and
it lands on your Acuity calendar (which can sync to your phone/Google Calendar).
