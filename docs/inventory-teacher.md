# Teacher Page Feature Inventory

## Pages

- `/teacher` — main dashboard
- `/teacher/campaigns` — QR campaign management
- `/teacher/campaigns/sheet` — print-ready QR poster sheet
- `/teacher/test-pagos` — payment testing (QA) (remove)

## Dashboard ( /teacher )

### Auth

- teacher_session cookie check
- Logout → deletes cookie + redirects to /login
- Loading state: full-screen "Cargando panel del profesor..."
- Error state: red card + redirect to /login if unauthorized

### Header

- "Dashboard del Profesor" + "Mauricio Tellez · Gestion academica y de alumnos activos"
- Navigation: Campañas QR (/teacher/campaigns), Pagos de prueba (/teacher/test-pagos), Cerrar Sesion

### Upcoming Sessions Table (remove)

- Status="booked", dateTime &gt;= now, sorted ascending
- Columns: Fecha y Hora | Estudiante | Contacto | Tipo de Clase | Acciones
- Contact: phone number + WhatsApp chat link
- Type badge: "Demo Gratis" (intro) / "Sesion Privada" (tutoring) + duration
- Actions: meeting link button (WhatsApp)
- Empty state: dashed box + "No hay sesiones proximas"

### Active Students Table (last 30 days) (remove)

- Deduplicated from sessions + payments in last 30 days
- Columns: Nombre | Correo | Telefono/WhatsApp | Creditos | Examen de Ubicacion
- Email: mailto link
- Phone: WhatsApp link
- Credits: centered, bold
- Placement exam: proficiency level badge + score fraction, or "No realizado"
- Empty state: dashed box + "No hay estudiantes activos"

### Referrals Table (remove)

- Last 12, sorted by createdAt desc
- Columns: Referente | Nuevo estudiante | Estado | Bono
- Status badge: "Recompensado" (emerald) / "Pendiente" (amber)
- Bonus: reward credits count + description
- Empty state: dashed box + "Todavia no hay referidos"

## Campaign Management ( /teacher/campaigns )

### Header

- "Campañas QR" + QR icon + description
- Nav: Hoja para imprimir (/teacher/campaigns/sheet), Panel (/teacher)

### Summary Cards (5)

- Campañas (count), Escaneos (sum), Registros (sum), Pagan (sum), Ingresos ($MXN)

### Create Campaign Form

- Fields: Código\* (required), Nombre, Medio (select: combi/flyer/bulletin/poster/sticker/store/other), Destino (default: /clases-de-ingles-en-tehuacan), Fallback (optional), Permanente (checkbox)
- Bulk creation toggle: textarea (one per line: code | name | medium)
- "Crear campana" + "Crear en lote" submit buttons

### Campaign Performance Table

- Columns: Campaña | Medio | Escaneos | Registros | Pagan | Ingresos | Conv. | Estado | Acciones
- Per campaign: label, copyable scan URL (/q/{code}), medium badge, 7d/30d scan subtotals, conversion %
- Status: "activa" (emerald) / "retirada" (gray)
- Actions: QR icon (opens QR modal), Users icon (toggle signup list), Power icon (toggle active), "editar" (inline edit)

### Inline Edit Row

- Fields: Nombre, Destino, Fallback, Permanente
- "Guardar" button → updateCampaignAction

### Signup List (expandable per campaign)

- Student name + email, registration date, payment status badge

### QR Code Modal

- Full-screen overlay with blur backdrop
- Campaign code, URL, QR image (base64 PNG)
- "Descargar PNG" button, "Cerrar" button, backdrop click to close

## QR Sheet ( /teacher/campaigns/sheet )

- Print-optimized: white background, @page margin 12mm
- Grid: 2 cols mobile, 3 cols desktop
- Each card: QR image (max 180px), label, /q/{code}, medium
- Toolbar (hidden on print): Volver, Imprimir

## Test Payments ( /teacher/test-pagos )

- 3 payment method cards: Tarjeta, OXXO, SPEI
- Each: $10 MXN Stripe Checkout
- Status via URL params: ?ok=1 / ?cancel=1 / ?error
- No credits granted (metadata purpose="payment-test")

## Server Actions (10) (remove all unusaed adter "students" are deleted)

- getTeacherDashboardDataAction — sessions, active students, referrals
- teacherLogoutAction — clear cookie
- listCampaignsAction — all campaigns with stats
- createCampaignAction — single campaign
- createCampaignsBulkAction — bulk creation
- setCampaignActiveAction — toggle active/inactive
- updateCampaignAction — partial update
- generateCampaignQrAction — QR code dataURL
- generateCampaignSheetAction — QR sheet data
- getCampaignSignupsAction — signups per campaign
- createTestCheckoutAction — $10 Stripe test checkout

## Campaign Engine (lib/campaigns.ts) (remove all unusaed adter "students" are deleted)

- Bot detection (isBotUserAgent) — blocks social preview crawlers
- Redirect resolution (resolveCampaignRedirect) — fallback chain up to 8 hops
- Scan recording (recordScan) — increment scan + daily counter
- Signup attribution (recordSignupAttribution) — link student to campaign
- Stats (getCampaignStats) — read-time analytics
- Indexes on campaigns, scans, signups collections
