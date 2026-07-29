<div align="center">

# 🏦 Atlas Bank

### A production-grade full-stack digital banking platform built on the MERN stack

<br/>

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express%205-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite%208-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-black?style=flat-square&logo=jsonwebtokens)

**Wallets · UPI-style Transfers · ACID-Safe Transactions · OTP Login · AI Banking Assistant**

[Features](#-features) • [Architecture](#-architecture-overview) • [Getting Started](#-getting-started) • [API Overview](#-api-overview) • [Security](#-security-features) • [Contributing](#-contributing)

</div>

---

## 📖 Project Description

**Atlas Bank** is a full-stack digital banking application that simulates the core experience of a modern neobank — account management, an internal wallet system, UPI-style peer-to-peer transfers, transaction history, analytics, and an AI-powered financial assistant, all wrapped in a secure, session-revocable authentication system.

It is built with a clean **Repository → Service → Controller** architecture on the backend and a component-driven **React 19 + Vite** frontend, designed to read like a real production codebase rather than a tutorial project.

> [!NOTE]
> This is an actively evolving project. Some enterprise-grade extras (Swagger docs, automated test suite, Docker Compose) are tracked under [Future Improvements](#-future-improvements) and are not yet part of the codebase — see `server/README.md` for the current honest status.

---

## 🎬 Live Demo

| Environment | Link |
|---|---|
| 🌐 Frontend | `<!-- add your deployed frontend URL here -->` |
| ⚙️ Backend API | `<!-- add your deployed API base URL here -->` |
| 📘 Postman Collection | `<!-- add Postman collection link here -->` |

## 🖼️ Screenshots

<div align="center">

| Login | Dashboard | Wallet |
|---|---|---|
| `<!-- screenshot -->` | `<!-- screenshot -->` | `<!-- screenshot -->` |

| Transfer Money | Transactions | AI Assistant |
|---|---|---|
| `<!-- screenshot -->` | `<!-- screenshot -->` | `<!-- screenshot -->` |

</div>

---

## 📚 Table of Contents

- [🏦 Atlas Bank](#-atlas-bank)
    - [A production-grade full-stack digital banking platform built on the MERN stack](#a-production-grade-full-stack-digital-banking-platform-built-on-the-mern-stack)
  - [📖 Project Description](#-project-description)
  - [🎬 Live Demo](#-live-demo)
  - [🖼️ Screenshots](#️-screenshots)
  - [📚 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
    - [🧑‍💼 Account \& Identity](#-account--identity)
    - [🏦 Banking Core](#-banking-core)
    - [📊 Dashboard Experience](#-dashboard-experience)
    - [🛡️ Role-Aware Design](#️-role-aware-design)
  - [🏗️ Architecture Overview](#️-architecture-overview)
  - [🧰 Tech Stack](#-tech-stack)
  - [📂 Folder Structure](#-folder-structure)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Client Setup](#client-setup)
    - [Server Setup](#server-setup)
    - [Database Setup](#database-setup)
  - [🔑 Environment Variables](#-environment-variables)
  - [🔌 API Overview](#-api-overview)
  - [🔐 Authentication Flow](#-authentication-flow)
  - [🛡️ Security Features](#️-security-features)
  - [🤖 AI Banking Assistant](#-ai-banking-assistant)
  - [💰 Wallet System \& Transactions](#-wallet-system--transactions)
  - [☁️ Deployment](#️-deployment)
  - [🗺️ Future Improvements](#️-future-improvements)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)
  - [👨‍💻 Developer Information](#-developer-information)
  - [🙏 Acknowledgements](#-acknowledgements)
  - [📬 Contact](#-contact)

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
- Analytics view over spending/income patterns
- Notifications, Cards, Help Center, Beneficiaries, Profile & Settings pages
- **AI Banking Assistant** for natural-language queries about the user's own finances

### 🛡️ Role-Aware Design
- Four roles baked into the data model: `customer`, `employee`, `manager`, `admin` (see `server/src/docs/roles.md`)

---

## 🏗️ Architecture Overview

```
┌─────────────────────┐        HTTPS/JSON        ┌──────────────────────────┐
│   React 19 + Vite    │ ────────────────────────▶│   Express 5 REST API     │
│  (client/)            │◀──────────────────────── │   /api/v1/*              │
└─────────────────────┘        Axios instance      └───────────┬──────────────┘
                                                                 │
                                                     Repository → Service → Controller
                                                                 │
                                                        ┌────────▼─────────┐
                                                        │   MongoDB Atlas    │
                                                        │  (Mongoose ODM,    │
                                                        │  multi-doc ACID    │
                                                        │  sessions)          │
                                                        └────────────────────┘
```

The backend strictly separates concerns:

| Layer | Responsibility |
|---|---|
| **Routes** | Define endpoints, wire in middleware (auth, validation, rate limits) |
| **Controllers** | Parse request/response, no business logic |
| **Services** | Business logic, orchestration, MongoDB session/transaction handling |
| **Repositories** | Only layer that talks to Mongoose models |
| **Validators** | Joi schemas — reject bad input before it reaches a controller |

---

## 🧰 Tech Stack

<details>
<summary><strong>Frontend</strong></summary>

| Technology | Purpose |
|---|---|
| React 19 | UI library |
| Vite 8 | Dev server & build tool |
| React Router 7 | Client-side routing |
| Axios | HTTP client |
| Tailwind CSS 4 | Utility-first styling |
| Framer Motion | Animations & transitions |
| Lucide React | Icon set |
| Recharts | Analytics charts |
| React Markdown + Remark GFM | Rendering AI assistant responses |

</details>

<details>
<summary><strong>Backend</strong></summary>

| Technology | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server & routing |
| MongoDB + Mongoose 9 | Database & ODM |
| JWT (jsonwebtoken) | Access & refresh token auth |
| bcrypt | Password hashing |
| Joi | Request validation |
| Helmet | Secure HTTP headers |
| express-rate-limit | Brute-force / abuse protection |
| Nodemailer | OTP & verification emails |
| Morgan | Dev request logging |
| cookie-parser | Cookie handling |
| Groq API (`openai/gpt-oss-120b`) | AI Banking Assistant |

</details>

---

## 📂 Folder Structure

```
AtlasBank/
├── client/                 # React frontend  → see client/README.md
├── server/                 # Express backend → see server/README.md
├── .gitignore
└── README.md               # you are here
```

For the detailed internal structure of each side, see their dedicated READMEs.

---

## 🚀 Getting Started

### Prerequisites

- Node.js **18+**
- npm **9+**
- A MongoDB instance (local, replica set, or MongoDB Atlas)
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
> MongoDB **transactions require a replica set** (or MongoDB Atlas, which is a replica set by default). A single standalone `mongod` instance will throw on multi-document transactions used by deposit/withdraw/transfer.

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
| CORS | Locked to the configured frontend origin, credentials enabled |
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
| Frontend (`client/`) | Vercel / Netlify (static Vite build) |
| Backend (`server/`) | Render / Railway / a VPS behind Nginx |
| Database | MongoDB Atlas |

```bash
# Frontend production build
cd client && npm run build      # outputs to client/dist

# Backend production start
cd server && npm start
```

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