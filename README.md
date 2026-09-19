<div align="center">

# ⚡ OrderFlow BD (SaaS 2.0)
### Enterprise AI Sales Automation, Omnichannel Social CRM & Autonomous F-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5_(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-Serverless_ACID-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash_AI-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4_Modern_Dark-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Meta Graph API](https://img.shields.io/badge/Meta_Webhook-Messenger_&_WhatsApp-0084FF?style=for-the-badge&logo=messenger)](https://developers.facebook.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br />

**OrderFlow BD** is a production-ready, multi-tenant B2B SaaS platform engineered specifically for social commerce (F-Commerce) and e-commerce merchants in Bangladesh. Powered by **Google Gemini Generative AI**, it replaces rigid, outdated template bots with an intelligent virtual sales closer that engages leads in natural Bengali/Banglish 24/7, verifies customer credentials, generates orders, and streamlines fulfillment with instant printable invoices.

[Live Demo Preview](https://orderflowbd.vercel.app/demo/dashboard) • [Production Portal](https://orderflowbd.vercel.app/login) • [Report Issue](https://github.com/alvinmonir411/orderflow_bd/issues)

</div>

---

## 📌 Table of Contents
1. [The Paradigm Shift: AI Closer vs. Legacy Bots](#-the-paradigm-shift-ai-closer-vs-legacy-bots)
2. [Core Product Modules](#-core-product-modules)
3. [System Architecture & Data Isolation](#-system-architecture--data-isolation)
4. [Database Entity Relationship Model](#-database-entity-relationship-model)
5. [Order Fulfillment & Invoicing Pipeline](#-order-fulfillment--invoicing-pipeline)
6. [Security & Authentication Hardening](#-security--authentication-hardening)
7. [Getting Started & Local Development](#-getting-started--local-development)
8. [Environment Configuration Reference](#-environment-configuration-reference)
9. [Automated Security Verification](#-automated-security-verification)
10. [Roadmap & Vision](#-roadmap--vision)

---

## 💡 The Paradigm Shift: AI Closer vs. Legacy Bots

Most F-Commerce businesses waste 40–60% of their Facebook & Instagram Ad spend because leads arrive when human agents are asleep or overwhelmed. Traditional chatbots (e.g., ManyChat or static rule-based tree bots) fail because Bangladeshi buyers demand flexible, human-like reassurance.

```
[Ad Click / Lead] ──▶ [Traditional Tree Bot] ──▶ "Please select button 1, 2, or 3" ──▶ Lead Drops Off ❌
[Ad Click / Lead] ──▶ [OrderFlow Gemini AI]   ──▶ Natural Bengali Dialog + HD Showcase ──▶ Confirmed Order (COD) ✅
```

| Feature / Metric | Legacy Template Bots (ManyChat / Rules) | OrderFlow BD (Generative AI Closer) |
| :--- | :--- | :--- |
| **Conversational Fluency** | Strict buttons & rigid keyword matching | Fluent, empathetic Bengali & Banglish understanding |
| **Objection Handling** | Fails or sends generic "Agent is away" | Explains fabric quality, sizing guidance, COD safety |
| **Visual Sales Showcase** | Static single cards | Dynamically renders 1:1 HD variants from live database |
| **Fraud & Number Shield** | Accepts arbitrary text inputs | Regex parses & validates 11-digit BD numbers (013–019) |
| **Order Management & Invoicing** | Manual notebooks & lost chat receipts | Centralized 8-stage Kanban & instant 80mm thermal cash memos |
| **Availability & Uptime** | Requires human takeover for non-standard queries | **24/7/365 autonomous closing** with zero latency (~450ms) |

---

## 🌟 Core Product Modules

### 1. 🤖 Google Gemini AI Conversational Sales Engine
- **Bengali-First Language Processing**: Understands colloquial terms (*"apnader ki cash on delivery ache?"*, *"dhakay koto din lagbe?"*, *"42 size hobe?"*).
- **Automated Catalog Showcasing**: Automatically displays real product photos, available variants, price breakdown, and stock counters.
- **Anti-Chit-Chat Quota Guard**: Deflects irrelevant spam/small-talk after 2 messages, steering conversations back to products or forwarding to helpline (`01700000000`).
- **Autonomous Order Extraction**: Detects verified phone numbers, recipient names, and delivery addresses directly from chat text without requiring external forms.

### 2. 💬 3-Column Enterprise CRM Inbox (`/messages`)
- **Status Lifecycle Pipeline**: Transitions conversations seamlessly through `🟢 Open`, `⏳ Pending`, `✅ Resolved`, and `🔒 Closed`.
- **Agent Assignment Matrix**: Assign conversations to individual support staff or leave in the general pool.
- **Custom Categorization Tags**: Real-time tags (`🔥 Hot Lead`, `💎 VIP`, `⏰ Follow Up`, `🛍️ Interested`, `⚠️ Complaint`, `🚚 High Value`).
- **Internal Private Notes**: Team-only internal communication channel that is invisible to customers.
- **Customer Audit Timeline**: Chronological trail of status transitions, tags, assignments, and invoice generation events.

### 3. 📦 Autonomous Order Management & POS Billing (`/orders`)
- **Real-Time Kanban & Table**: Live order status tracking across 8 distinct states (`PENDING_CONFIRMATION`, `CONFIRMED`, `PROCESSING`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`, `RETURNED`).
- **80mm Thermal & A4 Invoice Generator**: Instant printable cash memos with QR/Barcode, store logo, customer details, delivery charge, and COD totals.
- **1-Click WhatsApp Quick Link**: Instant direct WhatsApp link (`wa.me/8801...`) with pre-filled order status updates.

### 4. 👑 Multi-Tenant Master Control & Merchant Approval (`/admin`)
- **Platform Owner Master Panel**: Complete oversight of all registered organizations, active stores, order volumes, and platform metrics.
- **Approval Gating Workflow**: New merchant registrations are placed into `PENDING` status until the Super Admin reviews their verification and payment details.
- **Merchant Suspension Guard**: Instant 1-click ability to suspend fraudulent or non-compliant merchant accounts.

### 5. 🎮 Zero-Friction 1-Click Interactive Demo Sandbox (`/demo`)
- **Public Sandbox Preview**: Dedicated `/demo` and `/demo/dashboard` environment with pre-loaded mock analytics, AreaCharts, courier balances, and order histories.
- **Interactive Live Bot Simulator**: Visitors can test-drive natural conversational sales with sample queries and simulated order placement without database dependency.

---

## 🏗️ System Architecture & Data Isolation

```
                                 [External Traffic]
                                          │
            ┌─────────────────────────────┴─────────────────────────────┐
            ▼                                                           ▼
    [Public Webhook Traffic]                                    [Dashboard User / Admin]
  Meta Webhook (Messenger/WhatsApp)                                      │
            │                                                 [Session & RBAC Guard]
            ▼                                                (HMAC-SHA256 Cookie Token)
 [Tenant Ingestion Gateway]                                              │
(Resolve Page Token / Org ID)                                            ▼
            │                                              [Tenant Isolation Boundary]
            ├───────────────────────────────────────────────┤ (WHERE "organizationId" = ?)
            ▼                                               ▼
  [Gemini AI Sales Engine]                             [Next.js Server Actions / API]
  - Natural Bengali NLU                                ├── CRM Inbox & Notes
  - Product Catalog Lookup                             ├── Order Lifecycle Manager
  - Auto-Extraction (Phone/Address)                    └── Fulfillment & Invoicing
            │                                               │
            └───────────────────────┬───────────────────────┘
                                    ▼
                     [Neon Serverless PostgreSQL]
                      ACID Multi-Tenant Database
```

---

## 🗄️ Database Entity Relationship Model

The database is built on top of **Neon Serverless PostgreSQL** with strict relational integrity and tenant isolation:

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER : "has members"
    ORGANIZATION ||--o{ STORE : "operates"
    ORGANIZATION ||--o{ CHANNEL_CONNECTION : "connects"
    STORE ||--o{ PRODUCT : "catalogs"
    STORE ||--o{ ORDER : "fulfills"
    STORE ||--o{ CUSTOMER : "manages"
    CUSTOMER ||--o{ CONVERSATION : "participates"
    CONVERSATION ||--o{ MESSAGE : "contains"
    CONVERSATION ||--o{ INTERNAL_NOTE : "annotates"
    CONVERSATION ||--o{ ACTIVITY_TIMELINE : "logs"
    ORDER ||--o{ ORDER_ITEM : "includes"
    PRODUCT ||--o{ PRODUCT_VARIANT : "features"

    ORGANIZATION {
        string id PK
        string name
        string plan
        string status "PENDING | ACTIVE | SUSPENDED"
        string ownerPhone
    }
    USER {
        string id PK
        string organizationId FK
        string email
        string passwordHash
        string role "SUPER_ADMIN | ADMIN | USER"
        boolean isActive
    }
    ORDER {
        string id PK
        string storeId FK
        string customerId FK
        int orderNumber
        string status
        decimal totalPrice
        string courierProvider "STEADFAST | PATHAO"
        string courierTrackingId
    }
```

---

## 📦 Order Fulfillment & Invoicing Pipeline

```
[Order Confirmed by AI] ──▶ [Dashboard Review & Processing] ──▶ [80mm Thermal Cash Memo Printed]
                                                                          │
                                                  ┌───────────────────────┴───────────────────────┐
                                                  ▼                                               ▼
                                         [Status Tracking]                               [1-Click Customer SMS/WhatsApp]
                                    (Confirmed / In-Transit)                              (Direct wa.me/8801... Link)
```

- **Live Order Status Tracking**: Real-time transitions across order states (`PENDING_CONFIRMATION`, `CONFIRMED`, `PROCESSING`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`, `RETURNED`).
- **80mm Thermal & A4 Invoice Generator**: Instant printable cash memos with QR/Barcode, store logo, customer details, delivery charge, and COD totals.
- **Direct WhatsApp Messaging**: 1-click WhatsApp customer link without needing to save phone numbers in contacts.

---

## 🛡️ Security & Authentication Hardening

1. **PBKDF2 Password Encryption**: Passwords salted and hashed with SHA-512 (10,000 iterations) stored in format `salt:hash`.
2. **Web Crypto HMAC-SHA256 Sessions**: Tamper-proof session tokens signed cryptographically via Edge-compatible Web Crypto API. Stored strictly in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
3. **Sliding-Window Rate Limiter**: In-memory IP + Email brute force protection blocking accounts after 5 failed attempts for 5 minutes (`429 Too Many Requests`).
4. **Tenant Isolation Enforcement**: No database query executes without explicit scoping to the authenticated user's `organizationId`. Cross-tenant record modifications return strict `404 Not Found`.

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` v10+
- **PostgreSQL Database**: Neon serverless database account (or local PostgreSQL 15+)
- **Google Gemini API Key**: Free tier or paid key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone Repository
```bash
git clone https://github.com/alvinmonir411/orderflow_bd.git
cd orderflow_bd
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in `apps/web/.env`:
```bash
cp apps/web/.env.example apps/web/.env
```
*(Fill in your actual database connection string and Gemini API key as described in the next section).*

### 4. Run Database Migrations
Initialize database tables and seed sample accounts:
```bash
cd apps/web
node test-security.mjs
```

### 5. Launch Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚙️ Environment Configuration Reference

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | Neon Serverless PostgreSQL connection string | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `AUTH_SECRET` | **Yes** | 32+ character HMAC-SHA256 signing secret | `your-enterprise-jwt-super-secret-key-2026` |
| `GEMINI_API_KEY` | **Yes** | Google Gemini Generative AI API Key | `AIzaSyB...` |
| `DEFAULT_FACEBOOK_PAGE_ID` | Optional | Primary Facebook Page ID for fallback webhook | `104829381293` |
| `DEFAULT_FACEBOOK_PAGE_TOKEN` | Optional | Page Access Token for Meta Graph API calls | `EAAO...` |
| `DEFAULT_FACEBOOK_VERIFY_TOKEN`| Optional | Meta Webhook subscription verification token | `orderflow_bd_verify_token` |

---

## 🧪 Automated Security Verification

OrderFlow BD includes an automated test suite verifying tenant isolation and permission boundaries:

```bash
cd apps/web
node test-security.mjs
```

### Verified Security Assertions:
```text
✔ [PASS] Cross-Tenant Read Blocked: Tenant A cannot inspect Tenant B conversations/notes.
✔ [PASS] Cross-Tenant Write Blocked: Tenant A cannot update or cancel Tenant B orders.
✔ [PASS] RBAC Boundary Enforced: Non-admin users cannot trigger team management mutations.
✔ [PASS] Unauthenticated Rejection: Expired or missing session cookies receive 401 Unauthorized.
✔ [PASS] Brute Force Rate Limiter: 5 failed login attempts return 429 Too Many Requests.
```

---

## 🗺️ Roadmap & Vision

- [x] **v1.0**: Core F-Commerce CRM Inbox, Manual Orders, 80mm Thermal Invoice Generator.
- [x] **v1.5**: Multi-Tenant Isolation, PBKDF2 Session Security, Facebook Messenger Webhooks.
- [x] **v2.0**: Google Gemini AI Natural Bengali Sales Engine, Super Admin Master Portal, Standalone Demo Sandbox.
- [ ] **v2.1**: Official WhatsApp Business Cloud API Direct Connection.
- [ ] **v2.2**: Automated Courier API Integrations (Steadfast & Pathao 1-Click Parcel Booking).
- [ ] **v2.3**: Multi-Channel Inventory Sync (Shopify, WooCommerce, Daraz API).
- [ ] **v2.4**: Automated Voice Call Confirmation Bot (Bengali IVR).

---

## 📄 License & Attribution

Distributed under the **MIT License**. See `LICENSE` for more information.

Developed with passion by **Alvin Monir** for the booming e-commerce & F-commerce merchant ecosystem of Bangladesh.  
For enterprise inquiries or partnerships, connect via [GitHub](https://github.com/alvinmonir411).
