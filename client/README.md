<div align="center">

# 💻 Atlas Bank — Client

### React 19 + Vite frontend for the Atlas Bank digital banking platform

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat-square&logo=axios&logoColor=white)

</div>

> [!NOTE]
> This README documents **only the `client/` frontend**. For the backend API, see [`../server/README.md`](../server/README.md). For the full project, see [`../README.md`](../README.md).

---

## 📚 Table of Contents

- [💻 Atlas Bank — Client](#-atlas-bank--client)
    - [React 19 + Vite frontend for the Atlas Bank digital banking platform](#react-19--vite-frontend-for-the-atlas-bank-digital-banking-platform)
  - [📚 Table of Contents](#-table-of-contents)
  - [🧭 Overview](#-overview)
  - [✨ Frontend Features](#-frontend-features)
  - [🗂️ Dashboard Pages](#️-dashboard-pages)
  - [📁 Folder Structure](#-folder-structure)
  - [🧭 Routing](#-routing)
  - [🧠 State Management](#-state-management)
  - [🔗 API Integration](#-api-integration)
  - [🪝 Hooks](#-hooks)
  - [🧩 Components](#-components)
  - [🎨 Styling](#-styling)
  - [📝 Markdown Support](#-markdown-support)
  - [📈 Charts](#-charts)
  - [🔐 Authentication \& Protected Routes](#-authentication--protected-routes)
  - [🚀 Installation](#-installation)
    - [Development](#development)
    - [Production Build](#production-build)
    - [Preview a Production Build Locally](#preview-a-production-build-locally)
    - [Lint](#lint)
  - [🔑 Environment Variables](#-environment-variables)
  - [☁️ Production Build \& Deployment](#️-production-build--deployment)
  - [✅ Best Practices](#-best-practices)
  - [📁 Folder Explanation (Quick Reference)](#-folder-explanation-quick-reference)
  - [⚡ Performance Optimizations](#-performance-optimizations)
  - [🐞 Known Issues](#-known-issues)
  - [🗺️ Future Improvements](#️-future-improvements)

---

## 🧭 Overview

The client is a **single-page application** built with **React 19** and bundled with **Vite 8**. It talks to the Express backend exclusively through a centralized Axios instance, uses **React Router 7** for navigation, and renders a full banking dashboard: wallet, accounts, transfers, transactions, analytics, cards, notifications, and an AI assistant.

Styling is handled with **Tailwind CSS 4** (via `@tailwindcss/vite`), with **Framer Motion** for transitions and **Lucide React** for icons.

---

## ✨ Frontend Features

- 🔐 Full auth UI: register, login, OTP verification, forgot/reset password
- 📊 Dashboard with real-time wallet balance
- 💸 Transfer money via wallet/UPI-style identifiers
- 📜 Transaction history with filtering
- 🏦 Multiple linked bank accounts management
- 💳 Cards page
- 🔔 Notifications center
- 🤖 AI Assistant chat interface (Markdown-rendered responses)
- 📈 Analytics view (Recharts-powered)
- 🙋 Help Center, Beneficiaries, Profile & Settings

---

## 🗂️ Dashboard Pages

| Page | File | Purpose |
|---|---|---|
| Dashboard | `pages/dashboard/Dashboard.jsx` | Landing overview: balance, quick actions |
| Wallet | `pages/dashboard/Wallet.jsx` | Wallet details, QR code |
| My Accounts | `pages/dashboard/MyAccounts.jsx` | Linked bank accounts CRUD |
| Transfer Money | `pages/dashboard/TransferMoney.jsx` | Send money to another wallet/UPI ID |
| Transactions | `pages/dashboard/Transactions.jsx` | Full ledger with history |
| Analytics | `pages/dashboard/Analytics.jsx` | Charts over spending/income |
| Cards | `pages/dashboard/Cards.jsx` | Card management UI |
| Notifications | `pages/dashboard/Notifications.jsx` | Alerts & activity feed |
| AI Assistant | `pages/dashboard/AIAssistant.jsx` | Chat with the banking assistant |
| Beneficiaries | `pages/dashboard/Beneficiaries.jsx` | Saved payees |
| Help Center | `pages/dashboard/HelpCenter.jsx` | Support/FAQ |
| Profile | `pages/dashboard/Profile.jsx` | User profile management |
| Settings | `pages/dashboard/Settings.jsx` | App/account settings |

---

## 📁 Folder Structure

```
client/
├── public/
├── src/
│   ├── api/
│   │   └── axios.js                 # Centralized Axios instance
│   ├── assets/                      # Images, logos
│   ├── components/
│   │   ├── auth/                    # AuthLayout, LoginForm, RegisterForm, PasswordInput
│   │   ├── common/                  # Button, Input, Loader, PageLoader, Spinner
│   │   ├── dashboard/                # DashboardLayout, Sidebar, Topbar, LogoutModal
│   │   └── ui/                      # Badge, Card, Modal, Toast, Skeleton, EmptyState...
│   ├── context/
│   │   └── AuthContext.jsx          # Global auth state provider
│   ├── data/
│   │   └── mockData.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useBankingData.js
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   └── MainLayout.jsx
│   ├── pages/
│   │   ├── Login.jsx / Register.jsx / Welcome.jsx / NotFound.jsx
│   │   ├── VerifyEmail.jsx / VerifyResetCode.jsx
│   │   ├── ForgotPassword.jsx / ResetPassword.jsx
│   │   └── dashboard/               # all dashboard pages (see table above)
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── PublicRoute.jsx
│   ├── services/                    # One file per API domain
│   │   ├── auth.service.js
│   │   ├── account.service.js
│   │   ├── wallet.service.js
│   │   ├── transaction.service.js
│   │   └── ai.service.js
│   ├── utils/
│   │   ├── analytics.js / transactions.js / validators.js / helpers.js / constants.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css / index.css
├── package.json
└── vite.config.js
```

---

## 🧭 Routing

Routing is centralized in `src/routes/AppRoutes.jsx` using **React Router 7**, split into:

- **Public routes** (`PublicRoute.jsx`) — Welcome, Login, Register, Forgot/Reset Password, Verify Email/Reset Code. Redirects an already-authenticated user away from these.
- **Protected routes** (`ProtectedRoute.jsx`) — everything under the dashboard. Redirects an unauthenticated user to `/login`.

Dashboard pages are nested under `DashboardLayout` (`components/dashboard/DashboardLayout.jsx`) which renders the shared `Sidebar` + `Topbar` shell.

---

## 🧠 State Management

State is kept intentionally simple — **no Redux/Zustand**:

- **`AuthContext`** (`context/AuthContext.jsx`) — the current user, tokens, and auth actions (login, logout, refresh), consumed via the `useAuth()` hook.
- **`useBankingData`** — a data-fetching hook for wallet/account/transaction data used across dashboard pages.
- Local component state (`useState`) for page-level UI state (forms, modals, loaders).

---

## 🔗 API Integration

All HTTP calls go through a single configured Axios instance in `src/api/axios.js`, which:

- Points at `VITE_API_BASE_URL`
- Attaches the JWT access token to the `Authorization` header
- Handles token refresh / logout on `401` responses

Each backend domain has a matching frontend service module (`services/*.service.js`) — pages call these services rather than calling Axios directly, keeping API shape changes isolated to one file per domain.

---

## 🪝 Hooks

| Hook | Purpose |
|---|---|
| `useAuth` | Access current user, login/logout/register actions, auth loading state |
| `useBankingData` | Fetch & cache wallet, account, and transaction data for dashboard pages |

---

## 🧩 Components

<details>
<summary><strong>Auth components</strong></summary>

`AuthLayout`, `LoginForm`, `RegisterForm`, `PasswordInput` — composable building blocks for every auth screen.

</details>

<details>
<summary><strong>Common components</strong></summary>

`Button`, `Input`, `Loader`, `PageLoader`, `Spinner` — shared primitives used across the app.

</details>

<details>
<summary><strong>Dashboard components</strong></summary>

`DashboardLayout`, `Sidebar`, `Topbar`, `LogoutModal` — the dashboard shell.

</details>

<details>
<summary><strong>UI components</strong></summary>

`Badge`, `Card`, `EmptyState`, `Modal`, `PageHeader`, `Skeleton`, `Toast` — a small internal design system used to keep dashboard pages visually consistent.

</details>

---

## 🎨 Styling

- **Tailwind CSS 4** via `@tailwindcss/vite` — utility-first, no separate config-heavy build step
- **Framer Motion** for page/element transitions
- **Lucide React** for a consistent icon set
- Global styles in `index.css` / `App.css`

---

## 📝 Markdown Support

The AI Assistant renders responses using **`react-markdown`** with the **`remark-gfm`** plugin, so the assistant can reply with GitHub-flavored Markdown — tables, lists, bold/italic, code blocks — instead of plain text.

---

## 📈 Charts

The **Analytics** page uses **Recharts** to visualize transaction/spending trends over time.

---

## 🔐 Authentication & Protected Routes

1. `AuthContext` holds the current user + tokens (populated after the OTP-verified login flow completes on the backend).
2. `ProtectedRoute` wraps every dashboard route; unauthenticated users are redirected to `/login`.
3. `PublicRoute` wraps auth screens; already-authenticated users are redirected to the dashboard.
4. The Axios instance attaches the access token automatically and triggers `/auth/refresh-token` on expiry.

---

## 🚀 Installation

```bash
cd client
npm install
```

### Development

```bash
npm run dev
```
Runs the Vite dev server, default: `http://localhost:5173`

### Production Build

```bash
npm run build
```
Outputs an optimized build to `client/dist`.

### Preview a Production Build Locally

```bash
npm run preview
```

### Lint

```bash
npm run lint
```
Uses `oxlint`.

---

## 🔑 Environment Variables

Create a `.env` file in `client/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

> [!TIP]
> Vite only exposes variables prefixed with `VITE_` to client-side code.

---

## ☁️ Production Build & Deployment

```bash
npm run build
```

Deploy the `dist/` folder to any static host:

| Platform | Notes |
|---|---|
| Vercel | Zero-config for Vite |
| Netlify | Set build command `npm run build`, publish dir `dist` |
| Static Nginx | Serve `dist/` directly, remember SPA fallback to `index.html` |

> [!WARNING]
> Since this is a client-side-routed SPA, your host must be configured to serve `index.html` for unknown paths (SPA fallback), or refreshing on `/dashboard/wallet` will 404.

---

## ✅ Best Practices

- Keep API calls inside `services/`, never call Axios directly from a page/component
- Co-locate page-specific UI state with `useState`; lift to context only when truly shared
- Prefer composing from `components/ui/` primitives over one-off styled markup
- Keep Tailwind class lists readable — extract repeated combinations into a component

---

## 📁 Folder Explanation (Quick Reference)

| Folder | Contains |
|---|---|
| `api/` | Axios instance config |
| `components/` | Reusable, presentation-focused UI |
| `context/` | App-wide React Context providers |
| `hooks/` | Custom React hooks |
| `layouts/` | Page shells (auth vs. main dashboard) |
| `pages/` | Route-level components |
| `routes/` | Router config + route guards |
| `services/` | One module per backend API domain |
| `utils/` | Pure helper functions, constants, validators |

---

## ⚡ Performance Optimizations

- Vite's native ESM dev server for fast HMR
- Route-level code organization enabling straightforward lazy-loading (`React.lazy`) if adopted
- Tailwind's JIT engine ships only the CSS actually used

---

## 🐞 Known Issues

- `App.dashboard-routes.example.jsx` is an example/reference file present in `src/` — not wired into the app; safe to ignore or remove
- No client-side automated tests yet

---

## 🗺️ Future Improvements

- [ ] Add `React.lazy` + `Suspense` route-level code splitting
- [ ] Add component/unit tests (Vitest + React Testing Library)
- [ ] Add a dark mode toggle
- [ ] Add form-level i18n / localization support
- [ ] PWA support for offline balance viewing

---

<div align="center">

⬅️ Back to [Project Root README](../README.md) · Backend docs: [`server/README.md`](../server/README.md)

</div>