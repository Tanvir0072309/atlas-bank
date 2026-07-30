<div align="center">

# 🏦 Atlas Bank

### A production-grade full-stack digital banking platform built on the MERN stack

<br/>

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express%205-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-black?style=for-the-badge&logo=jsonwebtokens)

![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Made with](https://img.shields.io/badge/Made%20with-%E2%9D%A4-red?style=flat-square)

**Wallets · UPI-style Transfers · ACID-Safe Transactions · OTP Login · AI Banking Assistant**

[Features](#-features) • [Architecture](#️-architecture-overview) • [Getting Started](#-getting-started) • [API Overview](#-api-overview) • [Security](#️-security-features) • [Contributing](#-contributing)

</div>

---

## 📖 Project Description

**Atlas Bank** is a full-stack digital banking application that simulates the core experience of a modern neobank — account management, an internal wallet system, UPI-style peer-to-peer transfers, transaction history, analytics, and an AI-powered financial assistant, all wrapped in a secure, session-revocable authentication system.

It is built with a clean **Repository → Service → Controller** architecture on the backend and a component-driven **React 19 + Vite** frontend, designed to read like a real production codebase rather than a tutorial project.

> [!NOTE]
> This is an actively evolving project. Some enterprise-grade extras (Swagger docs, automated test suite, Docker Compose) are tracked under [Future Improvements](#️-future-improvements) and are not yet part of the codebase — see `server/README.md` for the current honest status.

<div align="center">

```
✦ ── ✦ ── ✦ ── ✦ ── ✦ ── ✦ ── ✦ ── ✦ ── ✦ ── ✦
```

</div>

## 🌟 Why Atlas Bank Stands Out

Atlas Bank isn't a toy CRUD app wearing a bank's costume — it's engineered with the discipline of an actual fintech product. Every layer of this stack was chosen deliberately, not defaulted into:

- **React 19** on **Vite 8** gives the frontend near-instant HMR and a build pipeline fast enough to keep iteration frictionless, while **Tailwind CSS 4** and **Framer Motion** turn routine banking screens — balances, transfers, statements — into an interface that actually feels alive, with fluid, physics-based motion instead of static page-flips.
- **Express 5** on **Node.js**, paired with a strict **Routes → Controllers → Services → Repositories** pipeline, keeps business logic completely decoupled from HTTP plumbing. That's the same architectural discipline you'd expect from a production banking backend, not a weekend script.
- **MongoDB + Mongoose 9**, driven through real **multi-document ACID transactions**, means a transfer either fully happens or fully doesn't — no half-updated wallets, no silent data corruption, even under concurrent load.
- **JWT access/refresh tokens**, **bcrypt** hashing, **Joi** validation, **Helmet**, and tiered **rate-limiting** work together as layered defense — this is security treated as a first-class citizen, not an afterthought bolted on before deployment.
- The **Groq-powered AI Assistant** is the standout feature: a genuinely useful, context-aware financial companion that reasons only over *your own* transaction history — smart, private, and fast, thanks to Groq's inference speed.

The result is a codebase that reads like it was built to be maintained, extended, and trusted — not just demoed once and forgotten.

<div align="center">

```
✦ ── ✦ ── ✦ ── ✦ ── ✦ ── ✦ ── ✦ ── ✦ ── ✦ ── ✦
```

</div>

---

## ✨ Features

### 🧑‍💼 Account & Identity
- User registration with strict validation (Joi schemas)
- Two-step login: password check → **email OTP verification**
- OTP resend with abuse-protected rate limiting
- JWT **access + refresh token** pair with silent refresh
- Instant session revocation on password change, block, or suspension
- Email verification via signed token link
- Forgot password → OTP-based reset code → new password

### 🏦 Banking Core
- Multiple linked bank **accounts** per user (savings/current), with a primary account
- One internal **Wallet** per user with a unique UPI-style ID and QR code
- **Deposit**, **Withdraw**, and **Transfer** (wallet-to-wallet, UPI-style)
- Full **transaction ledger** with unique transaction numbers
- Wallet status management (active / blocked / suspended)

### 📊 Dashboard Experience
- Customer dashboard with real-time balance
- Analytics view over spending/income patterns (live data, not mock numbers)
- Notifications, Cards, Help Center, Beneficiaries, Profile & Settings pages
- **AI Banking Assistant** for natural-language queries about the user's own finances

### 🛡️ Role-Aware Design
- Four roles baked into the data model: `customer`, `employee`, `manager`, `admin` (see `server/src/docs/roles.md`)

<div align="center">

```
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ░  Secure  →  Scalable  →  Real-time  →  Smart  ░
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

</div>

---

## 🏗️ Architecture Overview

```
┌───────────────────────┐        HTTPS / JSON        ┌───────────────────────────┐
│    React 19 + Vite     │ ──────────────────────────▶│     Express 5 REST API    │
│      (client/)          │◀────────────────────────── │        /api/v1/*          │
└───────────────────────┘        Axios instance        └─────────────┬─────────────┘
                                                                       │
                                                     Routes → Controllers → Services
                                                                       │
                                                              → Repositories
                                                                       │
                                                          ┌────────────▼─────────────┐
                                                          │       MongoDB Atlas        │
                                                          │  (Mongoose ODM, multi-doc  │
                                                          │   ACID-safe sessions)      │
                                                          └────────────────────────────┘
```

The backend strictly separates concerns:

| Layer | Responsibility |
|---|---|
| **Routes** | Define endpoints, wire in middleware (auth, validation, rate limits) |
| **Controllers** | Parse request/response, no business logic |
| **Services** | Business logic, orchestration, MongoDB session/transaction handling |
| **Repositories** | Only layer that talks to Mongoose models |
| **Validators** | Joi schemas — reject bad input before it reaches a controller |

This separation means every money-moving operation (deposit, withdraw, transfer) is testable and auditable in isolation — the controller never touches the database directly, and the service layer never touches `req`/`res`.

---

## 🧰 Tech Stack — What Each Technology Actually Does

<details open>
<summary><strong>Frontend</strong></summary>
<br/>

| Technology | What it does here |
|---|---|
| **React 19** | Powers the entire UI as reusable, stateful components — every screen (dashboard, wallet, transfers, analytics) is built as a composition of these. |
| **Vite 8** | Dev server and build tool — gives near-instant hot reload during development and bundles the production build. |
| **React Router 7** | Handles all client-side navigation and enforces public vs. protected route access (e.g., you can't reach `/dashboard` without a valid session). |
| **Axios** | The single HTTP client used across the app — attaches the JWT to every request automatically and handles token/session cleanup on 401 errors. |
| **Tailwind CSS 4** | Utility-first styling engine — drives every visual detail (colors, spacing, layout) without writing custom CSS files. |
| **Framer Motion** | Adds real motion to the interface — the transfer "sending money" animation, modal transitions, and micro-interactions all run through this. |
| **Lucide React** | Supplies the entire icon set used across the dashboard, forms, and navigation. |
| **Recharts** | Renders the analytics charts — income vs. expense, category-wise spending, and balance trend — using live transaction data. |
| **React Markdown + Remark GFM** | Formats and safely renders the AI Assistant's chat responses (bold text, lists, tables) inside the chat UI. |

</details>

<details>
<summary><strong>Backend</strong></summary>
<br/>

| Technology | What it does here |
|---|---|
| **Node.js + Express 5** | Runs the HTTP server and routes every API request through middleware, controllers, and services. |
| **MongoDB + Mongoose 9** | Stores every user, account, wallet, and transaction as a schema-validated document; Mongoose defines and enforces those schemas. |
| **MongoDB Multi-Document Transactions** | Guarantees that a transfer's debit and credit happen together, atomically — either both succeed or neither does. |
| **JWT (jsonwebtoken)** | Issues and verifies the access and refresh tokens that authenticate every request after login. |
| **bcrypt** | Hashes every password before it's stored — plaintext passwords never touch the database. |
| **Joi** | Validates every incoming request body against a strict schema before it reaches business logic, rejecting malformed or malicious input early. |
| **Helmet** | Sets secure HTTP response headers to reduce common web vulnerabilities. |
| **express-rate-limit** | Throttles login, OTP, and resend requests to block brute-force and abuse attempts. |
| **Nodemailer** | Sends every OTP code, email-verification link, and password-reset email. |
| **cookie-parser** | Reads and manages the HttpOnly refresh-token cookie used for silent session renewal. |
| **Morgan** | Logs every incoming request during development for quick debugging. |
| **Groq API (`openai/gpt-oss-120b`)** | Powers the AI Banking Assistant — answers natural-language questions using only the logged-in user's own financial data. |

</details>

---

## 🚀 Getting Started

### Prerequisites

- Node.js **18+**
- npm **9+**
- A MongoDB instance (local replica set, or MongoDB Atlas)
- A Groq API key (for the AI Assistant) — free tier available
- An SMTP-capable email account (for OTP/verification emails)

### Client Setup

```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

### Server Setup

```bash
cd server
npm install
npm run dev         # nodemon, http://localhost:5000
# or
npm start           # production
```

### Database Setup

> [!TIP]
> MongoDB **transactions require a replica set** (or MongoDB Atlas, which is a replica set by default). A single standalone `mongod` instance will throw on the multi-document transactions used by deposit/withdraw/transfer — Atlas Bank automatically falls back to non-transactional writes in that case, but a replica set is strongly recommended for production.

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), **or**
2. Run a local single-node replica set:
   ```bash
   mongod --replSet rs0 --dbpath /path/to/data
   mongosh --eval "rs.initiate()"
   ```
3. Put the connection string in `server/.env` as `MONGO_URI`.

---

## 🔑 Environment Variables

Create a `.env` file inside **`server/`**:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/atlasbank

# JWT
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Client (for CORS + email links)
CLIENT_URL=http://localhost:5173

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# AI Assistant (Groq)
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

Create a `.env` file inside **`client/`**:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

> [!WARNING]
> Never commit real `.env` values. Both `client/.env` and `server/.env` should stay in `.gitignore`.

---

## 🔌 API Overview

Base URL: `http://localhost:5000/api/v1`

| Module | Base Path | Description |
|---|---|---|
| Auth | `/auth` | Register, login (OTP), tokens, password reset |
| Accounts | `/accounts` | Linked bank account CRUD |
| Wallet | `/wallet` | Internal wallet, QR, status |
| Transactions | `/transactions` | Deposit, withdraw, transfer, ledger |
| AI Assistant | `/ai` | Conversational assistant over the user's own data |

Full endpoint tables are documented in **`server/README.md`**.

---

## 🔐 Authentication Flow

```
1. POST /auth/register        → account created (unverified)
2. GET  /auth/verify-email     → email verified via signed token link
3. POST /auth/login            → credentials checked, OTP emailed
4. POST /auth/verify-login     → OTP verified → access + refresh tokens issued
5. POST /auth/refresh-token    → silent renewal of access token
6. POST /auth/forgot-password  → OTP reset flow when password is lost
```

Every protected route re-hydrates the user from MongoDB on each request (not just the JWT payload), so a blocked/suspended account or a post-password-change token is rejected **immediately** — not just on expiry.

---

## 🛡️ Security Features

| Feature | Implementation |
|---|---|
| Password hashing | `bcrypt` |
| Access & refresh tokens | Signed JWTs, separate secrets & expiries |
| Instant session revocation | User re-fetched from DB on every request |
| Brute-force protection | Tiered `express-rate-limit` on login/OTP/resend |
| Secure headers | `helmet` |
| Input validation | `Joi` schemas on every mutating route |
| CORS | Locked to the configured frontend origin(s), credentials enabled |
| Cross-site cookies | `SameSite=None` + `Secure` in production so refresh tokens survive a Netlify ↔ Render split |
| Data-scoped AI context | The AI assistant only ever sees the authenticated user's own wallet/account/transaction data — never account numbers, IFSC, or PII |

---

## 🤖 AI Banking Assistant

`POST /api/v1/ai/chat` (protected route) powers a conversational assistant, backed by the **Groq API** (`openai/gpt-oss-120b` by default, configurable via `GROQ_MODEL`).

Before every request, the backend builds a fresh, minimal financial snapshot for the **currently authenticated user only** — wallet balance, linked account balances, and recent transactions — and deliberately excludes profile PII and account/IFSC identifiers, so the model reasons only over spend/balance data.

---

## 💰 Wallet System & Transactions

- Every user gets exactly **one wallet** (unique UPI ID + wallet number + QR code)
- `deposit`, `withdraw`, and `transfer` all run inside a **MongoDB session with `withTransaction`**, so a wallet debit/credit pair either fully commits or fully rolls back — no partial-money states
- Every operation produces a `Transaction` document with a unique transaction number, type, amount, currency, and status for a complete audit trail

---

## ☁️ Deployment

| Piece | Suggested target |
|---|---|
| Frontend (`client/`) | Netlify / Vercel (static Vite build) |
| Backend (`server/`) | Render / Railway / a VPS behind Nginx |
| Database | MongoDB Atlas |

```bash
# Frontend production build
cd client && npm run build      # outputs to client/dist

# Backend production start
cd server && npm start
```

> [!IMPORTANT]
> When the frontend and backend live on different domains, set `CLIENT_URL` on the backend to the **exact** deployed frontend origin, and set `NODE_ENV=production` so refresh-token cookies are issued with `SameSite=None; Secure` — otherwise the browser will silently drop them.

---

## 🗺️ Future Improvements

> [!NOTE]
> Tracked honestly from the project's own dev notes — not yet implemented:

- [ ] Swagger/OpenAPI documentation
- [ ] Automated test suite (Jest + Supertest)
- [ ] Winston + daily rotate file logging for production
- [ ] Docker + Docker Compose setup
- [ ] express-mongo-sanitize + hpp hardening
- [ ] File upload (Multer) + image processing (Sharp) for KYC documents
- [ ] Scheduled jobs (node-cron) for statement generation

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

Please keep the Repository → Service → Controller separation intact on the backend, and match the existing component/hook conventions on the frontend.

---

## 📄 License

Licensed under the **MIT License**. See `LICENSE` for details.

---

## 👨‍💻 Developer Information

Maintained by **[Tanvir0072309](https://github.com/Tanvir0072309)** — repository: [`atlas-bank`](https://github.com/Tanvir0072309/atlas-bank)

## 🙏 Acknowledgements

- [MongoDB](https://www.mongodb.com/) for multi-document ACID transactions
- [Groq](https://groq.com/) for fast LLM inference powering the AI assistant
- The open-source React & Express ecosystems

## 📬 Contact

For questions, issues, or feature requests, please [open an issue](https://github.com/Tanvir0072309/atlas-bank/issues) on GitHub.

---

<div align="center">

**Atlas Bank** — banking software, built the way a real bank would build it.

</div>
