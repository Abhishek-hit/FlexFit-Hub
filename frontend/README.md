# GymPro — Frontend

React (Vite) + plain CSS frontend for the Gym Management & Fitness Platform. Connects
directly to the Spring Boot backend (`gym-management-api`) — no mock data, every screen
is driven by real API responses tied to whoever is logged in.

## Setup

```bash
npm install
cp .env.example .env
# edit .env if your backend isn't on localhost:8080
npm run dev
```

Runs at `http://localhost:5173`. Make sure the backend is running first (see the
backend's own README) and that its CORS origins include `http://localhost:5173`
(`CORS_ORIGINS` env var — already included by default).

## How role-based dashboards work

- Register a gym at `/register/gym` (3-step form → OTP email verification → sign in) or
  register as a member at `/register/member` (search a gym → fill profile → instant
  3-day trial + auto sign-in).
- After login, the app reads the `role` returned by `/api/auth/login` and routes to:
  - `OWNER` → `/owner/gyms/{gymId}/dashboard` — **sidebar nav** (Dashboard, Analytics,
    All Members, Attendance, Fee Management, Workout Plans, Diet Plans, Exercise Videos,
    Settings).
  - `MEMBER` → `/member/dashboard` — **top nav** (Dashboard, Workout Plan, Diet Plan,
    Attendance, Payments).
- Every card/table/chart on both dashboards is populated from that user's own data —
  there is no seeded/demo content. A freshly registered gym owner sees zero members
  until they add some; a freshly registered member sees "no workout plan yet" until
  their gym owner publishes one.
- `ProtectedRoute` guards both trees: an unauthenticated visitor is bounced to
  `/login`, and a member trying to open an `/owner/**` URL (or vice versa) is
  redirected to their own dashboard.

## Real-time

The owner dashboard and attendance page open a STOMP/SockJS connection
(`VITE_WS_URL`, default `http://localhost:8080/ws`) and subscribe to
`/topic/gym/{gymId}/attendance` — a member check-in appears in the "Live Activity" feed
instantly, matching the backend's WebSocket push.

## Structure

```
src/
  api/            one file per backend resource (axios wrappers)
  context/        AuthContext (session/JWT), ToastContext
  components/
    owner/        sidebar + shell layout for the owner dashboard
    member/       top-nav shell layout for the member dashboard
    common/       Modal, Loader, StatusBadge, EmptyState, shared NotificationsPage
  pages/
    public/       landing page, gym detail
    auth/         login, owner register (wizard), member register, forgot/reset password
    owner/        dashboard, analytics, members, attendance, fees, workout/diet plan
                   builders, exercise video uploads, settings
    member/       dashboard ("My Fitness Hub"), workout, diet, attendance calendar,
                   payments (UPI QR modal)
  utils/          useWebSocketTopic hook
```

## Notes

- Plain CSS only (`src/index.css` + one stylesheet per feature area) — no Tailwind, no
  CSS-in-JS.
- The "Pay via UPI" modal renders a real scannable QR code (via `qrcode.react`) encoding
  a `upi://pay?...` deep link built from the gym's configured UPI ID (set it under
  Owner → Settings). If no UPI ID is set yet, the modal says so instead of showing a
  fake code.
- File uploads (gym images, member photos, exercise media) hit the backend's Cloudinary
  endpoints directly — they'll only succeed once real Cloudinary credentials are set in
  the backend's `application.yml`.
