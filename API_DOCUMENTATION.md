# GeniusRX — Healthcare Hub · API Documentation

> **Version:** 1.0.0  
> **Base URL:** `http://localhost:5000/api/v1`  
> **Production URL:** *(set by DevOps)*  
> **Auth:** JWT Bearer Token  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Base URL & Environments](#2-base-url--environments)
3. [Standard Response Format](#3-standard-response-format)
4. [Error Response Format](#4-error-response-format)
5. [Authentication & Token Flow](#5-authentication--token-flow)
6. [Complete Application Flows](#6-complete-application-flows)
7. [User-Facing API Endpoints](#7-user-facing-api-endpoints)
   - [Upload](#71-upload)
   - [Auth](#72-auth)
   - [User](#73-user)
   - [OTP](#74-otp)
   - [Device Token](#75-device-token)
   - [Resume](#76-resume)
   - [Job Seeker Profile](#77-job-seeker-profile)
   - [Recruiter Profile](#78-recruiter-profile)
   - [Instructor Profile](#79-instructor-profile)
   - [ATS Check](#710-ats-check)
   - [Job](#711-job)
   - [Application](#712-application)
   - [Saved Job](#713-saved-job)
   - [Conversation](#714-conversation)
   - [Message](#715-message)
   - [Block](#716-block)
   - [Report](#717-report)
   - [Subscription Plan](#718-subscription-plan)
   - [Subscription](#719-subscription)
   - [Transaction](#720-transaction)
   - [Static Content](#721-static-content)
   - [Notification](#722-notification)
8. [Admin API Endpoints](#8-admin-api-endpoints)
   - [Dashboard Stats](#81-dashboard-stats)
   - [User Management](#82-user-management)
   - [Job Management](#83-job-management)
   - [Reports](#84-reports)
   - [Moderation Log](#85-moderation-log)
   - [Subscription Plans](#86-subscription-plans)
   - [Transactions](#87-transactions)
   - [CMS](#88-cms)
9. [Flutter Integration Guide](#9-flutter-integration-guide)

---

## 1. Overview

GeniusRX is a healthcare career platform with three primary roles:

| Role | Description |
|---|---|
| `job_seeker` | Healthcare professionals looking for jobs |
| `recruiter` | Healthcare organizations posting jobs |
| `instructor` | Healthcare educators offering courses |
| `admin` | Platform moderator — same permissions as super_admin |
| `super_admin` | Full platform control — same permissions as admin |

> **admin and super_admin have identical permissions.** Every endpoint that accepts `admin` also accepts `super_admin` and vice versa.

**Key concepts:**
- Every new user gets a **7-day free trial** after registration
- After trial, a paid subscription is required to unlock features (`accessStatus`)
- File uploads are done separately — upload first, then send the URL in other requests
- Messaging is role-restricted: recruiters can message job seekers; job seekers and instructors can message each other

---

## 2. Base URL & Environments

```
Development:  http://localhost:5000/api/v1
Production:   https://your-domain.com/api/v1
```

All endpoints are prefixed with `/api/v1`.

---

## 3. Standard Response Format

Every successful response follows this structure:

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
| `accessToken` | Short (e.g. 15m) | Sent with every protected request |
| `refreshToken` | Long (e.g. 7d) | Used to get a new access token |

### Sending the Token

All protected endpoints require the header:

```
Authorization: Bearer <accessToken>
```

### Token Refresh Flow

When the access token expires (you receive a `401`), call the refresh endpoint:

```
POST /api/v1/auth/refresh-token
Cookie: refreshToken=<token>   ← sent automatically if using cookies
```

Returns a new `accessToken`.

### Google OAuth Flow (Web/WebView)

1. Open in browser/WebView: `GET /api/v1/auth/google?redirect=<your-deep-link>`
2. User completes Google login
3. Server redirects to `<your-deep-link>?accessToken=...&refreshToken=...`
4. Parse tokens from query params and store them

---

## 6. Complete Application Flows

### 6.1 Email Registration & Login Flow

```
1. POST /api/v1/user/register         → creates user (unverified)
2. POST /api/v1/otp/send              → sends 6-digit OTP to email (valid 2 min)
3. POST /api/v1/otp/verify            → marks isEmailVerified = true
4. POST /api/v1/auth/login            → returns { accessToken, refreshToken, user }
5. POST /api/v1/subscription/trial    → starts 7-day trial (call once after first login)
6. POST /api/v1/device-token          → register FCM/APNs token for push notifications
```

### 6.2 Google OAuth Flow

```
1. Open WebView → GET /api/v1/auth/google
2. Complete Google sign-in
3. Server redirects to frontend with tokens in query params
4. Store tokens → user is already verified, no OTP needed
5. POST /api/v1/subscription/trial    → start 7-day trial (if first login)
```

### 6.3 Subscription Flow

```
accessStatus values: trial | subscribed | locked

trial    → 7-day free trial (after POST /subscription/trial)
subscribed → paid plan active (after POST /subscription)
locked   → trial expired or subscription cancelled

Flow:
1. GET /api/v1/subscription-plan      → list available plans for user's role
2. POST /api/v1/transaction           → record payment (integrate with payment gateway)
3. POST /api/v1/subscription          → activate subscription (call after payment success)
```

### 6.4 Job Seeker Flow

```
1. Register & verify email
2. PUT /api/v1/job-seeker-profile      → build profile
3. POST /api/v1/upload (multipart)     → upload resume PDF
4. POST /api/v1/resume                 → save resume record
5. PATCH /api/v1/resume/:id/set-default → mark default resume
6. GET /api/v1/job                     → browse jobs (public, no auth needed)
7. POST /api/v1/saved-job              → save a job
8. POST /api/v1/application            → apply to job
9. GET /api/v1/application/my          → track application statuses
```

### 6.5 Recruiter Flow

```
1. Register & verify email
2. PUT /api/v1/recruiter-profile       → build company profile
3. POST /api/v1/job                    → post a job
4. GET /api/v1/application/job/:jobId  → view applicants
5. PATCH /api/v1/application/:id/status → shortlist / select / reject
6. POST /api/v1/conversation           → message a job seeker
```

### 6.6 Messaging Flow

```
Matrix:
  recruiter  → job_seeker    ✅ recruiter initiates only
  job_seeker → recruiter     ❌ not allowed
  job_seeker ↔ instructor    ✅ both can initiate

Flow:
1. POST /api/v1/conversation           → start or return existing thread
2. POST /api/v1/message                → send a message
3. GET /api/v1/message/:conversationId → load messages (paginated)
4. PATCH /api/v1/message/:conversationId/read → mark as read
```

### 6.7 Password Management Flows

**Change password (logged in):**
```
POST /api/v1/auth/change-password  { oldPassword, newPassword }
```

**Forgot password (not logged in):**
```
1. POST /api/v1/auth/forgot-password  { email }
   → sends reset link to email containing a reset token
2. User opens reset link (frontend page)
3. POST /api/v1/auth/reset-password   { id, newPassword }
   Authorization: Bearer <reset-token-from-email-link>
```

**Set password (Google OAuth users who want local login too):**
```
POST /api/v1/auth/set-password  { password }
Authorization: Bearer <accessToken>
```

---

## 7. User-Facing API Endpoints

---

### 7.1 Upload

#### Upload File(s)

Upload one or multiple files to Cloudinary. Call this first, then use the returned URL(s) in other API requests.

```
POST /api/v1/upload
Auth: Required (any role)
Content-Type: multipart/form-data
```

**Form field:** `files` (use the same field name for both single and multiple)

**Single file response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "1 file(s) uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1/genius_rx/uuid-filename.jpg",
    "publicId": "genius_rx/uuid-filename"
  }
}
```

**Multiple files response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "3 file(s) uploaded successfully",
  "data": [
    "https://res.cloudinary.com/.../file1.pdf",
    "https://res.cloudinary.com/.../file2.jpg",
    "https://res.cloudinary.com/.../file3.png"
  ]
}
```

**Limits:** Max 10 files per request. Max 10 MB per file. Any file type accepted.

**Error examples:**
```json
{ "success": false, "message": "No file provided" }
```

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
      "avatar": { "url": "https://...", "publicId": "genius_rx/..." },
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

**Error examples:**
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

Clears the refresh token cookie.

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

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

**Response:**
```json
{ "statusCode": 200, "success": true, "message": "Password changed successfully", "data": null }
```

---

#### Set Password (OAuth users)

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

Sends a reset link to the email. The link contains a short-lived JWT token.

**Response:**
```json
{ "statusCode": 200, "success": true, "message": "Password reset link sent", "data": null }
```

---

#### Reset Password

Called after the user clicks the reset link in their email. Extract `id` and `token` from the link query params.

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

Open in WebView or browser. After success, server redirects to:
```
<your-deep-link>?accessToken=...&refreshToken=...
```

---

### 7.3 User

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
  "phone": "+1234567890"
}
```

**Validation rules:**
- `name`: 2–50 characters, required
- `email`: valid email format, required
- `password`: min 8 chars, must contain uppercase, number, and special character (`!@#$%^&*`)
- `role`: one of `job_seeker | recruiter | instructor` (cannot register as admin)
- `phone`: optional

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "User registered successfully!",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "job_seeker",
    "isEmailVerified": false,
    "status": "active",
    "accessStatus": "trial",
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

> **Next step:** Call `POST /api/v1/otp/send` to send the verification OTP.

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
    "phone": "+1234567890",
    "role": "job_seeker",
    "avatar": { "url": "https://...", "publicId": "genius_rx/..." },
    "isEmailVerified": true,
    "status": "active",
    "accessStatus": "subscribed",
    "currentSubscriptionId": "64f2...",
    "lastLoginAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
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
    "url": "https://res.cloudinary.com/...",
    "publicId": "genius_rx/uuid-avatar"
  }
}
```

> **Admin-only fields** (regular users will receive a 403 if they include these):
> `status`, `accessStatus`, `isEmailVerified`, `isDeleted`, `role`
> → See [Section 8.1 User Management](#81-user-management) for admin usage.

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User updated successfully",
  "data": { ... }
}
```

---

### 7.4 OTP

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

**Response:**
```json
{ "statusCode": 200, "success": true, "message": "OTP sent successfully", "data": null }
```

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

**Response:**
```json
{ "statusCode": 200, "success": true, "message": "OTP verified successfully", "data": null }
```

**Errors:**
```json
{ "success": false, "message": "Invalid OTP" }
```

> OTP expired after 2 minutes → call `POST /otp/send` again to resend.

---

### 7.5 Device Token

Register a device token for push notifications (FCM/APNs). Call this after every login and after the OS grants notification permission.

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

**Response:**
```json
{ "statusCode": 200, "success": true, "message": "Token registered", "data": { ... } }
```

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

Call on logout to stop receiving notifications on this device.

---

### 7.6 Resume

#### Upload Resume

First upload the file using `/api/v1/upload`, then create the resume record:

```
POST /api/v1/resume
Auth: Required (job_seeker)
```

**Request body:**
```json
{
  "file": {
    "url": "https://res.cloudinary.com/.../resume.pdf",
    "publicId": "genius_rx/uuid-resume"
  },
  "label": "Software Engineer CV 2024",
  "source": "uploaded"
}
```

**`source` values:** `uploaded | ai_generated`

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "_id": "64f3...",
    "userId": "64f1...",
    "file": { "url": "https://...", "publicId": "genius_rx/..." },
    "label": "Software Engineer CV 2024",
    "source": "uploaded",
    "isDefault": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Get My Resumes

```
GET /api/v1/resume/my
Auth: Required (job_seeker)
```

---

#### Get Single Resume

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

### 7.7 Job Seeker Profile

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

#### Get My Profile

```
GET /api/v1/job-seeker-profile/my
Auth: Required (job_seeker)
```

---

#### Get All Profiles

```
GET /api/v1/job-seeker-profile
Auth: Required (recruiter, admin, super_admin)
```

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page (default: 1) |
| `limit` | number | Limit (default: 10) |
| `lookingStatus` | string | Filter by looking status |
| `skills` | string | Filter by skill (partial match) |

---

#### Get Profile by ID

```
GET /api/v1/job-seeker-profile/:id
Auth: Required (recruiter, admin, super_admin, job_seeker)
```

---

### 7.8 Recruiter Profile

#### Create or Update Profile

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

#### Get My Profile

```
GET /api/v1/recruiter-profile/my
Auth: Required (recruiter)
```

---

#### Get All Profiles

```
GET /api/v1/recruiter-profile
Auth: Required (job_seeker, admin, super_admin)
```

**Query params:** `page`, `limit`, `location` (partial match), `serviceType`

---

#### Get Profile by ID

```
GET /api/v1/recruiter-profile/:id
Auth: Required (job_seeker, recruiter, admin, super_admin)
```

---

### 7.9 Instructor Profile

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

#### Get My Profile

```
GET /api/v1/instructor-profile/my
Auth: Required (instructor)
```

---

#### Get All Profiles

```
GET /api/v1/instructor-profile
Auth: Required (job_seeker, admin, super_admin)
```

**Query params:** `page`, `limit`

---

#### Get Profile by ID

```
GET /api/v1/instructor-profile/:id
Auth: Required (job_seeker, instructor, admin, super_admin)
```

---

### 7.10 ATS Check

ATS (Applicant Tracking System) score for a resume.

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

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "ATS check created",
  "data": {
    "_id": "64f4...",
    "userId": "64f1...",
    "resumeId": "64f3...",
    "score": 78,
    "issues": [
      { "section": "Skills", "message": "Missing keywords: EMR, EHR" }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
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

### 7.11 Job

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

#### Get My Jobs (Recruiter)

```
GET /api/v1/job/my
Auth: Required (recruiter)
```

**Query params:** `page`, `limit`, `status`

---

#### Get Job by ID (Public)

```
GET /api/v1/job/:id
Auth: None (public)
```

Returns full job details including recruiter's name, email, and avatar.

---

#### Update Job

```
PATCH /api/v1/job/:id
Auth: Required (recruiter — must own the job)
```

**Request body:** Any fields from the create body (all optional).

---

#### Delete Job (Recruiter — Soft Delete)

```
DELETE /api/v1/job/:id
Auth: Required (recruiter — must own the job)
```

Sets `isDeleted: true`.

> **Admin force-delete** (removes any job regardless of ownership) → see [Section 8.2 Job Management](#82-job-management)

---

### 7.12 Application

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

Also increments `job.applicantsCount` by 1.

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
| `status` | string | Filter by `applied \| viewed \| shortlisted \| selected \| rejected` |

---

#### Get Job's Applications (Recruiter)

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

The `interview` object is optional and only meaningful for `shortlisted`.

---

### 7.13 Saved Job

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

### 7.14 Conversation

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

**Messaging rules enforced:**
- Recruiter → Job Seeker: ✅ allowed (`type: "recruiter_seeker"`)
- Job Seeker ↔ Instructor: ✅ allowed (`type: "seeker_instructor"`)
- Job Seeker → Recruiter: ❌ 403 Forbidden
- Any other combo: ❌ 403 Forbidden
- Blocked users: ❌ 403 Forbidden

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

Returns conversations sorted by `lastMessageAt` (newest first). Participants populated with `name`, `avatar`, `role`.

---

#### Get Conversation by ID

```
GET /api/v1/conversation/:id
Auth: Required (recruiter, job_seeker, instructor — must be a participant)
```

---

### 7.15 Message

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
      "publicId": "genius_rx/doc",
      "type": "pdf"
    }
  ]
}
```

`text` and `attachments` are both optional but at least one must be provided.

Updates `conversation.lastMessage` and `conversation.lastMessageAt`.

---

#### Get Messages in Conversation

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

Marks all unread messages in the conversation as read for the calling user.

---

### 7.16 Block

#### Block a User

```
POST /api/v1/block
Auth: Required (any role)
```

**Request body:**
```json
{ "blockedId": "64f1..." }
```

**Errors:**
```json
{ "success": false, "message": "Cannot block yourself" }
{ "success": false, "message": "User already blocked" }
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

### 7.17 Report

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

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Report submitted",
  "data": {
    "_id": "64f9...",
    "reporterId": "64f1...",
    "reportedUserId": "64f2...",
    "category": "harassment",
    "description": "This user is sending inappropriate messages.",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

> Admin report review → see [Section 8.3 Reports](#83-reports)

---

### 7.18 Subscription Plan

#### Get Active Plans (Public)

```
GET /api/v1/subscription-plan
Auth: None (public)
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

> **Note on price:** `price` is stored as `Decimal128` in MongoDB. The API returns it as a string (e.g. `"29.99"`). Parse with `double.parse()` in Flutter.

> Admin plan management (create, update, deactivate) → see [Section 8.5 Subscription Plans](#85-subscription-plans)

---

### 7.19 Subscription

#### Start 7-Day Free Trial

```
POST /api/v1/subscription/trial
Auth: Required (any role)
```

No request body needed. Creates a `trialing` subscription.

- `endDate` = `startDate + 7 days`
- Updates `user.accessStatus = "trial"`
- Can only be called once (throws `409` if trial already exists)

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Trial started",
  "data": {
    "_id": "64fc...",
    "userId": "64f1...",
    "planId": null,
    "status": "trialing",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-08T00:00:00.000Z",
    "autoRenew": false
  }
}
```

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

- Updates `user.accessStatus = "subscribed"`
- `endDate` is auto-calculated: `intervalCount` months from `startDate`
  - `month × 1` = monthly
  - `month × 3` = quarterly
  - `year × 1` = annual

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

### 7.20 Transaction

#### Create Transaction

Record a payment transaction (call this alongside or before `POST /subscription`).

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

> Admin transaction management (view all, update status) → see [Section 8.6 Transactions](#86-transactions)

---

### 7.21 Static Content

CMS pages: About Us, Privacy Policy, Terms of Service.

#### Get All Content Pages (Public)

```
GET /api/v1/content
Auth: None
```

---

#### Get Content by Type (Public)

```
GET /api/v1/content/:type
Auth: None
```

**`:type` values:** `about_us | privacy_policy | terms`

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
    "updatedBy": "64f0...",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

> Admin content editing → see [Section 8.7 CMS](#87-cms)

---

### 7.22 Notification

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

> `meta.unreadCount` — use this to show the notification badge count.

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

## 8. Admin API Endpoints

> **Access:** All endpoints in this section require `admin` or `super_admin` role.  
> **Permissions:** `admin` and `super_admin` have identical permissions across all endpoints.  
> **Header:** `Authorization: Bearer <adminAccessToken>`

---

### 8.1 Dashboard Stats

Aggregation-powered endpoints for the admin dashboard. Both endpoints run all MongoDB aggregations in parallel (`Promise.all`) for efficiency.

#### Overview Stats

Powers the main dashboard: all 5 stat cards + recent users table.

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
        "avatar": { "url": "https://...", "publicId": "genius_rx/..." },
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

**Field notes:**
- `changePercent` — percentage change comparing new signups/revenue this calendar month vs last calendar month. Positive = growth, negative = decline.
- `totalEarnings.changePercent` — this month's collected revenue vs last month's.
- `recentUsers` — last 10 registered users, sorted newest first.

---

#### Earnings Stats

Powers the Earnings page: 3 summary cards.

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

**Field notes:**
- `totalEarnings` — all-time sum of `status: success` transactions.
- `thisMonthEarnings` — current calendar month's successful revenue (displayed as "Withdrawal amount" in the dashboard design).
- `pendingAmount` — sum of all `status: pending` transactions across all time.
- All `changePercent` values compare this month vs last month.

> The transaction list table on the Earnings page uses the existing `GET /api/v1/transaction` endpoint (see [Section 8.7](#87-transactions)).

---

### 8.2 User Management

Full visibility and control over all user accounts.

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

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Users retrieved successfully!",
  "data": [
    {
      "_id": "64f1...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "job_seeker",
      "status": "active",
      "accessStatus": "subscribed",
      "isEmailVerified": true,
      "isDeleted": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 250, "totalPage": 25 }
}
```

---

#### Get User by ID

```
GET /api/v1/user/:id
Auth: Required (admin, super_admin)
```

**Response:** Full user object (same shape as Get My Profile).

---

#### Update Any User

Admins can update any user including protected fields that regular users cannot change.

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

| Field | Type | Values | Description |
|---|---|---|---|
| `status` | string | `active \| blocked` | Block or unblock a user |
| `blockReason` | string | any | Reason shown if needed |
| `accessStatus` | string | `trial \| subscribed \| locked` | Override subscription gate |
| `isEmailVerified` | boolean | `true \| false` | Manually verify email |
| `role` | string | any `UserRole` | Change user role |
| `isDeleted` | boolean | `true \| false` | Restore a soft-deleted user |

> Regular users who send these fields receive `403 Forbidden`.

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User updated successfully",
  "data": { ... }
}
```

---

#### Soft Delete User

```
DELETE /api/v1/user/:id
Auth: Required (admin, super_admin)
```

Sets `isDeleted: true` and `deletedAt`. The record is preserved in the database and can be restored via [Update Any User](#update-any-user) with `{ "isDeleted": false }`.

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User deleted successfully",
  "data": { ... }
}
```

---

### 8.3 Job Management

Admins can remove any job listing regardless of which recruiter posted it.

#### Force Delete Job

```
DELETE /api/v1/job/admin/:id
Auth: Required (admin, super_admin)
```

Soft-deletes any job. Use when a listing violates platform policies. Unlike the recruiter's own delete endpoint (`DELETE /job/:id`), this does not check ownership.

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Job deleted successfully",
  "data": null
}
```

---

### 8.4 Reports

Review and action user-submitted reports.

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
      "reporterId": {
        "_id": "64f1...",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "reportedUserId": {
        "_id": "64f2...",
        "name": "Bad Actor",
        "email": "bad@example.com"
      },
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
Content-Type: application/json
```

**Request body:**
```json
{ "status": "actioned" }
```

**`status` values and meanings:**

| Value | Meaning |
|---|---|
| `pending` | Not yet reviewed (default) |
| `reviewed` | Admin has seen the report |
| `actioned` | Action taken against reported user |
| `dismissed` | Report was invalid or not actionable |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Report status updated",
  "data": { ... }
}
```

> **Best practice:** After actioning a report, create a Moderation Log entry — see [Section 8.5](#85-moderation-log).

---

### 8.5 Moderation Log

Audit trail for all significant admin actions. Every moderation action should be logged here for accountability.

#### Create Log Entry

```
POST /api/v1/moderation-log
Auth: Required (admin, super_admin)
Content-Type: application/json
```

**Request body:**
```json
{
  "action": "block_user",
  "targetType": "user",
  "targetId": "64f1...",
  "reason": "Multiple harassment reports confirmed",
  "metadata": {
    "reportIds": ["64f9...", "64fa..."]
  }
}
```

**`action` values:**

| Value | Description |
|---|---|
| `block_user` | User was blocked |
| `unblock_user` | User was unblocked |
| `delete_job` | Job listing was removed |
| `edit_cms` | CMS page was updated |
| `review_report` | Report was reviewed/actioned |

**`targetType` values:** `user | job | content | report`

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Log created",
  "data": {
    "_id": "64ff...",
    "adminId": "64f0...",
    "action": "block_user",
    "targetType": "user",
    "targetId": "64f1...",
    "reason": "Multiple harassment reports confirmed",
    "metadata": { "reportIds": ["64f9...", "64fa..."] },
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

#### Get All Logs

```
GET /api/v1/moderation-log
Auth: Required (admin, super_admin)
```

**Query params:** `page`, `limit`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Logs retrieved",
  "data": [
    {
      "_id": "64ff...",
      "adminId": {
        "_id": "64f0...",
        "name": "Admin User",
        "email": "admin@geniusrx.com"
      },
      "action": "block_user",
      "targetType": "user",
      "targetId": "64f1...",
      "reason": "Multiple harassment reports confirmed",
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPage": 8 }
}
```

---

### 8.6 Subscription Plans

Create and manage the platform's subscription plan catalog.

#### Get All Plans (including inactive)

```
GET /api/v1/subscription-plan/all
Auth: Required (admin, super_admin)
```

Returns all plans including inactive ones. The public endpoint (`GET /subscription-plan`) returns only active plans.

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "All plans retrieved",
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
      "features": ["Unlimited applications", "ATS check"],
      "jobPostLimit": null,
      "isActive": true,
      "sortOrder": 1
    },
    {
      "_id": "64fc...",
      "name": "Legacy Basic",
      "isActive": false,
      ...
    }
  ]
}
```

---

#### Create Plan

```
POST /api/v1/subscription-plan
Auth: Required (admin, super_admin)
Content-Type: application/json
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
- `intervalCount`: number of intervals (e.g. `3` months = quarterly)
- `price`: string decimal (e.g. `"29.99"`)
- `sortOrder`: display order on pricing page (lower = first)

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Plan created",
  "data": { "_id": "64fb...", ... }
}
```

---

#### Update Plan

```
PATCH /api/v1/subscription-plan/:id
Auth: Required (admin, super_admin)
Content-Type: application/json
```

**Request body** (all fields optional):
```json
{
  "price": "24.99",
  "features": ["Unlimited applications", "ATS check", "Priority support", "Profile boost"],
  "isActive": true,
  "sortOrder": 2
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Plan updated",
  "data": { ... }
}
```

---

#### Deactivate Plan

```
DELETE /api/v1/subscription-plan/:id
Auth: Required (admin, super_admin)
```

Sets `isActive: false`. The plan is hidden from public listing but not permanently deleted. Existing subscribers are not affected.

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Plan deactivated",
  "data": null
}
```

---

### 8.7 Transactions

View all platform transactions and manually correct statuses when needed.

#### Get All Transactions

```
GET /api/v1/transaction
Auth: Required (admin, super_admin)
```

**Query params:** `page`, `limit`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Transactions retrieved",
  "data": [
    {
      "_id": "64fd...",
      "userId": {
        "_id": "64f1...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "subscriptionId": "64fc...",
      "amount": "29.99",
      "currency": "USD",
      "gateway": "stripe",
      "gatewayRef": "pi_3OxKLz...",
      "type": "subscription",
      "status": "success",
      "createdAt": "2024-01-10T09:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1250, "totalPage": 63 }
}
```

---

#### Update Transaction Status

Use to manually correct a transaction whose status was not updated (e.g. webhook failure).

```
PATCH /api/v1/transaction/:id/status
Auth: Required (admin, super_admin)
Content-Type: application/json
```

**Request body:**
```json
{ "status": "success" }
```

**`status` values:** `pending | success | failed`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Transaction status updated",
  "data": { ... }
}
```

---

### 8.8 CMS

Manage the platform's static content pages.

#### Upsert Content Page

Creates the page if it doesn't exist; updates it if it does. Auto-increments `version` on each update.

```
PUT /api/v1/content/:type
Auth: Required (admin, super_admin)
Content-Type: application/json
```

**`:type` values:** `about_us | privacy_policy | terms`

**Request body:**
```json
{
  "title": "Privacy Policy",
  "body": "<h1>Privacy Policy</h1><p>Last updated: January 2024</p><p>Content here...</p>"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Content updated",
  "data": {
    "_id": "64fe...",
    "type": "privacy_policy",
    "title": "Privacy Policy",
    "body": "<h1>Privacy Policy</h1>...",
    "version": 4,
    "updatedBy": "64f0...",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

---

## 9. Flutter Integration Guide

### 9.1 Token Storage

Store tokens securely using `flutter_secure_storage`:

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

// Save tokens after login
await storage.write(key: 'accessToken', value: data['accessToken']);
await storage.write(key: 'refreshToken', value: data['refreshToken']);

// Read token
final token = await storage.read(key: 'accessToken');

// Delete on logout
await storage.deleteAll();
```

---

### 9.2 HTTP Client Setup (Dio)

```dart
import 'package:dio/dio.dart';

class ApiClient {
  static const String baseUrl = 'http://localhost:5000/api/v1';
  
  final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: Duration(seconds: 30),
    receiveTimeout: Duration(seconds: 30),
    headers: {'Content-Type': 'application/json'},
  ));

  ApiClient() {
    // Attach access token to every request
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read(key: 'accessToken');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Token expired — try refresh
          final refreshed = await _refreshToken();
          if (refreshed) {
            // Retry the original request
            return handler.resolve(await _retry(error.requestOptions));
          }
        }
        return handler.next(error);
      },
    ));
  }

  Future<bool> _refreshToken() async {
    try {
      final response = await _dio.post('/auth/refresh-token');
      final newToken = response.data['data']['accessToken'];
      await storage.write(key: 'accessToken', value: newToken);
      return true;
    } catch (e) {
      // Refresh failed → redirect to login
      return false;
    }
  }
}
```

---

### 9.3 Error Handling

```dart
try {
  final response = await dio.post('/auth/login', data: {...});
  // success
} on DioException catch (e) {
  final statusCode = e.response?.statusCode;
  final message = e.response?.data['message'] ?? 'Something went wrong';
  final errorSources = e.response?.data['errorSources'] as List? ?? [];

  if (statusCode == 401) {
    // Token expired — interceptor handles refresh automatically
  } else if (statusCode == 403) {
    // Blocked, unverified, or wrong role
    showError(message);
  } else if (statusCode == 422 || statusCode == 400) {
    // Validation error — show field-level errors
    for (final source in errorSources) {
      showFieldError(source['path'], source['message']);
    }
  }
}
```

---

### 9.4 File Upload

```dart
Future<String> uploadSingleFile(File file) async {
  final formData = FormData.fromMap({
    'files': await MultipartFile.fromFile(
      file.path,
      filename: file.path.split('/').last,
    ),
  });
  
  final response = await dio.post('/upload', data: formData);
  // Single file returns { url, publicId }
  return response.data['data']['url'] as String;
}

Future<List<String>> uploadMultipleFiles(List<File> files) async {
  final parts = await Future.wait(
    files.map((f) => MultipartFile.fromFile(f.path, filename: f.path.split('/').last))
  );
  
  final formData = FormData.fromMap({'files': parts});
  final response = await dio.post('/upload', data: formData);
  // Multiple files returns ["url1", "url2", ...]
  return List<String>.from(response.data['data']);
}
```

---

### 9.5 Google OAuth (WebView)

```dart
import 'package:webview_flutter/webview_flutter.dart';

class GoogleAuthWebView extends StatefulWidget {
  final String deepLink;
  const GoogleAuthWebView({required this.deepLink});

  @override
  State<GoogleAuthWebView> createState() => _GoogleAuthWebViewState();
}

class _GoogleAuthWebViewState extends State<GoogleAuthWebView> {
  late WebViewController controller;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setNavigationDelegate(NavigationDelegate(
        onNavigationRequest: (request) {
          if (request.url.startsWith(widget.deepLink)) {
            final uri = Uri.parse(request.url);
            final accessToken = uri.queryParameters['accessToken']!;
            final refreshToken = uri.queryParameters['refreshToken']!;
            // Save tokens and navigate to home
            Navigator.pop(context, {'accessToken': accessToken, 'refreshToken': refreshToken});
            return NavigationDecision.prevent;
          }
          return NavigationDecision.navigate;
        },
      ))
      ..loadRequest(Uri.parse('http://localhost:5000/api/v1/auth/google?redirect=${widget.deepLink}'));
  }

  @override
  Widget build(BuildContext context) => WebViewWidget(controller: controller);
}
```

---

### 9.6 Pagination

```dart
class PaginatedResponse<T> {
  final List<T> data;
  final int page;
  final int limit;
  final int total;
  final int totalPage;

  bool get hasNextPage => page < totalPage;
}

// Usage: check hasNextPage before requesting the next page
if (response.hasNextPage) {
  loadPage(response.page + 1);
}
```

---

### 9.7 accessStatus Gate

Gate UI features based on `user.accessStatus` from the login response:

```dart
enum AccessStatus { trial, subscribed, locked }

Widget buildFeatureGate(AccessStatus status, Widget feature) {
  switch (status) {
    case AccessStatus.trial:
    case AccessStatus.subscribed:
      return feature;
    case AccessStatus.locked:
      return SubscriptionPromptWidget();
  }
}
```

```
trial      → show trial banner with days remaining, allow features
subscribed → full access
locked     → block features, show upgrade/renew screen
```
