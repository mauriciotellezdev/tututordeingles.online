# Student Dashboard Feature Inventory (remove all)

## Pages

- `/student` — main dashboard (remove)
- `/placement-quiz` — quiz router (redirects based on state)
- `/quiz/placement/question/[id]` — quiz taking (1-25)
- `/quiz/placement/booking` — score display + booking free intro
- `/quiz/placement/confirmed` — booking confirmation
- `/comprar-prueba` — QA: $10 MXN Stripe test checkout

## Dashboard ( /student )

### Welcome

- Emoji + "Hola, {name}" + subtitle
- Full-screen loading state

### Upcoming Sessions Card

- Conditions: only when sessions exist
- Per session: date (es-MX locale), time (24h CDMX), duration, type badge
  - type="intro" → green "Gratis" badge + "Consulta demo gratuita"
  - otherwise → "Sesión individual"
- WhatsApp link to teacher (green button)
- SessionActions sub-component:
  - Mode idle: Reprogramar (opens reschedule UI), Cancelar (confirm + cancel)
  - Mode reschedule: date picker (8 days, no Sundays), slot picker (11:00/16:00), Confirmar, Volver

### Group Club Card

- Always rendered — gradient background, Users icon
- "$200/sesión · Introductory"
- Description: cohorts of 6, Sundays 11:00/16:00, real locations, first 20 students
- 2-column grid: Grupo 1 (Domingo 11:00) / Grupo 2 (Domingo 16:00)
- CTA: "Contáctame para unirte" → WhatsApp

### Quiz Result Card

- Only when student.quizResult exists
- Score circle: {score} / de {totalQuestions}
- Proficiency level: A1-A2 / B1 / B2 / C1-C2 with description

### Referral Program Card

- Only when referral object exists
- Stats: Código, Invitaciones, Pagados, Créditos
- Referral link display + copy button + share via WhatsApp
- Pending conversions count

### Footer

- Support email: [mauricio@tututordeingles.online](mailto:mauricio@tututordeingles.online)

### Header

- Logo → /
- Desktop: empty navLinks, Salir (logout)
- Mobile: hamburger, same links + Entrar/Regístrate

## Placement Quiz

### Quiz Question Page

- Auth guard: redirects to /signup if no session
- Redirects to /student if already completed
- Fetches quiz (25 questions, answers without correctAnswerId)
- Seeded shuffle of answers (mulberry32 + FNV-1a)
- localStorage persistence (placement_quiz_answers)
- Progress bar: "Pregunta n de 25" + percentage
- Back / Next navigation
- Last question → "Finalizar y Ver Resultados"
- Submit calls submitQuizAction(), clears localStorage, redirects to /booking

### Booking Page (after quiz)

- Score circle + level badge + description
- Step indicator: "Paso 2 de 2"
- Date picker: 10 days, no Sundays
- Time slot picker: 9 slots (09:00-17:00), booked slots disabled
- "Agendar Sesión Demo Gratis" → bookIntroCallAction
- Success → /quiz/placement/confirmed

### Confirmed Page

- Green checkmark, "Sesión demo agendada con éxito"
- Details: date, time, platform (WhatsApp)
- "Ir a mi Panel de Control" → /student

## Server Actions (12)

- getStudentDashboardDataAction — full dashboard data (student, referral, credits, sessions, teacher)
- getBookedSlotsAction — booked slots for a date
- bookSessionAction — book tutoring (costs 1 credit) or intro (free)
- cancelSessionAction — cancel + refund logic
- rescheduleSessionAction — change date/time
- createCheckoutSessionAction — Stripe Checkout (single $450 / package$3600)
- verifyPaymentAction — verify Stripe + credit student
- getCurrentStudentAction — session check
- getQuizAction — fetch quiz without answers
- submitQuizAction — grade + save
- bookIntroCallAction — book free 30-min intro
- saveQuizProgressAction — save quiz progress
- logoutAction — clear cookie

## API Routes

- POST /api/webhook/stripe — Stripe event handler (charge.refunded, checkout.session.completed/failed)
- GET /api/reconcile-payments — admin: reconcile Stripe payments
- POST /api/verify-payment — client-side: verify after Stripe redirect
- GET /api/cron/reminders — email reminders for upcoming sessions
- POST /api/e2e/seed-student — create test student
- POST /api/e2e/seed-campaign — create test campaign
- POST /api/e2e/simulate-payment — simulate payment pipeline
- POST /api/e2e/teacher-session — set teacher cookie
- GET /api/e2e/verification-code — get student verification code
- POST /api/e2e/reset — delete student + all associated data

## Models

- Student (\_id, name, email, phone, referralCode, verificationCode, quizResult, quizProgress, stripeCustomerId, signupBrowserId, signupIpHash, signupUserAgentHash, signupCampaignCode, timestamps)
- Session (\_id, studentId, type, dateTime, duration, status, meetingLink, creditId, timestamps)
- Credit (\_id, studentId, amount, source, description, stripeChargeId, timestamps)
- Referral (\_id, referrerStudentId, referredStudentId, campaignCode, rewardGrantedAt, timestamps)
- Campaign (code, label, medium, target, active, permanent, fallbackCode, stats, timestamps)

## Libraries

- bookings.ts — findConflictingSession
- timezone.ts — getTimeZoneDateKey, getTimeZoneHourLabel
- referrals.ts — generate code, build link, dashboard summary, reward logic
- stripe-verify.ts — resolveCheckoutSessionPaymentContext, processCompletedPayment, reverseRefundedPayment
- mail.ts — sendMail via Brevo API or local SMTP (nodemailer)
- mail-limits.ts — daily email quota monitoring
- otp-guard.ts — brute-force protection on OTP
- campaigns.ts — bot detection, scan recording, signup attribution, stats engine
