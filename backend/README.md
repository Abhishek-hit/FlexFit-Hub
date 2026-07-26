# Gym Management & Fitness Platform — Backend API

Spring Boot 3 + MongoDB backend powering the public gym-search website, the Gym Owner
dashboard, and the Gym Member dashboard.

## Tech stack

- Java 17, Spring Boot 3.2
- MongoDB (Spring Data MongoDB)
- Spring Security + JWT (access + refresh tokens)
- Spring WebSocket (STOMP) for live attendance / notifications
- Cloudinary for image & video storage
- ZXing (ready to wire up for QR code generation on the member's attendance code)
- springdoc-openapi (Swagger UI at `/swagger-ui.html`)

## Running locally

```bash
# 1. Start MongoDB (locally or via Docker)
docker run -d -p 27017:27017 --name gym-mongo mongo:7

# 2. Set required env vars (or just accept the dev defaults in application.yml)
export MONGODB_URI=mongodb://localhost:27017/gym_management_db
export JWT_SECRET=<a long random base64 string>
export MAIL_USERNAME=you@gmail.com
export MAIL_PASSWORD=<app password>
export CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=...

# 3. Run
mvn spring-boot:run
```

API base URL: `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui.html`

## What's fully implemented

- **Auth**: owner registration + gym creation, member self-registration (with 3-day free
  trial), owner-adds-member flow (welcome email/SMS + password-setup link), login,
  refresh tokens, email/phone OTP verification, forgot/reset password — all with real
  BCrypt hashing and JWT issuance.
- **Public site**: gym search/filter (name, state, city, rating, price, distance,
  weight-gain/loss specialization), Top-10 gyms (by rating + review count), gym detail,
  gym reviews.
- **Owner dashboard**: totals (members/active/expired/new), monthly revenue, today's
  attendance, pending/paid fees, total income, unread notifications.
- **Member management**: add / edit / delete / search, full profile (photo, age, gender,
  height/weight, auto-computed BMI, goal, membership plan & expiry).
- **Fee management**: due-payment creation, mark-paid (full or partial), auto fee status
  (PENDING → OVERDUE via nightly job → PAID), reminder button that fires SMS + WhatsApp +
  email + in-app notification together, revenue summary.
- **Exercise/workout management**: owner publishes a 7-day workout plan per goal
  (weight gain / weight loss), each day has exercises with sets/reps/rest/difficulty/
  image/video; media upload endpoint for exercise images and tutorial/machine videos.
- **Diet plan management**: owner publishes a 7-day meal plan per goal with
  breakfast/lunch/dinner/snacks, calories/protein/carbs/fats, water intake.
- **Workout tracker**: member marks today's workout done → daily/weekly/monthly
  progress + current/longest streak, auto-computed server-side.
- **Attendance**: QR/NFC/GPS/manual check-in against a member's unique `attendanceCode`,
  late-entry flagging, live push to the owner dashboard over WebSocket
  (`/topic/gym/{gymId}/attendance`), today/weekly/monthly/last-month reports + attendance %.
- **Reviews & ratings**: member review (1x per gym), gym `avgRating`/`totalReviews`
  recomputed automatically → feeds the Top-10 list.
- **Notifications**: persisted + real-time via WebSocket
  (`/topic/user/{userId}/notifications`) for fee reminders, membership/trial expiry,
  new workout/diet plan, attendance marked, payment success, welcome.
- **Security**: JWT auth, role-based route protection (`OWNER` vs `MEMBER`), BCrypt
  password hashing, OTP-gated email/phone verification.
- **Scheduled jobs**: nightly trial/membership expiry, 2-day-before expiry warnings,
  daily overdue-fee flagging + reminder.

## What's intentionally pluggable (external paid services)

These need real vendor credentials which weren't available in this environment. Each is
behind a small interface so swapping in the real implementation is a single new
`@Service` class — nothing else in the codebase needs to change:

| Capability | Interface | Current impl | Swap in |
|---|---|---|---|
| SMS | `SmsService` | `MockSmsServiceImpl` (logs only) | Twilio / MSG91 — set `sms.provider` |
| WhatsApp | `WhatsAppService` | `MockWhatsAppServiceImpl` (logs only) | Meta Cloud API — set `whatsapp.provider` |
| Online payment gateway | `PaymentGatewayService` | `MockPaymentGatewayServiceImpl` | Razorpay/Stripe — set `payment.gateway.provider` |
| Face recognition attendance | — | not implemented (per spec, listed as a *future* enhancement) | plug a recognition provider into `AttendanceService.checkIn` |
| AI diet/workout recommendations | — | not implemented (per spec, listed as a *future* enhancement) | new `AiRecommendationService` calling an LLM/ML provider |

Email (verification, reminders, password reset) **is real** — it uses
`JavaMailSender`/SMTP, just point `MAIL_USERNAME`/`MAIL_PASSWORD` at a real account.
Cloudinary uploads are real too, once real credentials are set.

## Key endpoint groups

```
POST   /api/auth/register/owner
POST   /api/auth/register/member
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/otp/send | /api/auth/otp/verify
POST   /api/auth/forgot-password | /api/auth/reset-password | /api/auth/setup-password

GET    /api/gyms/search?query=&state=&city=&minRating=&maxPrice=&weightGainSpecialized=&lat=&lng=&maxDistanceKm=
GET    /api/gyms/top10
GET    /api/gyms/{id}
GET    /api/gyms/{id}/reviews

# Owner (requires ROLE_OWNER)
GET/PUT /api/owner/gyms/{gymId}
POST   /api/owner/gyms/{gymId}/images
POST/DELETE /api/owner/gyms/{gymId}/plans[/{planId}]
GET/POST/PUT/DELETE /api/owner/gyms/{gymId}/members[/{memberId}]
GET/POST /api/owner/gyms/{gymId}/fees ; POST .../mark-paid ; POST .../remind
GET    /api/owner/gyms/{gymId}/attendance ; .../attendance/report
GET/POST /api/owner/gyms/{gymId}/workout-plans ; POST .../media
GET/POST /api/owner/gyms/{gymId}/diet-plans
GET    /api/owner/gyms/{gymId}/dashboard

# Member (requires ROLE_MEMBER)
GET/PUT /api/member/profile ; POST /api/member/profile/photo
GET    /api/member/workout/plan ; POST /api/member/workout/complete ; GET .../progress
GET    /api/member/diet/plan
GET    /api/member/payments ; POST /api/member/payments/online/create-order
GET    /api/member/attendance
POST   /api/member/gyms/{gymId}/reviews
GET    /api/member/dashboard

# Shared / public
POST   /api/attendance/check-in            (public — QR/NFC/GPS kiosk or member app)
GET    /api/notifications ; .../unread-count ; POST .../{id}/read
```

## Not yet built (frontend)

This repository is backend-only, as requested. The React + Tailwind frontend consuming
this API is the next step.
