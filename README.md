# ⚡ OrderFlow BD 2.0 — Multi-Tenant F-Commerce & Social CRM SaaS
### Enterprise AI Sales Automation, 3-Column CRM Inbox, Steadfast Logistics & Multi-Tenant Architecture

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-Serverless-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Modern_Dark-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Meta Webhook](https://img.shields.io/badge/Meta-Messenger_&_WhatsApp-0084FF?style=for-the-badge&logo=messenger)](https://developers.facebook.com/)

---

## 🚀 1-Click Quick Demo Credentials

You can test all 3 role perspectives directly from the `/login` page with 1-click demo chips:

| Role | Email | Password | Access Scope |
|------|-------|----------|--------------|
| 👑 **Super Admin** | `superadmin@orderflow.com` | `admin123` | Platform-level access, cross-org overview |
| 💼 **Store Owner / Merchant** | `owner@orderflow.com` | `admin123` | Full Organization Admin, Team Management, Settings |
| 💬 **Live Chat Specialist** | `agent@orderflow.com` | `agent123` | Inbox CRM, Order Status, Reply & Notes (No settings/team mutations) |

---

## 🌟 Key Architecture & Capabilities

### 1. 🏢 Multi-Tenant SaaS & Data Isolation
- **Tenant Hierarchy**: `organizationId` $\rightarrow$ `Store` $\rightarrow$ `Customer` $\rightarrow$ `Conversation` $\rightarrow$ `Message` $\rightarrow$ `Order`.
- **Zero Cross-Tenant Leakage**: All SQL queries and API endpoints resolve `user.organizationId` and strictly filter records (`WHERE "organizationId" = ${user.organizationId}`).
- **Decoupled Channel Connections (`ChannelConnection`)**: Page access tokens are stored in a dedicated multi-page table, allowing each business to connect multiple Facebook Pages or expand to WhatsApp and Instagram.

### 2. 🛡️ Hardened Password & Session Security
- **PBKDF2 Salted Hashing**: Passwords stored as salted PBKDF2 (`salt:hash`) with SHA-512.
- **HMAC-SHA256 Signed Sessions**: Cryptographic session tokens stored in secure `HttpOnly`, `SameSite=Lax` cookies.
- **Brute-Force Rate Limiting**: In-memory sliding window rate limiter (max 5 failed login attempts per 5 minutes per IP/email) returning `429 Too Many Requests`.
- **RBAC Guards**: `requireAuth(req)` and `requireAdmin(req)` helper guards returning `401 Unauthorized` and `403 Forbidden`.

### 3. 💬 3-Column Advanced CRM Inbox (`/messages`)
- **Status Pipeline**: `🟢 Open`, `⏳ Pending`, `✅ Resolved`, `🔒 Closed` with real-time lifecycle transitions.
- **Team Assignment**: Assign any conversation to specific agents (`Alvin Monir`, `Rahim Ahmed`, `Fatima Rahman`) or leave as `Unassigned`.
- **Normalized Tags**: Organization-scoped custom tags (`🔥 Hot Lead`, `💎 VIP`, `⏰ Follow Up`, `🛍️ Interested`, `⚠️ Complaint`, `🚚 High Value`).
- **Private Internal Notes**: Agent-only internal discussion tab that is never sent to the customer.
- **Customer Activity Timeline**: Chronological log of assignments, status changes, notes, and order creation.

### 4. 🤖 Google Gemini AI Conversational Sales Agent
- **Natural Bengali & Banglish Understanding**: Answers queries regarding product details, sizing, pricing, delivery charges, and store policies.
- **Anti-Chit-Chat Quota Protection**: Intelligently deflects small talk after 2 messages by redirecting to helpline (`01700000000`).
- **Auto Order Extraction**: Automatically parses 11-digit Bangladeshi phone numbers (013-019), delivery addresses, and chosen variants into confirmed database orders.

### 5. 🚚 Courier & Logistics Automation
- **Steadfast & Pathao Courier**: 1-click parcel entry and tracking code generation (`Consignment ID` + `Tracking Code`).
- **Printable Invoices**: Instant printable thermal packing slips and customer invoices.

---

## 🏗️ System Flow & Tenancy Architecture

```text
User / Request
     ↓
Authentication Guard (verifySessionToken / requireAuth)
     ↓
Resolve organizationId
     ↓
┌────────────────────────────────────────────────────────┐
│ Tenant Sandbox (organizationId)                       │
│  ├── ChannelConnection (Facebook Pages / WhatsApp)    │
│  ├── Store & Products Catalog                         │
│  ├── Customers & Unified Contacts                     │
│  ├── Conversations, Internal Notes & Activity Timeline│
│  └── Orders, Invoices & Courier Tracking              │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Local Setup Guide

### 1. Clone & Install
```bash
git clone https://github.com/alvinmonir411/orderflow_bd.git
cd orderflow_bd
npm install
```

### 2. Configure Environment Variables
Create `.env` in `apps/web/.env`:
```env
# Database
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-billowing-shadow-a5svvtgn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Auth Secrets
AUTH_SECRET="orderflow_bd_saas_enterprise_jwt_super_secret_key_2026"

# Meta Graph API & Webhook Tokens
DEFAULT_FACEBOOK_PAGE_TOKEN="YOUR_PAGE_ACCESS_TOKEN"
DEFAULT_FACEBOOK_PAGE_ID="YOUR_PAGE_ID"
DEFAULT_FACEBOOK_VERIFY_TOKEN="orderflow_bd_verify_token"

# Google Gemini API
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Security Verification Test

To run the automated 4-point security and tenant isolation verification suite:
```bash
cd apps/web
node test-security.mjs
```

### Verification Assertions:
1. ✅ **User A cannot read Organization B conversation / notes** (Zero cross-tenant leakage).
2. ✅ **User A cannot modify Organization B order** (Cross-tenant modification blocked with 404).
3. ✅ **User without ADMIN permission cannot call team mutation API** (Blocked with 403 Forbidden).
4. ✅ **Expired/invalid session cannot access protected API** (Blocked with 401 Unauthorized).

---

## 📂 Project Directory Structure

```
OrderFlow BD/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx                 # SaaS Landing Page with Feature Demos
│   │   │   │   ├── login/page.tsx           # Authentication & 1-Click Demo Login
│   │   │   │   ├── register/page.tsx        # Organization & Store Onboarding
│   │   │   │   ├── dashboard/page.tsx       # Live Analytics & Summary Metrics
│   │   │   │   ├── messages/page.tsx        # 3-Column Advanced CRM Inbox
│   │   │   │   ├── orders/page.tsx          # Real-Time Order Management Table
│   │   │   │   ├── team/page.tsx            # Team Members & Role RBAC Management
│   │   │   │   ├── products/page.tsx        # Product & Stock Catalog
│   │   │   │   ├── bot-settings/page.tsx    # Gemini AI Training & Store Policies
│   │   │   │   ├── integrations/page.tsx    # Facebook Multi-Page & Courier APIs
│   │   │   │   ├── api/auth/                # Login, Register, Logout & Demo Session
│   │   │   │   ├── api/team/                # Team List, Invite, Role Update & Delete
│   │   │   │   ├── api/conversation/        # CRM Assignment, Status, Tags & Notes
│   │   │   │   ├── api/orders/              # Tenant-Aware Order CRUD
│   │   │   │   ├── api/send-message/        # Direct Messenger/WhatsApp API
│   │   │   │   └── webhooks/facebook/       # Live Messenger Webhook & AI Engine
│   │   │   ├── components/                  # Sidebar, Navbar, DirectMessageModal, etc.
│   │   │   └── lib/
│   │   │       ├── auth.ts                  # PBKDF2, HMAC Sessions, RBAC Guards & Rate Limiter
│   │   │       ├── db.ts                    # Neon DB Client, Normalized Tables & Queries
│   │   │       └── types.ts                 # SaaS TypeScript Interfaces & Enums
│   │   ├── test-security.mjs                # Automated Tenant Security Test Suite
│   │   └── package.json
└── README.md
```

---

## 🛡️ License
This project is licensed under the MIT License.
Crafted for Bangladeshi F-Commerce, Social Commerce & E-Commerce Merchants.
