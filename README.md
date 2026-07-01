# GeniusRX Server

A production-ready REST API backend for **GeniusRX**, a healthcare career platform connecting job seekers, recruiters, and instructors. Built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. Features role-based access control, Google OAuth, Stripe subscription billing, Cloudinary uploads, Redis-backed real-time messaging, OTP-based email verification, and an ATS resume checker.

For the full endpoint reference (request/response shapes, screen-to-API mapping, Flutter integration notes), see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md). A ready-to-import Postman collection is available at [GeniusRX.postman_collection.json](./GeniusRX.postman_collection.json).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Cache / Real-time | Redis (+ Socket.io Redis adapter) |
| Auth | JWT (access + refresh tokens), Passport.js (Google OAuth + local) |
| Payments | Stripe (subscriptions, checkout, billing portal, webhooks) |
| File Uploads | Multer + Cloudinary |
| Email | Nodemailer (SMTP) + EJS templates |
| Real-time messaging | Socket.io |
| Validation | Zod |
| Security | Helmet, Bcrypt, HTTP-only cookies |
| Deployment | Vercel (serverless) |

---

## Roles

| Role | Description |
|---|---|
| `job_seeker` | Healthcare professionals looking for jobs |
| `recruiter` | Healthcare organizations posting jobs |
| `instructor` | Healthcare educators / trainers |
| `admin` | Platform moderator |
| `super_admin` | Full platform control (identical to `admin`, plus exclusive access to a few destructive actions) |

---

## Project Structure

```
src/
├── server.ts                  # Entry point — DB/Redis connect, graceful shutdown
├── app.ts                     # Express app, middleware setup
├── socket/
│   └── socket.ts               # Socket.io setup (real-time messaging & notifications)
└── app/
    ├── config/
    │   ├── index.ts            # Typed env config
    │   ├── cloudinary.config.ts
    │   ├── multer.config.ts
    │   ├── passport.ts         # Google OAuth + local strategy
    │   └── redis.config.ts
    ├── constants.ts
    ├── interfaces/
    │   ├── index.d.ts          # Express Request augmentation
    │   └── error.types.ts
    ├── errorHelpers/
    │   └── AppError.ts         # Custom operational error class
    ├── helpers/                # Error normalizers (cast, duplicate, validation, zod)
    ├── middlewares/
    │   ├── checkAuth.ts        # JWT guard + RBAC
    │   ├── validateRequest.ts  # Zod schema validation
    │   ├── globalErrorHandler.ts
    │   └── notFound.ts
    ├── routes/
    │   └── index.ts            # Aggregates all module routes under /api/v1
    ├── modules/
    │   ├── auth/                    # Login, logout, refresh token, password, Google OAuth
    │   ├── user/                    # Register, profile, admin user management
    │   ├── upload/                  # Cloudinary file uploads
    │   ├── otp/                     # OTP generation and verification
    │   ├── device_token/            # Push notification device tokens
    │   ├── job_seeker_profile/      # Job seeker profile (experience, skills, education)
    │   ├── recruiter_profile/       # Recruiter/company profile
    │   ├── instructor_profile/      # Instructor profile
    │   ├── resume/                  # Resume uploads
    │   ├── ats_check/                # ATS resume compatibility checker
    │   ├── job/                     # Job listings (CRUD)
    │   ├── application/             # Job applications + interview tracking
    │   ├── saved_job/                # Bookmarked jobs
    │   ├── conversation/             # Messaging conversations
    │   ├── message/                  # Chat messages
    │   ├── block/                    # User block/unblock
    │   ├── report/                   # User reports
    │   ├── moderation_log/           # Admin moderation audit trail
    │   ├── subscription_plan/        # Admin-configurable subscription tiers
    │   ├── subscription/              # Trials, Stripe checkout/portal, webhook, cancel/reactivate
    │   ├── transaction/               # Payment transaction records
    │   ├── notification/              # In-app notifications
    │   ├── static_content/            # CMS pages (About, Privacy, Terms, Support)
    │   └── stats/                     # Admin & recruiter dashboard statistics
    └── utils/
        ├── catchAsync.ts
        ├── sendResponse.ts
        ├── sendEmail.ts
        ├── setCookie.ts
        ├── jwt.ts
        ├── userTokens.ts
        ├── QueryBuilder.ts     # Filterable/paginated query builder
        ├── seedAdmin.ts
        ├── seedSuperAdmin.ts
        └── templates/          # EJS email templates (OTP, forgot password)
```

---

## API Overview

All routes are prefixed with `/api/v1`. See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full request/response payloads.

| Module | Base Path | Highlights |
|---|---|---|
| Auth | `/auth` | Login, refresh token, logout, change/forgot/reset password, Google OAuth |
| User | `/user` | Register, self profile (`/me`), admin user management |
| Upload | `/upload` | Multipart upload to Cloudinary (1–10 files) |
| OTP | `/otp` | Send/verify email OTP |
| Device Token | `/device-token` | Register/remove push notification tokens |
| Job Seeker Profile | `/job-seeker-profile` | Upsert profile, browse by recruiters/instructors |
| Recruiter Profile | `/recruiter-profile` | Company profile management |
| Instructor Profile | `/instructor-profile` | Instructor profile management |
| Resume | `/resume` | Upload, list, set default, delete resumes |
| ATS Check | `/ats-check` | Resume ATS compatibility scoring |
| Job | `/job` | Post, browse, update, soft/force delete jobs |
| Application | `/application` | Apply to jobs, track/update application status |
| Saved Job | `/saved-job` | Bookmark and unbookmark jobs |
| Conversation / Message | `/conversation`, `/message` | Role-restricted real-time messaging |
| Block / Report | `/block`, `/report` | User safety controls |
| Moderation Log | `/moderation-log` | Admin action audit trail |
| Subscription Plan | `/subscription-plan` | Admin-managed pricing tiers |
| Subscription | `/subscription` | Free trial, Stripe checkout/portal, Stripe webhook, cancel/reactivate |
| Transaction | `/transaction` | Payment records |
| Notification | `/notification` | In-app notification inbox |
| Static Content | `/content` | CMS pages (About, Privacy, Terms, Support) |
| Stats | `/stats` | Admin overview/earnings dashboards, recruiter dashboard |

---

## Standard Response Format

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": { "page": 1, "limit": 10, "total": 100, "totalPage": 10 }
}
```

**Error format:**

```json
{
  "success": false,
  "message": "Error description",
  "errorSources": [
    { "path": "email", "message": "Invalid email address format." }
  ]
}
```

---

## Environment Variables

Copy [.env.example](./.env.example) to `.env` and fill in the values:

```env
# Server
PORT=7000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost/genius-rx

# JWT
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRES=30d

# Bcrypt
BCRYPT_SALT_ROUND=10

# Seeded Admin Accounts (auto-created on startup)
SUPER_ADMIN_EMAIL=super_admin@example.com
SUPER_ADMIN_PASSWORD=your_super_admin_password
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:7000/api/v1/auth/google/callback

# Express Session
EXPRESS_SESSION_SECRET=your_express_session_secret

# Frontend URL (CORS + OAuth/email redirects)
FRONTEND_URL=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP (email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_smtp_user@example.com
SMTP_PASS=your_smtp_password
SMTP_FROM=your_smtp_user@example.com

# Redis
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password
```

> **Stripe setup (test mode):**
> 1. Grab your **test-mode** secret key from the Stripe Dashboard → `STRIPE_SECRET_KEY`.
> 2. Creating a subscription plan (`POST /subscription-plan`) automatically creates a matching Stripe Product + recurring Price — you don't need to create them by hand in the Dashboard. Updating a plan's price creates a new Price and archives the old one (Stripe Prices are immutable); deactivating a plan archives its Price.
> 3. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
>    ```
>    stripe listen --forward-to localhost:7000/api/v1/subscription/webhook
>    ```
>    Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET`. In production, create a webhook endpoint in the Dashboard pointed at `<your-domain>/api/v1/subscription/webhook` and use its signing secret instead.
> 4. `POST /api/v1/subscription/webhook` receives the **raw** request body (parsed before `express.json()` in `app.ts`) so the signature can be verified; each Stripe event is recorded by id (`StripeEvent` collection) so retried deliveries aren't double-processed.
> 5. Events handled: `checkout.session.completed` (activation), `customer.subscription.updated` / `.deleted` (status sync), `invoice.paid` (renewal), `invoice.payment_failed` (marks `past_due`).
> 6. Test with Stripe's [test cards](https://stripe.com/docs/testing) (e.g. `4242 4242 4242 4242` for success, `4000 0000 0000 0341` for a decline).

---

## Getting Started

**Prerequisites:** Node.js 18+, MongoDB, Redis

```bash
# 1. Clone the repository
git clone https://github.com/shejanNizam/genius_rx_server.git
cd genius_rx_server

# 2. Install dependencies
npm install

# 3. Copy the env template and fill in the values
cp .env.example .env

# 4. Start the development server (hot-reload)
npm run dev

# 5. Build for production
npm run build

# 6. Start the production server
npm start
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot-reload via `tsx watch` |
| `npm run build` | Compile TypeScript to `dist/` and copy email templates |
| `npm start` | Run compiled server from `dist/server.js` |
| `npm run lint` | Run ESLint |

---

## Key Features

- **Auto-seeding**: Super admin and admin accounts are seeded automatically on startup from `.env` credentials.
- **Graceful shutdown**: Handles `SIGTERM`, `SIGINT`, `unhandledRejection`, and `uncaughtException` — closes DB and Redis connections cleanly.
- **Vercel serverless**: Exports the Express app for Vercel's serverless runtime.
- **Modular architecture**: Each feature is self-contained with its own controller, service, model, validation, and route.
- **QueryBuilder**: Reusable utility for filtering, sorting, and paginating Mongoose queries.
- **Subscription billing**: 7-day free trial per user, real Stripe recurring subscriptions via Checkout, a self-serve Stripe Billing Portal for card updates/cancellation, webhook-driven activation/renewal/cancellation, and an `accessStatus` gate (`trial | subscribed | locked`) enforced across the API.
- **Real-time messaging**: Socket.io (with Redis adapter for horizontal scaling) powers conversations, typing indicators, read receipts, and live notification pushes. Messaging is role-restricted — recruiters must initiate contact with job seekers; job seekers and instructors can message each other freely.
- **ATS resume checker**: Job seekers can score their resumes for ATS compatibility.
- **Trust & safety**: User blocking, reporting, and an admin moderation audit log.
- **CMS**: Admin-editable static content pages (About, Privacy, Terms, Support) served publicly.

---

## Documentation

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) — full endpoint reference, auth flow, role-wise screen → API map, and Flutter integration guide.
- [GeniusRX.postman_collection.json](./GeniusRX.postman_collection.json) — importable Postman collection organized by role, with sample request bodies and environment variables (`baseUrl`, `accessToken`, `refreshToken`, `userId`).
