# Tour Management Server

A production-ready REST API backend for a tour management platform built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. Features role-based access control, Google OAuth, Stripe payment integration, Cloudinary image uploads, Redis caching, OTP-based email verification, and PDF invoice generation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js v5 |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Cache / Session | Redis |
| Auth | JWT (access + refresh tokens), Passport.js (Google OAuth + local) |
| Payment | Stripe |
| File Uploads | Multer + Cloudinary |
| Email | Nodemailer (SMTP) + EJS templates |
| PDF | PDFKit |
| Validation | Zod |
| Security | Helmet, Bcrypt, HTTP-only cookies |
| Deployment | Vercel (serverless) |

---

## Project Structure

```
src/
├── server.ts                  # Entry point — DB/Redis connect, graceful shutdown
├── app.ts                     # Express app, middleware setup
└── app/
    ├── config/
    │   ├── index.ts           # Typed env config
    │   ├── cloudinary.config.ts
    │   ├── multer.config.ts
    │   ├── passport.ts        # Google OAuth + local strategy
    │   └── redis.config.ts
    ├── constants.ts
    ├── interfaces/
    │   ├── index.d.ts         # Express Request augmentation
    │   └── error.types.ts
    ├── errorHelpers/
    │   └── AppError.ts        # Custom operational error class
    ├── helpers/               # Error normalizers (cast, duplicate, validation, zod)
    ├── middlewares/
    │   ├── checkAuth.ts       # JWT guard + RBAC
    │   ├── validateRequest.ts # Zod schema validation
    │   ├── globalErrorHandler.ts
    │   └── notFound.ts
    ├── routes/
    │   └── index.ts           # Aggregates all module routes under /api/v1
    ├── modules/
    │   ├── auth/              # Login, logout, refresh token, password, Google OAuth
    │   ├── user/              # Register, profile, admin user management
    │   ├── tour/              # Tours + tour types (CRUD, image upload)
    │   ├── booking/           # Tour bookings
    │   ├── payment/           # Payment records
    │   ├── payment/           # Stripe payment gateway integration
    │   ├── otp/               # OTP generation and verification
    │   ├── division/          # Geographic divisions
    │   └── stats/             # Admin dashboard statistics
    └── utils/
        ├── catchAsync.ts
        ├── sendResponse.ts
        ├── sendEmail.ts
        ├── setCookie.ts
        ├── jwt.ts
        ├── userTokens.ts
        ├── QueryBuilder.ts    # Filterable/paginated query builder
        ├── getTransactionId.ts
        ├── invoice.ts         # PDF invoice generator
        ├── seedAdmin.ts
        ├── seedSuperAdmin.ts
        └── templates/         # EJS email templates (OTP, forgot password, invoice)
```

---

## API Endpoints

All routes are prefixed with `/api/v1`.

### Auth — `/api/v1/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/login` | Public | Credentials login |
| POST | `/refresh-token` | Public | Get new access token |
| POST | `/logout` | Public | Logout |
| POST | `/change-password` | All roles | Change password |
| POST | `/set-password` | All roles | Set password (OAuth users) |
| POST | `/forgot-password` | Public | Send reset OTP via email |
| POST | `/reset-password` | All roles | Reset password with OTP |
| GET | `/google` | Public | Initiate Google OAuth |
| GET | `/google/callback` | Public | Google OAuth callback |

### User — `/api/v1/user`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| GET | `/all-users` | Admin, Super Admin | Get all users |
| GET | `/me` | All roles | Get own profile |
| GET | `/:id` | Admin, Super Admin | Get user by ID |
| PATCH | `/:id` | All roles | Update user profile |

### Tour — `/api/v1/tour`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/create` | Admin, Super Admin | Create tour (with image upload) |
| GET | `/all` | Public | Get all tours |
| GET | `/:slug` | Public | Get single tour by slug |
| PATCH | `/:id` | Admin, Super Admin | Update tour |
| DELETE | `/:id` | Public | Delete tour |
| POST | `/create-tour-type` | Public | Create tour type |
| GET | `/tour-types/all` | Public | Get all tour types |
| GET | `/tour-types/:id` | Public | Get single tour type |
| PATCH | `/tour-types/:id` | Public | Update tour type |
| DELETE | `/tour-types/:id` | Public | Delete tour type |

### Booking — `/api/v1/booking`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/create` | All roles | Create a booking |

### Payment — `/api/v1/payment`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/invoice/:paymentId` | All roles | Get invoice download URL |

### OTP — `/api/v1/otp`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| — | — | — | OTP send and verify |

### Division — `/api/v1/division`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| — | — | — | Geographic division CRUD |

### Stats — `/api/v1/stats`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| — | — | — | Admin dashboard statistics |

---

## Roles

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Full platform access |
| `ADMIN` | Manage tours, users, bookings |
| `USER` | Browse tours, create bookings |
| `GUIDE` | Tour guide role |

---

## Standard Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "meta": { "page": 1, "limit": 10, "total": 100 },
  "data": {}
}
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/tour_management

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES=30d

# Auth
BCRYPT_SALT_ROUND=12
DEFAULT_PASSWORD=default_password

# Seeded Admin Accounts
SUPER_ADMIN_EMAIL=superadmin@example.com
SUPER_ADMIN_PASSWORD=superadmin_password
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Session
EXPRESS_SESSION_SECRET=your_session_secret

# CORS
FRONTEND_URL=http://localhost:3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

---

## Getting Started

**Prerequisites:** Node.js 18+, MongoDB, Redis

```bash
# 1. Clone the repository
git clone https://github.com/shejanNizam/tour_management_server.git
cd tour_management_server

# 2. Install dependencies
npm install

# 3. Create .env file and fill in environment variables (see above)

# 4. Start development server
npm run dev

# 5. Build for production
npm run build

# 6. Start production server
npm start
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot-reload via `tsx watch` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server from `dist/server.js` |
| `npm run lint` | Run ESLint |

---

## Key Features

- **Auto-seeding**: Super admin and admin accounts are seeded automatically on startup from `.env` credentials.
- **Graceful shutdown**: Handles `SIGTERM`, `SIGINT`, `unhandledRejection`, and `uncaughtException` — closes DB and Redis connections cleanly.
- **Vercel serverless**: Exports the Express app for Vercel's serverless runtime.
- **Modular architecture**: Each feature is self-contained with its own controller, service, model, validation, and route.
- **QueryBuilder**: Reusable utility for filtering, sorting, and paginating Mongoose queries.
- **PDF invoices**: Generates booking invoices with PDFKit, delivered via email using EJS templates.
