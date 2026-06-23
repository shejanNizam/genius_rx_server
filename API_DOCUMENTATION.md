# GeniusRX — Healthcare Hub · API Documentation

> **Version:** 1.1.0  
> **Base URL:** `http://localhost:5000/api/v1`  
> **Production URL:** *(set by DevOps)*  
> **Auth:** JWT Bearer Token (`Authorization: Bearer <accessToken>`)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Base URL & Environments](#2-base-url--environments)
3. [Standard Response Format](#3-standard-response-format)
4. [Error Response Format](#4-error-response-format)
5. [Authentication & Token Flow](#5-authentication--token-flow)
6. [Role-Wise Screen → API Map](#6-role-wise-screen--api-map)
7. [Common APIs — All Roles](#7-common-apis--all-roles)
   - [Upload](#71-upload)
   - [Auth](#72-auth)
   - [OTP](#73-otp)
   - [User (Self)](#74-user-self)
   - [Device Token](#75-device-token)
   - [Notifications](#76-notifications)
   - [Block](#77-block)
   - [Report](#78-report)
   - [Subscription & Billing](#79-subscription--billing)
   - [Transaction](#710-transaction)
   - [Static Content](#711-static-content)
8. [Job Seeker APIs](#8-job-seeker-apis)
   - [Job Seeker Profile](#81-job-seeker-profile)
   - [Resume](#82-resume)
   - [ATS Check](#83-ats-check)
   - [Browse Jobs](#84-browse-jobs)
   - [Applications (Job Seeker)](#85-applications-job-seeker)
   - [Saved Jobs](#86-saved-jobs)
9. [Recruiter APIs](#9-recruiter-apis)
   - [Recruiter Profile](#91-recruiter-profile)
   - [Job Management](#92-job-management)
   - [Applications (Recruiter)](#93-applications-recruiter)
   - [Browse Job Seekers (Recruiter)](#94-browse-job-seekers-recruiter)
10. [Instructor APIs](#10-instructor-apis)
    - [Instructor Profile](#101-instructor-profile)
    - [Browse Job Seekers (Instructor)](#102-browse-job-seekers-instructor)
11. [Messaging APIs — Recruiter, Job Seeker & Instructor](#11-messaging-apis)
    - [Conversation](#111-conversation)
    - [Message](#112-message)
12. [Admin / Super Admin APIs](#12-admin--super-admin-apis)
    - [Dashboard Stats](#121-dashboard-stats)
    - [User Management](#122-user-management)
    - [Job Management (Admin)](#123-job-management-admin)
    - [Reports](#124-reports)
    - [Moderation Log](#125-moderation-log)
    - [Subscription Plans](#126-subscription-plans)
    - [Transactions (Admin)](#127-transactions-admin)
    - [Content Management (CMS)](#128-content-management-cms)
13. [Flutter Integration Guide](#13-flutter-integration-guide)

---

## 1. Overview

GeniusRX is a healthcare career platform with three primary user roles and two admin roles:

| Role | Description |
|---|---|
| `job_seeker` | Healthcare professionals looking for jobs |
| `recruiter` | Healthcare organizations posting jobs |
| `instructor` | Healthcare educators / trainers |
| `admin` | Platform moderator |
| `super_admin` | Full platform control |

> **admin and super_admin have identical permissions.** Every endpoint that accepts `admin` also accepts `super_admin`.

**Platform rules:**
- Every new user gets a **7-day free trial** automatically after calling `POST /subscription/trial`
- After trial expires, a paid subscription is required (`accessStatus: "locked"` = gate closed)
- File uploads are done separately — upload first via `/upload`, then send the returned URL in other requests
- Messaging is role-restricted (see [Messaging section](#11-messaging-apis))

---

## 2. Base URL & Environments

```
Development:  http://localhost:5000/api/v1
Production:   https://your-domain.com/api/v1
```

All endpoints are prefixed with `/api/v1`.

---

## 3. Standard Response Format

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Human readable message",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPage": 10
  }
}
```

- `meta` is only present on paginated list endpoints.
- `data` can be an object, array, or `null`.

---

## 4. Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errorSources": [
    {
      "path": "email",
      "message": "Invalid email address format."
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request (validation error, wrong input) |
| `401` | Unauthorized (invalid/expired token) |
| `403` | Forbidden (wrong role, blocked, email not verified) |
| `404` | Not Found |
| `409` | Conflict (duplicate entry) |
| `500` | Internal Server Error |

---

## 5. Authentication & Token Flow

### Token Types

| Token | Lifetime | Purpose |
|---|---|---|
| `accessToken` | Short (15m) | Sent with every protected request |
| `refreshToken` | Long (7d) | Used to get a new access token |

### Sending the Token

All protected endpoints require:

```
Authorization: Bearer <accessToken>
```

### Token Refresh Flow

When you receive a `401`, call:

```
POST /api/v1/auth/refresh-token
Cookie: refreshToken=<token>
```

### Google OAuth Flow

1. Open in browser/WebView: `GET /api/v1/auth/google?redirect=<your-deep-link>`
2. User completes Google login
3. Server redirects to `<your-deep-link>?accessToken=...&refreshToken=...`
4. Parse tokens from query params and store them

---

## 6. Role-Wise Screen → API Map

This section maps each role's app screens to the API calls needed. Use this as your implementation checklist.

---

### Job Seeker Screens

| Screen | API Calls |
|---|---|
| **Splash / App Launch** | `GET /user/me` (check auth state) |
| **Register** | `POST /user/register` |
| **OTP Verification** | `POST /otp/send`, `POST /otp/verify` |
| **Login** | `POST /auth/login` |
| **Start Trial** (first login) | `POST /subscription/trial` |
| **Register Device** (after login) | `POST /device-token` |
| **Profile Setup — Personal Info** | `PUT /job-seeker-profile`, `POST /upload` (avatar) |
| **Resume Upload** | `POST /upload` (file), `POST /resume`, `PATCH /resume/:id/set-default` |
| **Home / Browse Jobs** | `GET /job` (with filters: `jobType`, `jobLevel`, `locationType`, `search`) |
| **Job Detail** | `GET /job/:id` (returns job + company info) |
| **Apply to Job** | `POST /application` |
| **My Applications / Track** | `GET /application/my` (filter by `status`) |
| **Saved Jobs** | `GET /saved-job/my`, `POST /saved-job`, `DELETE /saved-job/:jobId` |
| **ATS Checker** | `POST /ats-check`, `GET /ats-check/my`, `GET /ats-check/:id` |
| **My Resumes** | `GET /resume/my`, `PATCH /resume/:id/set-default`, `DELETE /resume/:id` |
| **Inbox / Messages** | `GET /conversation`, `POST /conversation`, `GET /message/:conversationId`, `POST /message`, `PATCH /message/:conversationId/read` |
| **Notifications** | `GET /notification`, `PATCH /notification/mark-all-read`, `PATCH /notification/:id/read` |
| **Subscription Plans** | `GET /subscription-plan?audience=job_seeker`, `POST /subscription/trial`, `POST /transaction`, `POST /subscription` |
| **My Subscription** | `GET /subscription/my`, `GET /subscription/history`, `PATCH /subscription/cancel` |
| **Profile / Edit Profile** | `GET /user/me`, `GET /job-seeker-profile/my`, `PATCH /user/:id`, `PUT /job-seeker-profile`, `POST /upload` |
| **Settings — Change Password** | `POST /auth/change-password` |
| **Settings — Forgot Password** | `POST /auth/forgot-password`, `POST /auth/reset-password` |
| **Settings — Delete Account** | `DELETE /user/me` |
| **Settings — Block List** | `GET /block/my`, `DELETE /block/:userId` |
| **Report User** | `POST /report` |
| **About / Privacy / Terms / Support** | `GET /content/:type` (`about_us`, `privacy_policy`, `terms`, `support`) |
| **Logout** | `POST /auth/logout`, `DELETE /device-token` |

---

### Recruiter Screens

| Screen | API Calls |
|---|---|
| **Splash / App Launch** | `GET /user/me` |
| **Register** | `POST /user/register` |
| **OTP Verification** | `POST /otp/send`, `POST /otp/verify` |
| **Login** | `POST /auth/login` |
| **Start Trial** | `POST /subscription/trial` |
| **Register Device** | `POST /device-token` |
| **Company Profile Setup** | `PUT /recruiter-profile`, `POST /upload` (logo) |
| **Home / Dashboard** | `GET /job/my`, `GET /recruiter-profile/my` |
| **Post a Job** | `POST /job` |
| **My Jobs** | `GET /job/my` (filter by `status`) |
| **Edit Job** | `PATCH /job/:id` |
| **Job Applications** | `GET /application/job/:jobId` (filter by `status`) |
| **Update Application Status** | `PATCH /application/:id/status` |
| **Browse Job Seekers** | `GET /job-seeker-profile` (filter: `lookingStatus`, `skills`, `search`) |
| **Job Seeker Profile Detail** | `GET /job-seeker-profile/:id` |
| **Message Job Seeker** | `POST /conversation` (initiates), `GET /conversation`, `POST /message`, `GET /message/:conversationId`, `PATCH /message/:conversationId/read` |
| **Notifications** | `GET /notification`, `PATCH /notification/mark-all-read`, `PATCH /notification/:id/read` |
| **Subscription Plans** | `GET /subscription-plan?audience=recruiter`, `POST /subscription/trial`, `POST /transaction`, `POST /subscription` |
| **My Subscription** | `GET /subscription/my`, `GET /subscription/history`, `PATCH /subscription/cancel` |
| **Profile / Edit Profile** | `GET /user/me`, `GET /recruiter-profile/my`, `PATCH /user/:id`, `PUT /recruiter-profile`, `POST /upload` |
| **Settings — Change Password** | `POST /auth/change-password` |
| **Settings — Delete Account** | `DELETE /user/me` |
| **Settings — Block List** | `GET /block/my`, `DELETE /block/:userId` |
| **Report User** | `POST /report` |
| **About / Privacy / Terms / Support** | `GET /content/:type` |
| **Logout** | `POST /auth/logout`, `DELETE /device-token` |

---

### Instructor Screens

| Screen | API Calls |
|---|---|
| **Splash / App Launch** | `GET /user/me` |
| **Register** | `POST /user/register` |
| **OTP Verification** | `POST /otp/send`, `POST /otp/verify` |
| **Login** | `POST /auth/login` |
| **Start Trial** | `POST /subscription/trial` |
| **Register Device** | `POST /device-token` |
| **Instructor Profile Setup** | `PUT /instructor-profile`, `POST /upload` (avatar) |
| **Home / Browse Job Seekers** | `GET /job-seeker-profile` (filter: `lookingStatus`, `skills`, `search`) |
| **Job Seeker Profile Detail** | `GET /job-seeker-profile/:id` |
| **Messages / Inbox** | `GET /conversation`, `POST /conversation`, `GET /message/:conversationId`, `POST /message`, `PATCH /message/:conversationId/read` |
| **Notifications** | `GET /notification`, `PATCH /notification/mark-all-read`, `PATCH /notification/:id/read` |
| **Subscription Plans** | `GET /subscription-plan?audience=instructor`, `POST /subscription/trial`, `POST /transaction`, `POST /subscription` |
| **My Subscription** | `GET /subscription/my`, `GET /subscription/history`, `PATCH /subscription/cancel` |
| **Profile / Edit Profile** | `GET /user/me`, `GET /instructor-profile/my`, `PATCH /user/:id`, `PUT /instructor-profile`, `POST /upload` |
| **Settings — Change Password** | `POST /auth/change-password` |
| **Settings — Delete Account** | `DELETE /user/me` |
| **Settings — Block List** | `GET /block/my`, `DELETE /block/:userId` |
| **Report User** | `POST /report` |
| **About / Privacy / Terms / Support** | `GET /content/:type` |
| **Logout** | `POST /auth/logout`, `DELETE /device-token` |

---

### Admin / Super Admin Screens

| Screen | API Calls |
|---|---|
| **Login** | `POST /auth/login` |
| **Dashboard Overview** | `GET /stats/overview` |
| **Earnings Page** | `GET /stats/earnings`, `GET /transaction` |
| **User Management — List** | `GET /user/all-users` (filter: `role`, `status`, `search`) |
| **User Management — Detail** | `GET /user/:id` |
| **User Management — Block/Unblock** | `PATCH /user/:id` (`{ "status": "blocked" }`) |
| **User Management — Delete** | `DELETE /user/:id` |
| **Job Management — List** | `GET /job/admin/all` (filter: `status`, `isDeleted`, `search`) |
| **Job Management — Force Delete** | `DELETE /job/admin/:id` |
| **Reports — List** | `GET /report` (filter: `status`) |
| **Reports — Action** | `PATCH /report/:id/status` |
| **Moderation Log** | `GET /moderation-log`, `POST /moderation-log` |
| **Subscription Plans** | `GET /subscription-plan/all`, `POST /subscription-plan`, `PATCH /subscription-plan/:id`, `DELETE /subscription-plan/:id` |
| **Transactions** | `GET /transaction`, `PATCH /transaction/:id/status` |
| **Content Management** | `GET /content`, `GET /content/:type`, `POST /content` |

---

## 7. Common APIs — All Roles

---

### 7.1 Upload

Upload one or multiple files to Cloudinary. **Always call this first**, then use the returned URL(s) in other requests.

#### Upload File(s)

```
POST /api/v1/upload
Auth: Required (any role)
Content-Type: multipart/form-data
```

**Form field:** `files` — same field name for single and multiple files.

**Single file response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "1 file(s) uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1/genius_rx/uuid.jpg"
  }
}
```

**Multiple files response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "3 file(s) uploaded successfully",
  "data": {
    "url": [
      "https://res.cloudinary.com/.../file1.pdf",
      "https://res.cloudinary.com/.../file2.jpg",
      "https://res.cloudinary.com/.../file3.png"
    ]
  }
}
```

> **Note:** `publicId` is managed internally by the backend and is not included in the API response.

**Limits:** Max 10 files per request. Max 10 MB per file.

---

### 7.2 Auth

#### Login

```
POST /api/v1/auth/login
Auth: None
Content-Type: application/json
```

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "job_seeker",
      "avatar": { "url": "https://..." },
      "isEmailVerified": true,
      "status": "active",
      "accessStatus": "trial",
      "currentSubscriptionId": "64f1...",
      "isDeleted": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Errors:**
```json
{ "success": false, "message": "User with this email not found" }
{ "success": false, "message": "Incorrect password" }
{ "success": false, "message": "Please verify your email before logging in" }
{ "success": false, "message": "Your account has been blocked" }
```

---

#### Refresh Access Token

```
POST /api/v1/auth/refresh-token
Auth: None (refresh token sent via cookie)
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "New access token created successfully",
  "data": { "accessToken": "eyJhbGci..." }
}
```

---

#### Logout

```
POST /api/v1/auth/logout
Auth: None
```

Clears the refresh token cookie. Also call `DELETE /device-token` before logout to stop push notifications on this device.

---

#### Change Password

```
POST /api/v1/auth/change-password
Auth: Required (any role)
```

**Request body:**
```json
{
  "oldPassword": "OldPassword@123",
  "newPassword": "NewPassword@456"
}
```

---

#### Set Password (Google OAuth users)

For users who signed up with Google and want to enable email/password login.

```
POST /api/v1/auth/set-password
Auth: Required (any role)
```

**Request body:**
```json
{ "password": "NewPassword@123" }
```

---

#### Forgot Password

```
POST /api/v1/auth/forgot-password
Auth: None
```

**Request body:**
```json
{ "email": "user@example.com" }
```

Sends a reset link to the email. The link contains a short-lived JWT reset token.

---

#### Reset Password

Called after the user clicks the reset link. Extract `id` and `token` from the link.

```
POST /api/v1/auth/reset-password
Auth: Required (token from the email link)
```

**Request body:**
```json
{
  "id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "newPassword": "NewPassword@123"
}
```

---

#### Google OAuth — Initiate

```
GET /api/v1/auth/google?redirect=<your-deep-link>
Auth: None
```

Open in WebView. After success, server redirects to `<your-deep-link>?accessToken=...&refreshToken=...`.

---

### 7.3 OTP

#### Send OTP

```
POST /api/v1/otp/send
Auth: None
```

**Request body:**
```json
{ "email": "user@example.com" }
```

Sends a 6-digit OTP to the email. OTP expires in **2 minutes**.

**Errors:**
```json
{ "success": false, "message": "User not found" }
{ "success": false, "message": "You are already verified" }
```

---

#### Verify OTP

```
POST /api/v1/otp/verify
Auth: None
```

**Request body:**
```json
{
  "email": "user@example.com",
  "otp": "482910"
}
```

After successful verification, `isEmailVerified` is set to `true` and the user can log in.

---

### 7.4 User (Self)

#### Register

```
POST /api/v1/user/register
Auth: None
Content-Type: application/json
```

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "role": "job_seeker",
  "phone": "+8801712345678"
}
```

**Validation rules:**
- `name`: 2–50 characters, required
- `email`: valid email format, required
- `password`: min 8 chars, must contain uppercase, number, and special character (`!@#$%^&*`)
- `role`: `job_seeker | recruiter | instructor` — cannot self-register as admin
- `phone`: optional, **E.164 format required** (e.g. `+8801712345678` — country code + number, no spaces/dashes)

> **Next step after register:** Call `POST /otp/send` to send the verification code.

---

#### Get My Profile

```
GET /api/v1/user/me
Auth: Required (any role)
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile retrieved successfully!",
  "data": {
    "_id": "64f1...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+8801712345678",
    "role": "job_seeker",
    "avatar": { "url": "https://..." },
    "isEmailVerified": true,
    "status": "active",
    "accessStatus": "subscribed",
    "currentSubscriptionId": "64f2...",
    "lastLoginAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Update My Profile

```
PATCH /api/v1/user/:id
Auth: Required (any role — regular users can only update their own profile)
Content-Type: application/json
```

**Request body** (all fields optional):
```json
{
  "name": "John Updated",
  "phone": "+9876543210",
  "avatar": {
    "url": "https://res.cloudinary.com/..."
  }
}
```

> **Note:** Use `POST /upload` first to get the avatar URL, then send it here.

> **Admin-only fields** (regular users receive 403): `status`, `accessStatus`, `isEmailVerified`, `isDeleted`, `role` → See [Admin User Management](#122-user-management).

---

#### Delete My Account

Self-service account deletion. Soft-deletes the calling user's account.

```
DELETE /api/v1/user/me
Auth: Required (any role)
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Account deleted successfully!",
  "data": null
}
```

---

### 7.5 Device Token

Register a device token for push notifications (FCM/APNs). Call this after every successful login and after the OS grants notification permission.

#### Register / Update Token

```
POST /api/v1/device-token
Auth: Required (any role)
```

**Request body:**
```json
{
  "token": "fcm-device-token-string",
  "platform": "android"
}
```

**`platform` values:** `ios | android | web`

---

#### Remove Token

```
DELETE /api/v1/device-token
Auth: Required (any role)
```

**Request body:**
```json
{ "token": "fcm-device-token-string" }
```

Call this on logout to stop receiving push notifications on this device.

---

### 7.6 Notifications

#### Get My Notifications

```
GET /api/v1/notification
Auth: Required (any role)
```

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page (default: 1) |
| `limit` | number | Limit (default: 20) |
| `isRead` | boolean | Filter by read status (`true` or `false`) |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notifications retrieved",
  "data": [
    {
      "_id": "64fe...",
      "userId": "64f1...",
      "type": "application_update",
      "title": "Application Update",
      "body": "You have been shortlisted for Registered Nurse - ICU",
      "data": { "applicationId": "64f8...", "jobId": "64f5..." },
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPage": 1,
    "unreadCount": 3
  }
}
```

> **`meta.unreadCount`** — use this number to show the notification badge.

---

#### Mark All Notifications as Read

```
PATCH /api/v1/notification/mark-all-read
Auth: Required (any role)
```

---

#### Mark One Notification as Read

```
PATCH /api/v1/notification/:id/read
Auth: Required (any role)
```

---

#### Delete Notification

```
DELETE /api/v1/notification/:id
Auth: Required (any role)
```

---

### 7.7 Block

#### Block a User

```
POST /api/v1/block
Auth: Required (any role)
```

**Request body:**
```json
{ "blockedId": "64f1..." }
```

Blocked users cannot start new conversations with the blocker.

---

#### Get My Block List

```
GET /api/v1/block/my
Auth: Required (any role)
```

---

#### Unblock a User

```
DELETE /api/v1/block/:userId
Auth: Required (any role)
```

---

### 7.8 Report

#### Submit Report

```
POST /api/v1/report
Auth: Required (any role)
```

**Request body:**
```json
{
  "reportedUserId": "64f1...",
  "category": "harassment",
  "description": "This user is sending inappropriate messages."
}
```

**`category` values:**
`hate_speech | threat | harassment | impersonation | fraud_scam | fake_identity | something_else | other`

---

### 7.9 Subscription & Billing

#### Get Active Plans (Public)

```
GET /api/v1/subscription-plan
Auth: None
```

**Query params:**

| Param | Type | Description |
|---|---|---|
| `audience` | string | Filter: `job_seeker \| recruiter \| instructor \| all` |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Plans retrieved",
  "data": [
    {
      "_id": "64fb...",
      "name": "Pro",
      "slug": "pro-monthly",
      "audience": "job_seeker",
      "price": "29.99",
      "currency": "USD",
      "billingInterval": "month",
      "intervalCount": 1,
      "features": ["Unlimited applications", "ATS check", "Priority support"],
      "jobPostLimit": null,
      "isActive": true,
      "sortOrder": 1
    }
  ]
}
```

> **Note on price:** `price` is returned as a string (e.g. `"29.99"`). Parse with `double.parse()` in Flutter.

---

#### Start 7-Day Free Trial

```
POST /api/v1/subscription/trial
Auth: Required (any role)
```

No request body needed. Creates a `trialing` subscription.

- `endDate` = `startDate + 7 days`
- Updates `user.accessStatus = "trial"`
- Can only be called **once** (throws `409` if trial already used)

---

#### Subscribe to a Plan

Call this after a successful payment transaction.

```
POST /api/v1/subscription
Auth: Required (any role)
```

**Request body:**
```json
{
  "planId": "64fb...",
  "billingInterval": "month",
  "intervalCount": 1,
  "priceAtPurchase": "29.99",
  "currency": "USD",
  "autoRenew": true
}
```

Sets `user.accessStatus = "subscribed"`.

---

#### Get Current Subscription

```
GET /api/v1/subscription/my
Auth: Required (any role)
```

Returns the active `trialing` or `active` subscription with plan details populated.

---

#### Get Subscription History

```
GET /api/v1/subscription/history
Auth: Required (any role)
```

---

#### Cancel Subscription

```
PATCH /api/v1/subscription/cancel
Auth: Required (any role)
```

Sets subscription `status: "cancelled"` and `user.accessStatus = "locked"`.

---

### 7.10 Transaction

#### Create Transaction

Record a payment transaction. Call this alongside or before `POST /subscription`.

```
POST /api/v1/transaction
Auth: Required (any role)
```

**Request body:**
```json
{
  "subscriptionId": "64fc...",
  "amount": "29.99",
  "currency": "USD",
  "gateway": "stripe",
  "gatewayRef": "pi_3OxKLz...",
  "type": "subscription",
  "status": "success"
}
```

**`type` values:** `subscription | renewal`  
**`status` values:** `pending | success | failed`

---

#### Get My Transactions

```
GET /api/v1/transaction/my
Auth: Required (any role)
```

**Query params:** `page`, `limit`

---

### 7.11 Static Content

CMS pages: About Us, Privacy Policy, Terms of Service, Support.

#### Get All Content Pages

```
GET /api/v1/content
Auth: None
```

---

#### Get Content by Type

```
GET /api/v1/content/:type
Auth: None
```

**`:type` values:** `about_us | privacy_policy | terms | support`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Content retrieved",
  "data": {
    "_id": "64fd...",
    "type": "privacy_policy",
    "title": "Privacy Policy",
    "body": "<p>Full HTML or markdown content...</p>",
    "version": 3,
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

## 8. Job Seeker APIs

> **Auth:** All endpoints require `Authorization: Bearer <accessToken>` and `role: job_seeker` unless noted.

---

### 8.1 Job Seeker Profile

One profile per user. Uses **upsert** — always `PUT`, it creates or updates.

#### Create or Update Profile

```
PUT /api/v1/job-seeker-profile
Auth: Required (job_seeker)
```

**Request body** (all fields optional):
```json
{
  "shortBio": "Experienced healthcare professional with 5 years in nursing",
  "contactInfo": {
    "phone": "+1234567890",
    "address": "New York, USA"
  },
  "lookingStatus": "actively_looking",
  "experience": [
    {
      "company": "City Hospital",
      "title": "Registered Nurse",
      "startDate": "2020-01-01",
      "endDate": "2024-01-01",
      "current": false,
      "description": "ICU nursing"
    }
  ],
  "education": [
    {
      "institution": "State University",
      "degree": "BSc Nursing",
      "year": "2019"
    }
  ],
  "skills": ["Patient Care", "IV Therapy", "EMR Systems"],
  "certificates": [
    {
      "name": "BLS Certification",
      "issuer": "AHA",
      "year": "2023"
    }
  ],
  "defaultResumeId": "64f3..."
}
```

**`lookingStatus` values:** `actively_looking | open_to_work | not_open`

---

#### Get My Job Seeker Profile

```
GET /api/v1/job-seeker-profile/my
Auth: Required (job_seeker)
```

---

#### Get Job Seeker Profile by ID

```
GET /api/v1/job-seeker-profile/:id
Auth: Required (job_seeker, recruiter, instructor, admin, super_admin)
```

---

#### Get All Job Seeker Profiles

Used by recruiters and instructors to browse and search job seekers.

```
GET /api/v1/job-seeker-profile
Auth: Required (recruiter, instructor, admin, super_admin)
```

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page (default: 1) |
| `limit` | number | Limit (default: 10) |
| `lookingStatus` | string | `actively_looking \| open_to_work \| not_open` |
| `skills` | string | Comma-separated skills to filter by |
| `search` | string | Search by user name (partial match, case-insensitive) |

---

### 8.2 Resume

#### Upload Resume (2-step)

**Step 1 — Upload the file:**
```
POST /api/v1/upload
Content-Type: multipart/form-data
Field: files
```
Returns `{ url: "https://..." }`.

**Step 2 — Create the resume record:**
```
POST /api/v1/resume
Auth: Required (job_seeker)
```

**Request body:**
```json
{
  "file": {
    "url": "https://res.cloudinary.com/.../resume.pdf"
  },
  "label": "Software Engineer CV 2024",
  "source": "uploaded"
}
```

**`source` values:** `uploaded | ai_generated`

---

#### Get My Resumes

```
GET /api/v1/resume/my
Auth: Required (job_seeker)
```

---

#### Get Resume by ID

```
GET /api/v1/resume/:id
Auth: Required (any role)
```

---

#### Set Default Resume

```
PATCH /api/v1/resume/:id/set-default
Auth: Required (job_seeker)
```

Clears `isDefault` on all other resumes and sets `isDefault: true` on this one.

---

#### Delete Resume

```
DELETE /api/v1/resume/:id
Auth: Required (job_seeker)
```

---

### 8.3 ATS Check

#### Create ATS Check

```
POST /api/v1/ats-check
Auth: Required (job_seeker)
```

**Request body:**
```json
{
  "resumeId": "64f3...",
  "score": 78,
  "issues": [
    { "section": "Skills", "message": "Missing keywords: EMR, EHR" },
    { "section": "Summary", "message": "Too short, add more detail" }
  ]
}
```

---

#### Get My ATS Checks

```
GET /api/v1/ats-check/my
Auth: Required (job_seeker)
```

---

#### Get ATS Check by ID

```
GET /api/v1/ats-check/:id
Auth: Required (job_seeker)
```

---

### 8.4 Browse Jobs

#### Get All Jobs (Public)

```
GET /api/v1/job
Auth: None (public endpoint)
```

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page (default: 1) |
| `limit` | number | Limit (default: 10) |
| `jobType` | string | `full_time \| part_time \| contract` |
| `jobLevel` | string | `entry \| mid \| senior` |
| `locationType` | string | `on_site \| remote \| hybrid` |
| `search` | string | Full-text search on title and skills |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": [
    {
      "_id": "64f5...",
      "recruiterId": {
        "_id": "64f1...",
        "name": "MedStaff Solutions",
        "avatar": { "url": "https://..." }
      },
      "title": "Registered Nurse - ICU",
      "locationType": "on_site",
      "jobType": "full_time",
      "jobLevel": "mid",
      "salary": { "amount": 85000, "currency": "USD", "period": "year" },
      "skills": ["Patient Care", "IV Therapy"],
      "applicantsCount": 12,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 85, "totalPage": 9 }
}
```

---

#### Get Job by ID (Public — includes Company Info)

```
GET /api/v1/job/:id
Auth: None (public)
```

Returns full job details **plus** the recruiter's company profile for the "About Company" section on the job detail screen.

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Job retrieved successfully",
  "data": {
    "_id": "64f5...",
    "recruiterId": {
      "_id": "64f1...",
      "name": "MedStaff Solutions",
      "email": "hr@medstaff.com",
      "role": "recruiter",
      "avatar": { "url": "https://..." }
    },
    "title": "Registered Nurse - ICU",
    "description": "We are looking for an experienced ICU nurse...",
    "responsibilities": "- Monitor patient vitals\n- Administer medications",
    "requirements": "- 2+ years ICU experience\n- Active RN license",
    "benefits": "- Health insurance\n- 401k",
    "locationType": "on_site",
    "jobType": "full_time",
    "jobLevel": "mid",
    "salary": { "amount": 85000, "currency": "USD", "period": "year" },
    "neededExperience": "2-5 years",
    "skills": ["Patient Care", "IV Therapy", "Critical Care"],
    "applicantsCount": 12,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "recruiterProfile": {
      "_id": "64f2...",
      "companyName": "MedStaff Solutions",
      "location": "Boston, MA",
      "employeeCount": 500,
      "serviceType": "Healthcare Staffing",
      "aboutCompany": "We connect healthcare professionals with leading hospitals.",
      "companyCulture": "Collaborative, patient-first culture.",
      "socialLinks": {
        "website": "https://medstaff.com",
        "linkedin": "https://linkedin.com/company/medstaff"
      }
    }
  }
}
```

> **`recruiterProfile`** is `null` if the recruiter hasn't set up their company profile yet.

---

### 8.5 Applications (Job Seeker)

#### Apply to Job

```
POST /api/v1/application
Auth: Required (job_seeker)
```

**Request body:**
```json
{
  "jobId": "64f5...",
  "resumeId": "64f3..."
}
```

**Errors:**
```json
{ "success": false, "message": "Job not found or not active" }
{ "success": false, "message": "Already applied to this job" }
```

Increments `job.applicantsCount` by 1.

---

#### Get My Applications

```
GET /api/v1/application/my
Auth: Required (job_seeker)
```

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page |
| `limit` | number | Limit |
| `status` | string | `applied \| viewed \| shortlisted \| selected \| rejected` |

---

### 8.6 Saved Jobs

#### Save a Job

```
POST /api/v1/saved-job
Auth: Required (job_seeker)
```

**Request body:**
```json
{ "jobId": "64f5..." }
```

---

#### Get My Saved Jobs

```
GET /api/v1/saved-job/my
Auth: Required (job_seeker)
```

**Query params:** `page`, `limit`

---

#### Unsave a Job

```
DELETE /api/v1/saved-job/:jobId
Auth: Required (job_seeker)
```

---

## 9. Recruiter APIs

> **Auth:** All endpoints require `Authorization: Bearer <accessToken>` and `role: recruiter` unless noted.

---

### 9.1 Recruiter Profile

#### Create or Update Company Profile

```
PUT /api/v1/recruiter-profile
Auth: Required (recruiter)
```

**Request body** (all optional):
```json
{
  "companyName": "MedStaff Solutions",
  "location": "Boston, MA",
  "employeeCount": 500,
  "serviceType": "Healthcare Staffing",
  "socialLinks": {
    "website": "https://medstaff.com",
    "linkedin": "https://linkedin.com/company/medstaff",
    "facebook": "",
    "instagram": "",
    "twitter": ""
  },
  "aboutCompany": "We connect healthcare professionals with leading hospitals.",
  "companyCulture": "Collaborative, patient-first culture.",
  "businessLicenses": [
    {
      "name": "State Staffing License",
      "number": "SL-2024-001",
      "expiryDate": "2025-12-31",
      "documentUrl": "https://res.cloudinary.com/..."
    }
  ]
}
```

---

#### Get My Company Profile

```
GET /api/v1/recruiter-profile/my
Auth: Required (recruiter)
```

---

#### Get All Recruiter Profiles

```
GET /api/v1/recruiter-profile
Auth: Required (job_seeker, admin, super_admin)
```

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page (default: 1) |
| `limit` | number | Limit (default: 10) |
| `location` | string | Partial match on location |
| `serviceType` | string | Filter by service type |
| `search` | string | Search by company name (partial match) |

---

#### Get Recruiter Profile by ID

```
GET /api/v1/recruiter-profile/:id
Auth: Required (job_seeker, recruiter, admin, super_admin)
```

---

### 9.2 Job Management

#### Create Job

```
POST /api/v1/job
Auth: Required (recruiter)
```

**Request body:**
```json
{
  "title": "Registered Nurse - ICU",
  "description": "We are looking for an experienced ICU nurse...",
  "responsibilities": "- Monitor patient vitals\n- Administer medications",
  "requirements": "- 2+ years ICU experience\n- Active RN license",
  "benefits": "- Health insurance\n- 401k\n- Sign-on bonus",
  "locationType": "on_site",
  "jobType": "full_time",
  "jobLevel": "mid",
  "salary": {
    "amount": 85000,
    "currency": "USD",
    "period": "year"
  },
  "neededExperience": "2-5 years",
  "skills": ["Patient Care", "IV Therapy", "Critical Care"],
  "status": "active"
}
```

**Field values:**
- `locationType`: `on_site | remote | hybrid`
- `jobType`: `full_time | part_time | contract`
- `jobLevel`: `entry | mid | senior`
- `status`: `active | inactive | closed`

---

#### Get My Posted Jobs

```
GET /api/v1/job/my
Auth: Required (recruiter)
```

**Query params:** `page`, `limit`, `status`

---

#### Update Job

```
PATCH /api/v1/job/:id
Auth: Required (recruiter — must own the job)
```

**Request body:** Any fields from the create body (all optional).

---

#### Delete Job (Soft Delete)

```
DELETE /api/v1/job/:id
Auth: Required (recruiter — must own the job)
```

Sets `isDeleted: true`.

---

### 9.3 Applications (Recruiter)

#### Get Applicants for a Job

```
GET /api/v1/application/job/:jobId
Auth: Required (recruiter — must own the job)
```

**Query params:** `page`, `limit`, `status`

---

#### Update Application Status

```
PATCH /api/v1/application/:id/status
Auth: Required (recruiter — must own the job)
```

**Request body:**
```json
{
  "status": "shortlisted",
  "interview": {
    "date": "2024-02-15T10:00:00.000Z",
    "location": "123 Main St, Boston MA",
    "note": "Please bring your nursing license"
  }
}
```

**`status` values:** `applied | viewed | shortlisted | selected | rejected`

The `interview` object is optional and only relevant when status is `shortlisted`.

---

### 9.4 Browse Job Seekers (Recruiter)

See [Job Seeker Profile — Get All Profiles](#81-job-seeker-profile). Recruiters can use `?search=` to find job seekers by name.

---

## 10. Instructor APIs

> **Auth:** All endpoints require `Authorization: Bearer <accessToken>` and `role: instructor` unless noted.

---

### 10.1 Instructor Profile

#### Create or Update Profile

```
PUT /api/v1/instructor-profile
Auth: Required (instructor)
```

**Request body** (all optional):
```json
{
  "shortBio": "15 years of clinical training experience",
  "contactInfo": { "email": "instructor@example.com" },
  "experience": [
    {
      "institution": "Johns Hopkins",
      "role": "Clinical Trainer",
      "years": "2010-2024"
    }
  ],
  "education": [
    { "degree": "MD", "institution": "Harvard Medical School", "year": "2008" }
  ],
  "skills": ["Clinical Training", "Simulation", "ACLS"],
  "licenses": [
    {
      "name": "Teaching License",
      "issuer": "State Medical Board",
      "number": "TL-2024"
    }
  ],
  "certificates": [
    { "name": "ACLS Instructor", "year": "2022" }
  ]
}
```

---

#### Get My Instructor Profile

```
GET /api/v1/instructor-profile/my
Auth: Required (instructor)
```

---

#### Get All Instructor Profiles

```
GET /api/v1/instructor-profile
Auth: Required (job_seeker, admin, super_admin)
```

**Query params:** `page`, `limit`

---

#### Get Instructor Profile by ID

```
GET /api/v1/instructor-profile/:id
Auth: Required (job_seeker, instructor, admin, super_admin)
```

---

### 10.2 Browse Job Seekers (Instructor)

See [Job Seeker Profile — Get All Profiles](#81-job-seeker-profile). Instructors can use `?search=` to find job seekers by name.

---

## 11. Messaging APIs

**Messaging rules (strictly enforced by the server):**

| Pair | Allowed | Direction |
|---|---|---|
| Recruiter ↔ Job Seeker | ✅ | Recruiter must initiate |
| Job Seeker → Recruiter | ❌ | Forbidden |
| Job Seeker ↔ Instructor | ✅ | Either can initiate |
| Any other combo | ❌ | Forbidden |

---

### 11.1 Conversation

#### Start or Get Conversation

```
POST /api/v1/conversation
Auth: Required (recruiter, job_seeker, instructor)
```

**Request body:**
```json
{ "recipientId": "64f1..." }
```

If a conversation between these two users already exists, **returns the existing one** (no duplicate created).

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Conversation started",
  "data": {
    "_id": "64f6...",
    "participants": ["64f1...", "64f2..."],
    "initiatedBy": "64f1...",
    "type": "recruiter_seeker",
    "lastMessage": null,
    "lastMessageAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Get My Conversations (Inbox)

```
GET /api/v1/conversation
Auth: Required (recruiter, job_seeker, instructor)
```

Returns conversations sorted by `lastMessageAt` (newest first). Participants are populated with `name`, `avatar`, `role`.

---

#### Get Conversation by ID

```
GET /api/v1/conversation/:id
Auth: Required (recruiter, job_seeker, instructor — must be a participant)
```

---

### 11.2 Message

#### Send Message

```
POST /api/v1/message
Auth: Required (recruiter, job_seeker, instructor — must be a participant)
```

**Request body:**
```json
{
  "conversationId": "64f6...",
  "text": "Hi, I wanted to discuss the ICU Nurse position.",
  "attachments": [
    {
      "url": "https://res.cloudinary.com/...",
      "type": "pdf"
    }
  ]
}
```

`text` and `attachments` are both optional but at least one must be provided.

Updates `conversation.lastMessage` and `conversation.lastMessageAt`.

---

#### Get Messages in a Conversation

```
GET /api/v1/message/:conversationId
Auth: Required (recruiter, job_seeker, instructor — must be a participant)
```

**Query params:** `page`, `limit`

Returns messages sorted oldest → newest.

---

#### Mark Messages as Read

```
PATCH /api/v1/message/:conversationId/read
Auth: Required (recruiter, job_seeker, instructor — must be a participant)
```

Marks all unread messages in the conversation as read for the calling user. Emits `message_read` Socket.io event to all participants.

---

## 12. Admin / Super Admin APIs

> **Access:** All endpoints in this section require `admin` or `super_admin` role.  
> **Header:** `Authorization: Bearer <adminAccessToken>`

---

### 12.1 Dashboard Stats

#### Overview Stats

Powers the main dashboard: stat cards + recent users.

```
GET /api/v1/stats/overview
Auth: Required (admin, super_admin)
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Dashboard overview stats retrieved",
  "data": {
    "totalUsers": { "count": 3420, "changePercent": 8.2 },
    "totalJobSeekers": { "count": 1200, "changePercent": 0.5 },
    "totalRecruiters": { "count": 890, "changePercent": 9.1 },
    "totalInstructors": { "count": 450, "changePercent": 8.4 },
    "totalEarnings": { "amount": 50800.00, "changePercent": 9.0 },
    "totalJobs": { "count": 250, "changePercent": 5.2 },
    "recentUsers": [
      {
        "_id": "64f1...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "job_seeker",
        "status": "active",
        "accessStatus": "subscribed",
        "avatar": { "url": "https://..." },
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

- `changePercent` — comparing this calendar month vs last calendar month.
- `recentUsers` — last 10 registered users, newest first.

---

#### Earnings Stats

```
GET /api/v1/stats/earnings
Auth: Required (admin, super_admin)
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Earnings stats retrieved",
  "data": {
    "totalEarnings": { "amount": 50800.00, "changePercent": 8.0 },
    "thisMonthEarnings": { "amount": 23600.00, "changePercent": 12.0 },
    "pendingAmount": { "amount": 2300.00, "changePercent": -5.0 }
  }
}
```

- `totalEarnings` — all-time sum of `status: success` transactions.
- `thisMonthEarnings` — current calendar month's successful revenue.
- `pendingAmount` — sum of all `status: pending` transactions.

---

### 12.2 User Management

#### List All Users

```
GET /api/v1/user/all-users
Auth: Required (admin, super_admin)
```

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `role` | string | Filter: `job_seeker \| recruiter \| instructor \| admin \| super_admin` |
| `status` | string | Filter: `active \| blocked` |
| `search` | string | Search by name or email (partial match) |

---

#### Get User by ID

```
GET /api/v1/user/:id
Auth: Required (admin, super_admin)
```

---

#### Update Any User

Admins can update any user including protected fields.

```
PATCH /api/v1/user/:id
Auth: Required (admin, super_admin)
Content-Type: application/json
```

**Request body** (all fields optional):
```json
{
  "name": "Updated Name",
  "status": "blocked",
  "blockReason": "Repeated policy violations",
  "accessStatus": "locked",
  "isEmailVerified": true,
  "role": "recruiter",
  "isDeleted": false
}
```

**Admin-exclusive fields:**

| Field | Values | Description |
|---|---|---|
| `status` | `active \| blocked` | Block or unblock a user |
| `blockReason` | string | Reason for block |
| `accessStatus` | `trial \| subscribed \| locked` | Override subscription gate |
| `isEmailVerified` | boolean | Manually verify email |
| `role` | any `UserRole` | Change user role |
| `isDeleted` | boolean | Restore a soft-deleted user |

---

#### Soft Delete User

```
DELETE /api/v1/user/:id
Auth: Required (admin, super_admin)
```

Sets `isDeleted: true`. Restoreable via `PATCH /user/:id` with `{ "isDeleted": false }`.

---

### 12.3 Job Management (Admin)

#### Get All Jobs (Admin View)

Admin can see all jobs regardless of status or soft-delete state.

```
GET /api/v1/job/admin/all
Auth: Required (admin, super_admin)
```

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page (default: 1) |
| `limit` | number | Limit (default: 10) |
| `status` | string | `active \| inactive \| closed` |
| `isDeleted` | boolean | `true` to show deleted jobs |
| `search` | string | Full-text search on title/skills |

---

#### Force Delete Job

```
DELETE /api/v1/job/admin/:id
Auth: Required (admin, super_admin)
```

Soft-deletes any job regardless of ownership. Use when a listing violates platform policies.

---

### 12.4 Reports

#### Get All Reports

```
GET /api/v1/report
Auth: Required (admin, super_admin)
```

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page (default: 1) |
| `limit` | number | Limit (default: 10) |
| `status` | string | `pending \| reviewed \| actioned \| dismissed` |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Reports retrieved",
  "data": [
    {
      "_id": "64f9...",
      "reporterId": { "_id": "64f1...", "name": "Jane Smith", "email": "jane@example.com" },
      "reportedUserId": { "_id": "64f2...", "name": "Bad Actor", "email": "bad@example.com" },
      "category": "harassment",
      "description": "This user is sending inappropriate messages.",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 43, "totalPage": 5 }
}
```

---

#### Update Report Status

```
PATCH /api/v1/report/:id/status
Auth: Required (admin, super_admin)
```

**Request body:**
```json
{ "status": "actioned" }
```

**`status` values:** `pending | reviewed | actioned | dismissed`

---

### 12.5 Moderation Log

Audit trail for significant admin actions.

#### Create Log Entry

```
POST /api/v1/moderation-log
Auth: Required (admin, super_admin)
```

**Request body:**
```json
{
  "action": "block_user",
  "targetType": "user",
  "targetId": "64f1...",
  "reason": "Multiple harassment reports confirmed",
  "metadata": { "reportIds": ["64f9...", "64fa..."] }
}
```

**`action` values:** `block_user | unblock_user | delete_job | edit_cms | review_report`  
**`targetType` values:** `user | job | content | report`

---

#### Get All Logs

```
GET /api/v1/moderation-log
Auth: Required (admin, super_admin)
```

**Query params:** `page`, `limit`

---

### 12.6 Subscription Plans

#### Get All Plans (Admin — including inactive)

```
GET /api/v1/subscription-plan/all
Auth: Required (admin, super_admin)
```

---

#### Create Plan

```
POST /api/v1/subscription-plan
Auth: Required (admin, super_admin)
```

**Request body:**
```json
{
  "name": "Pro",
  "slug": "pro-monthly",
  "audience": "job_seeker",
  "price": "29.99",
  "currency": "USD",
  "billingInterval": "month",
  "intervalCount": 1,
  "features": ["Unlimited applications", "ATS check", "Priority support"],
  "jobPostLimit": null,
  "isActive": true,
  "sortOrder": 1
}
```

**Field values:**
- `audience`: `job_seeker | recruiter | instructor | all`
- `billingInterval`: `month | year`
- `price`: string decimal (e.g. `"29.99"`)

---

#### Update Plan

```
PATCH /api/v1/subscription-plan/:id
Auth: Required (admin, super_admin)
```

**Request body** (all optional): same fields as Create.

---

#### Deactivate Plan

```
DELETE /api/v1/subscription-plan/:id
Auth: Required (admin, super_admin)
```

Sets `isActive: false`. Hides plan from public listing. Existing subscribers are unaffected.

---

### 12.7 Transactions (Admin)

#### Get All Transactions

```
GET /api/v1/transaction
Auth: Required (admin, super_admin)
```

**Query params:** `page`, `limit`

---

#### Update Transaction Status

Use to manually correct a transaction status (e.g. webhook failure).

```
PATCH /api/v1/transaction/:id/status
Auth: Required (admin, super_admin)
```

**Request body:**
```json
{ "status": "success" }
```

**`status` values:** `pending | success | failed`

---

### 12.8 Content Management (CMS)

#### Get All Content Pages

```
GET /api/v1/content
Auth: None
```

#### Get Content by Type

```
GET /api/v1/content/:type
Auth: None
```

**`:type` values:** `about_us | privacy_policy | terms | support`

#### Create or Update Content Page

```
POST /api/v1/content
Auth: Required (admin, super_admin)
```

**Request body:**
```json
{
  "type": "about_us",
  "title": "About GeniusRX",
  "body": "<h1>About Us</h1><p>GeniusRX is a healthcare career platform...</p>"
}
```

---

## 13. Flutter Integration Guide

### Phone Number (E.164 Format)

**Best practice for Flutter + backend:**

```dart
// Flutter: use plus_phone_field or intl_phone_number_input package
// Always send in E.164 format: +[country code][number]
// Example: +8801712345678 (Bangladesh), +12025551234 (USA)

// Store and send as-is — no formatting, no spaces, no dashes
```

**Validation on backend:** The `phone` field is validated against E.164 regex (`/^\+[1-9]\d{6,14}$/`).

---

### Socket.io — Real-Time Events

Connect after login:

```dart
final socket = io('https://your-domain.com', OptionBuilder()
  .setTransports(['websocket'])
  .setAuth({'token': accessToken})
  .build());
```

**Events to listen:**

| Event | Trigger | Payload |
|---|---|---|
| `new_message` | Someone sends a message to your conversation | Full message object |
| `message_read` | Someone reads messages in your conversation | `{ conversationId }` |
| `new_notification` | New notification created for you | Full notification object |
| `typing` | Someone is typing in a conversation you're in | `{ conversationId, userId }` |
| `stop_typing` | Someone stopped typing | `{ conversationId, userId }` |

**Events to emit:**

```dart
// Join a conversation room when opening chat
socket.emit('join_conversation', conversationId);

// Send typing indicator
socket.emit('typing', { 'conversationId': id });
socket.emit('stop_typing', { 'conversationId': id });
```

---

### Token Management

```
accessToken expires → call POST /auth/refresh-token → get new accessToken
refreshToken expires → user must log in again
```

```dart
// Intercept 401 → refresh token → retry original request
// If refresh also fails → redirect to login screen
```

---

### `accessStatus` Gate

Check `user.accessStatus` after login:

| Value | Meaning | Action |
|---|---|---|
| `trial` | Free trial active | Full access |
| `subscribed` | Paid plan active | Full access |
| `locked` | Trial expired or subscription cancelled | Show paywall / subscription screen |

---

### File Upload Pattern

```
1. POST /upload (multipart, field: "files")
   → { data: { url: "https://..." } }           ← single file
   → { data: { url: ["url1", "url2"] } }        ← multiple files

2. Use the returned URL(s) in subsequent requests:
   - avatar → PATCH /user/:id  { avatar: { url } }
   - resume → POST /resume     { file: { url } }
   - message attachment → POST /message { attachments: [{ url, type }] }
```

---

### Complete Registration Flow

```
1. POST /user/register        → { _id, email, role, isEmailVerified: false }
2. POST /otp/send             → sends 6-digit OTP (valid 2 min)
3. POST /otp/verify           → isEmailVerified = true
4. POST /auth/login           → { accessToken, refreshToken, user }
5. POST /subscription/trial   → starts 7-day trial (call once, first login only)
6. POST /device-token         → register FCM/APNs for push notifications
7. PUT  /<role>-profile        → complete profile setup (job_seeker / recruiter / instructor)
```

---

### Password Forgot/Reset Flow

```
1. POST /auth/forgot-password  { email }
   → email sent with reset link containing token

2. User taps link → opens app via deep link
   → extract `id` and `token` from query params

3. POST /auth/reset-password
   Authorization: Bearer <token-from-email>
   Body: { id, newPassword }
```
