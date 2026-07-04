# QA / Launch Testing Plan — Tu Tutor de Inglés

Pre-launch manual QA regimen. Ordered so **Phase 1 is the go/no-go gate**, then
deepening. Tags: **[auto]** = already covered by e2e / webhook live-fire tests
(a light confirm is enough) · **[human]** = needs your hands / real money / a
real inbox · **[you decide]** = a config choice.

## ⚠️ Read first: production is LIVE Stripe

Every payment test is **real money**. "Pagos de prueba" charges the **$10 MXN
minimum** — a card test is a real $10 (refund it after in Stripe), OXXO is real
$10 cash at the store. **Stripe test cards do NOT work in live mode** — use a
real card. Budget ~$30 and refund the card charges.

## Phase 0 — Have these ready

- [ ] Your **phone** (100% of QR traffic is mobile — test there, not desktop)
- [ ] A **Gmail you control** as "the student", plus a **second, different
      email** for the referral test
- [ ] A **real debit/credit card** + ~$10 cash for one OXXO run
- [ ] **Teacher login** (`mauricio@` OTP), **Stripe dashboard**, and the
      receiving **inbox (check spam too)**

---

## Phase 1 — GO / NO-GO smoke test (~20 min, all on your phone)

**If any of these fail, do not advertise.**

- [ ] **[human]** Scan a real `/q/<code>` (or open `tututordeingles.online/q/test-1`)
      → lands on the Tehuacán page.
- [ ] **[human]** Homepage + Tehuacán page render clean on mobile; tap
      "Agenda tu clase gratis" → `/signup`.
- [ ] **[human] ← the critical one:** Sign up (name/email/phone, check consent)
      → the **OTP email arrives within ~30s. CHECK SPAM.** Enter code → lands on
      the quiz.
  - If in spam → mark "Not spam" + reply (builds reputation).
  - If it never arrives → **STOP**, it's Brevo config.
- [ ] **[human]** Complete the quiz → book the **free demo** → confirmation page
      → **.ics + confirmation email arrives**.
- [ ] **[human]** One **real $10 card payment** via dashboard "Comprar" → Stripe
      checkout → back to dashboard → **credit shows +1** → **book a paid class**
      with it. (Refund the charge in Phase 2.)

**Pass all 5 → you can advertise.**

---

## Phase 2 — Payment rails (real money, ~15 min)

- [ ] **[human]** Teacher → **Pagos de prueba → Probar tarjeta** ($10) →
      completes → **Stripe dashboard** shows the charge → **refund it in Stripe**
      → within a minute the student's credit reverses (claw-back). _(claw-back
      is [auto]-verified with real events; confirm end-to-end once.)_
- [ ] **[human]** **Probar OXXO** → get a voucher → **pay $10 at an OXXO** →
      within hours Stripe marks it paid → credit lands. _(Only way to truly
      prove the async OXXO path.)_
- [ ] **[later]** **SPEI** — same drill once your ID clears and you enable it in
      Stripe. Until then it's correctly hidden (checkout degrades to card+OXXO).

---

## Phase 3 — Funnel depth (~15 min)

- [ ] **[human]** **Login** (returning): log out → `/login` → request code →
      arrives → dashboard. _(auto)_
- [ ] **[human]** **Cancel** a class >24h out → credit refunded; cancel one
      <24h out → credit forfeited (per terms). _(auto)_
- [ ] **[human]** **Reschedule** a class → new time sticks, both emails sent.
      _(auto)_
- [ ] **[human]** **Quiz resume:** start the quiz, answer a few, open it on a
      **different device/browser** as the same student → resumes where you left
      off (not question 1). _(auto — was a real bug; worth a human confirm.)_
- [ ] **[human]** **Referral:** copy your student referral link → open in a
      **fresh browser** → sign up with your **second email** → pay $10 → the
      first account's dashboard shows **1 invite / 1 paid / 1 bonus credit**.
      _(auto)_

---

## Phase 4 — Growth & ops (~15 min)

- [ ] **[human]** **QR tracking:** create a code in `/teacher/campaigns` → scan
      its `/q/` link on your phone → sign up → the campaign shows **scans /
      signups** (and revenue once that student pays). Confirm bot preview-scans
      aren't inflating counts.
- [ ] **[human]** **Print sheet:** `/teacher/campaigns` → "Hoja para imprimir"
      → clean printable grid.
- [ ] **[human]** **WhatsApp OG preview:** paste
      `tututordeingles.online/clases-de-ingles-en-tehuacan` into a WhatsApp chat
      → a **real image preview** renders (not blank). _(Was broken pre-fix.)_
- [ ] **[human]** **Cookie consent** banner appears first visit → Accept → gone
      on reload. _(auto)_
- [ ] **[you decide]** **Analytics:** GA4 + Meta Pixel are wired but **inert
      until you add the IDs** (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`
      in Vercel). To measure ads at launch, add them → confirm a `sign_up` /
      `Lead` event fires on signup (GA4 realtime / Pixel Helper).
- [ ] **[human]** **Reminders:** book a class for tomorrow → the reminder email
      should arrive ~14:00 UTC via the daily Vercel cron. Or force it by hitting
      `/api/cron/reminders` with the `CRON_SECRET` bearer header.

---

## Phase 5 — Deliverability & abuse (over the launch week)

- [ ] **[human]** Send **each** email type (signup OTP, login OTP, booking
      confirm) to a Gmail → header shows `spf=pass; dkim=pass; dmarc=pass`
      (View → Show original).
- [ ] **[human]** **Google Postmaster Tools** — set up; watch domain reputation + spam rate as real signups arrive.
- [ ] **[human]** **Brevo quota** — you get an auto-email to `TEACHER_EMAIL` at
      50% and 80% of the daily cap. Confirm you can receive it.
- [ ] **[human]** **OTP abuse:** request a login code 7+ times fast for one
      email → throttled ("Espera X segundos"); enter a wrong code 5× → locked
      ~15 min. _(auto, but nice to feel.)_

---

## Watch-list (known-thin spots)

1. **Email in spam** — new domain, expected early. Warm it (Phase 5) **before**
   heavy ad spend.
2. **Brevo 300/day free cap** — fine at launch volume; the auto-alert protects
   you. Raise `MAIL_DAILY_CAP` if you upgrade Brevo.
3. **Timezone booking** — half-hour-offset zones use the absolute-overlap check
   (auto-tested); eyeball the first few real bookings anyway.
4. **Analytics blind spot** — launching ads without the GA4/Pixel IDs set means
   you can't measure them.

## Minimum to advertise

Phase 1 (all 5) **+** the **card** rail in Phase 2. Everything else can trail
into launch week.
