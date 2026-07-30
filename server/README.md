<div align="center">

# ⚙️ Atlas Bank — Server

### Express 5 + MongoDB REST API powering the Atlas Bank platform

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black?style=flat-square&logo=jsonwebtokens)
![Joi](https://img.shields.io/badge/Validation-Joi-orange?style=flat-square)

</div>

> [!NOTE]
> This README documents **only the `server/` backend**. For the frontend, see [`../client/README.md`](../client/README.md). For the full project, see [`../README.md`](../README.md).

---

## 📚 Table of Contents

- [⚙️ Atlas Bank — Server](#️-atlas-bank--server)
    - [Express 5 + MongoDB REST API powering the Atlas Bank platform](#express-5--mongodb-rest-api-powering-the-atlas-bank-platform)
  - [📚 Table of Contents](#-table-of-contents)
  - [🧭 Overview](#-overview)
  - [🏗️ Architecture](#️-architecture)
  - [🧱 Repository / Service / Controller Layers](#-repository--service--controller-layers)
  - [🧩 Middleware](#-middleware)
  - [🔐 Authentication](#-authentication)
  - [💸 Wallet, Transactions \& Transfers](#-wallet-transactions--transfers)
  - [🗄️ Database Design](#️-database-design)
    - [Collections](#collections)
    - [Roles (`src/docs/roles.md`)](#roles-srcdocsrolesmd)
  - [📁 Folder Structure](#-folder-structure)
  - [🔌 API Endpoints](#-api-endpoints)
    - [Auth — `/api/v1/auth`](#auth--apiv1auth)
    - [Accounts — `/api/v1/accounts` (all routes protected)](#accounts--apiv1accounts-all-routes-protected)
    - [Wallet — `/api/v1/wallet` (all routes protected)](#wallet--apiv1wallet-all-routes-protected)
    - [Transactions — `/api/v1/transactions` (all routes protected)](#transactions--apiv1transactions-all-routes-protected)
    - [AI Assistant — `/api/v1/ai` (protected)](#ai-assistant--apiv1ai-protected)
  - [⚠️ Error Handling \& Validation](#️-error-handling--validation)
  - [🔑 Environment Variables](#-environment-variables)
  - [📜 Scripts](#-scripts)
  - [☁️ Production Deployment](#️-production-deployment)
  - [🛡️ Security](#️-security)
  - [📝 Logging](#-logging)
  - [🗺️ Future Improvements](#️-future-improvements)
  - [🧑‍💻 Developer Notes](#-developer-notes)

---

## 🧭 Overview

The server is a **Node.js + Express 5** REST API using **MongoDB** via **Mongoose 9**, structured around a strict **Repository → Service → Controller** pattern so that business logic, data access, and HTTP handling never bleed into one another.

Base URL: `/api/v1`

```
GET / → { success: true, message: "🚀 Atlas Bank API is Running..." }
```

---

## 🏗️ Architecture

```
Request
  │
  ▼
Route (routes/*.routes.js)          — endpoint + middleware wiring
  │
  ▼
Middleware                          — protect / validate / rate-limit
  │
  ▼
Controller (controllers/*.controller.js)   — request/response only
  │
  ▼
Service (services/*.service.js)     — business logic, Mongo sessions
  │
  ▼
Repository (repositories/*.repository.js) — Mongoose model access
  │
  ▼
MongoDB
```

## 🧱 Repository / Service / Controller Layers

| Layer | Rule | Example |
|---|---|---|
| **Controller** | No direct DB access, no business rules — just call a service and shape the HTTP response | `auth.controller.js` |
| **Service** | All business logic, orchestrates repositories, owns MongoDB sessions/transactions | `transaction.service.js` runs deposit/withdraw/transfer inside `session.withTransaction()` |
| **Repository** | The *only* layer allowed to import a Mongoose model | `wallet.repository.js`, `account.repository.js` |
| **Validator** | Joi schemas that gate every mutating route before it reaches a controller | `auth.validator.js` |

> [!TIP]
> This separation means swapping MongoDB for another datastore later would only touch the repository layer.

---

## 🧩 Middleware

| Middleware | File | Purpose |
|---|---|---|
| `protect` | `middlewares/auth.middleware.js` | Verifies JWT **and** re-fetches the user from MongoDB on every request — instantly rejects deleted/blocked/suspended accounts and tokens issued before a password change |
| `validate(schema, property)` | `middlewares/validate.middleware.js` | Runs a Joi schema against `body`/`params`/`query`, strips unknown fields, collects all errors at once |
| `loginRateLimiter` / `otpRateLimiter` / `resendRateLimiter` | `middlewares/rateLimiter.middleware.js` | Tiered `express-rate-limit` configs for login, OTP verification, and resend-code endpoints |
| `role` | `middlewares/role.middleware.js` | Role-based access gating (`customer` / `employee` / `manager` / `admin`) |
| `errorHandler` | `middlewares/errorHandler.middleware.js` | Final middleware — converts any thrown/forwarded error into a clean JSON response |

> [!IMPORTANT]
> `protect` re-hydrates the user from the database on **every single request** rather than trusting the JWT payload alone. This is a deliberate banking-grade trade-off: one extra indexed lookup per request in exchange for instant session revocation.

---

## 🔐 Authentication

Two-step, OTP-verified login with access + refresh JWTs:

```
POST /auth/register           → create account (unverified)
GET  /auth/verify-email        → verify via signed token link
POST /auth/login                → check credentials → email OTP sent
POST /auth/verify-login         → verify OTP → issue access + refresh tokens
POST /auth/resend-otp            → resend a fresh OTP (rate-limited)
POST /auth/refresh-token          → exchange refresh token for new access token
POST /auth/forgot-password        → request password-reset OTP
POST /auth/verify-reset-code       → verify the reset OTP
POST /auth/reset-password           → set a new password
GET  /auth/profile                    → (protected) current user info
```

**Password Reset flow:** `forgot-password` → email OTP → `verify-reset-code` → `reset-password`, all rate-limited to prevent OTP-bombing/brute-forcing.

**Email Verification:** a signed token link is emailed on registration; hitting `GET /auth/verify-email?token=...` marks the account verified.

---

## 💸 Wallet, Transactions & Transfers

- Every user gets **exactly one Wallet** (`unique: true` on `user` in the schema) with a unique `walletNumber`, `upiId`, and a generated QR code
- `POST /transactions/deposit`, `/withdraw`, and `/transfer` each open a `mongoose.startSession()` and run the balance mutation(s) inside `session.withTransaction(...)` — so a transfer's sender-debit and receiver-credit either **both** commit or **both** roll back
- Every operation writes a `Transaction` document (`type`: `deposit` | `withdraw` | `transfer`, unique `transactionNumber`, `amount`, `currency`, `status`) for a full audit trail

> [!WARNING]
> Multi-document transactions require MongoDB running as a **replica set** (MongoDB Atlas satisfies this by default). A standalone `mongod` will throw when `withTransaction` is called.

---

## 🗄️ Database Design

### Collections

| Model | Key Fields | Notes |
|---|---|---|
| **User** | `fullName`, `email` (unique), `phone` (unique), `password` (hashed, `select:false`), `role`, `isEmailVerified`, `isPhoneVerified` | `role` enum: `customer`, `employee`, `manager`, `admin` |
| **Account** | `user` (ref), `accountHolderName`, `accountNumber` (unique, `select:false`), `ifscCode`, `bankName`, `branchName`, `accountType` (`savings`\|`current`), `currency` | Linked external bank accounts, one user can have many |
| **Wallet** | `user` (ref, unique — 1:1), `walletNumber` (unique), `upiId` (unique), `availableBalance`, `currency`, `status` (`active`\|`blocked`\|`suspended`) | The internal money store |
| **Transaction** | `transactionNumber` (unique), `sender`/`receiver` (User refs), `senderWallet`/`receiverWallet` (Wallet refs), `type` (`deposit`\|`withdraw`\|`transfer`), `amount`, `currency`, `status` | Full ledger entry per operation |
| **Counter** | `name` (unique), `sequence` | Backs sequential ID generation (e.g. transaction/wallet numbers) |

### Roles (`src/docs/roles.md`)

| Role | Key permissions |
|---|---|
| Customer | Register, login, view/update profile, manage own accounts/wallet, transfer, deposit, withdraw, view transactions, manage beneficiaries |
| Employee | Verify customers, view customers, approve/freeze accounts, generate statements |
| Manager | All employee permissions + approve high-value transfers, view reports, manage employees |
| Admin | Manage users/employees, freeze/unfreeze accounts, view all transactions, dashboard analytics |

---

## 📁 Folder Structure

```
server/
├── src/
│   ├── config/
│   │   ├── env.js                  # dotenv bootstrap
│   │   ├── jwt.config.js           # JWT secrets/expiry config
│   │   └── security.config.js
│   ├── constants/
│   │   └── auth.constants.js
│   ├── controllers/                # HTTP request/response only
│   │   ├── account.controller.js
│   │   ├── ai.controller.js
│   │   ├── auth.controller.js
│   │   ├── transaction.controller.js
│   │   └── wallet.controller.js
│   ├── database/
│   │   └── database.js             # Mongoose connection
│   ├── docs/
│   │   ├── modules.md
│   │   └── roles.md
│   ├── helpers/                    # bcrypt, jwt, OTP, ID generation helpers
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   ├── rateLimiter.middleware.js
│   │   ├── role.middleware.js
│   │   └── validate.middleware.js
│   ├── models/                     # Mongoose schemas
│   │   ├── account.model.js
│   │   ├── counter.model.js
│   │   ├── transaction.model.js
│   │   ├── user.model.js
│   │   └── wallet.model.js
│   ├── repositories/                # Only layer touching Mongoose models
│   ├── routes/
│   │   ├── account.routes.js
│   │   ├── ai.routes.js
│   │   ├── auth.routes.js
│   │   ├── transaction.routes.js
│   │   └── wallet.routes.js
│   ├── services/                    # Business logic + Mongo sessions
│   │   ├── account.service.js
│   │   ├── ai.service.js
│   │   ├── auth.service.js
│   │   ├── email.service.js
│   │   ├── transaction.service.js
│   │   └── wallet.service.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   └── asyncHandler.js
│   ├── validators/                  # Joi schemas
│   ├── app.js                        # Express app + middleware wiring
│   └── server.js                     # Entry point, connects DB, starts listener
└── package.json
```

---

## 🔌 API Endpoints

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register a new user |
| POST | `/login` | ❌ | Step 1: verify credentials, send OTP |
| POST | `/verify-login` | ❌ | Step 2: verify OTP, issue tokens |
| POST | `/resend-otp` | ❌ | Resend login OTP |
| POST | `/refresh-token` | ❌ | Exchange refresh token for new access token |
| POST | `/forgot-password` | ❌ | Request password-reset OTP |
| POST | `/verify-reset-code` | ❌ | Verify password-reset OTP |
| POST | `/reset-password` | ❌ | Set new password |
| GET | `/verify-email` | ❌ | Verify email via token link |
| GET | `/profile` | ✅ | Get current authenticated user |

### Accounts — `/api/v1/accounts` (all routes protected)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create a linked bank account |
| GET | `/` | List all accounts for the current user |
| GET | `/:accountId` | Get a single account |
| PATCH | `/:accountId` | Update account details |
| PATCH | `/:accountId/primary` | Set as primary account |
| DELETE | `/:accountId` | Delete an account |

### Wallet — `/api/v1/wallet` (all routes protected)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create the user's wallet |
| GET | `/` | Get the user's wallet |
| GET | `/qr` | Get wallet QR code |
| PATCH | `/:walletId/status` | Update wallet status |
| DELETE | `/:walletId` | Delete wallet |

### Transactions — `/api/v1/transactions` (all routes protected)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/deposit` | Deposit into wallet |
| POST | `/withdraw` | Withdraw from wallet |
| POST | `/transfer` | Wallet-to-wallet (UPI-style) transfer |
| GET | `/` | List current user's transactions |
| GET | `/:transactionId` | Get a single transaction |

### AI Assistant — `/api/v1/ai` (protected)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | Chat with the AI banking assistant, scoped to the caller's own financial data |

---

## ⚠️ Error Handling & Validation

- **`ApiError`** — a custom error class carrying an HTTP status code + message
- **`asyncHandler`** — wraps async route handlers so rejected promises flow into Express's error pipeline instead of crashing the process
- **`errorHandler` middleware** — the last middleware in `app.js`; converts any error into a consistent `{ success: false, message }` JSON shape
- **Unknown routes** return a clean `404` JSON payload instead of Express's default HTML page
- **Joi validators** (`validators/*.validator.js`) run via the `validate` middleware on every mutating route, with `abortEarly: false` (collects all field errors at once) and `stripUnknown: true` (drops unexpected fields)

---

## 🔑 Environment Variables

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/atlasbank

# Frontend URL — used for CORS (so the browser lets the client talk to
# this API) and for links inside verification/reset emails.
# Local dev: http://localhost:5173
CLIENT_URL=https://atlas-bank.netlify.app

JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

> [!WARNING]
> Never commit a real `.env` file. Keep secrets out of version control.

---

## 📜 Scripts

```bash
npm install       # install dependencies
npm run dev       # start with nodemon (auto-restart on file changes)
npm start         # start in production mode (plain node)
```

---

## ☁️ Production Deployment

1. Set `NODE_ENV=production` and all required env vars on your host
2. Point `MONGO_URI` at a production MongoDB Atlas cluster (replica set — required for transactions)
3. Run behind a process manager (PM2) or your platform's own process supervisor:
   ```bash
   npm start
   ```
4. Put the API behind a reverse proxy (Nginx) or platform load balancer for TLS termination
5. Lock CORS `origin` in `app.js` to your real deployed frontend domain

---

## 🛡️ Security

| Layer | Tool | Notes |
|---|---|---|
| Secure headers | `helmet()` | Applied globally in `app.js` |
| CORS | `cors()` | Currently locked to `http://localhost:5173` — **update for production** |
| Brute-force protection | `express-rate-limit` | Separate limiters for login (10/15min), OTP (8/10min), resend (3/5min) |
| Password hashing | `bcrypt` | Password field is `select: false` by default on the model |
| Session revocation | Custom `protect` middleware logic | Instant invalidation on block/suspend/delete/password-change |
| Input validation | `Joi` | Every mutating route validated before hitting a controller |
| Sensitive field hiding | Mongoose `select: false` | Applied to `password` and `accountNumber` |

---

## 📝 Logging

- **Morgan** (`"dev"` format) is enabled globally in `app.js` for request logging during development.

> [!NOTE]
> Production-grade structured logging (Winston + daily rotate file) is planned but **not yet implemented** — see Future Improvements.

---

## 🗺️ Future Improvements

Tracked from the project's own dev notes — an honest status, not a wishlist dressed as done:

- [ ] Migrate/augment validation with Zod alongside Joi (under consideration)
- [ ] `express-mongo-sanitize` + `hpp` (HTTP Parameter Pollution protection)
- [ ] `compression` middleware
- [ ] Winston + daily-rotate-file logging for production
- [ ] Multer (file upload) + Sharp (image processing) — for KYC document upload
- [ ] `node-cron` scheduled jobs (e.g. statement generation)
- [ ] Swagger / OpenAPI documentation
- [ ] Automated tests (Jest + Supertest)
- [ ] DTOs and repository interfaces for stricter typing
- [ ] Docker + Docker Compose, then Nginx in front

---

## 🧑‍💻 Developer Notes

- Multi-document money operations (deposit/withdraw/transfer) **must** stay inside a Mongo session/transaction — never split a debit and credit across two separate un-sessioned writes
- `protect` deliberately trades a bit of latency (one DB lookup per request) for correctness — don't "optimize" this back to trusting the raw JWT payload for a banking app
- Keep the Repository → Service → Controller boundary strict: controllers should never `import` a Mongoose model directly
- `GROQ_MODEL` defaults to `openai/gpt-oss-120b` since `llama-3.3-70b-versatile` was deprecated upstream — check Groq's model list before changing it

---

<div align="center">

⬅️ Back to [Project Root README](../README.md) · Frontend docs: [`client/README.md`](../client/README.md)

</div>