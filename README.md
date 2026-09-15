<div align="center">

# ⚡ OrderFlow BD
### Intelligent F-Commerce Order Automation & AI Sales Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-Serverless-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Modern_Dark-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Meta Webhook](https://img.shields.io/badge/Meta-Messenger_&_WhatsApp-0084FF?style=for-the-badge&logo=messenger)](https://developers.facebook.com/)

<p align="center">
  <b>OrderFlow BD</b> is an enterprise-grade, high-performance order automation and conversational AI sales platform engineered specifically for Bangladeshi social commerce (F-Commerce & WhatsApp businesses). It bridges customer chat interactions directly into an automated ERP with live database synchronization, intelligent NLP validation, courier dispatching, and custom AI training.
</p>

[🌐 Live Production Website](https://web-six-omega-jwewpf4gd5.vercel.app) • [📖 Documentation](#-system-architecture) • [🚀 Quick Start](#-quick-start-guide)

</div>

---

## 🌟 Key Capabilities & Features

### 1. 🤖 Context-Aware Conversational AI (Google Gemini 1.5 Flash)
- **Natural Bangla & Banglish Understanding**: Automatically understands mixed Bangla/English customer messages (e.g. *"koydin lagbe delivery"*, *"charge koto"*, *"dam koto"*).
- **Post-Order Memory & Customer Context**: Intelligently identifies returning customers who already placed an order and answers order status/delivery timeline questions with their specific active order number (#OF-XXXX).
- **Intelligent Phone & Address Extractor**: Extracts and validates 11-digit Bangladeshi mobile numbers (013-019), alerting the customer with polite guidance if digits are missing (e.g. 9 or 10 digits).

### 2. 📊 Real-Time Order Management & Full-Width ERP
- **Edge-to-Edge Responsive UI**: Custom dark glassmorphism design optimized for wide screens, laptops, tablets, and smartphones.
- **Permanent Neon PostgreSQL Sync**: Orders created via Messenger, WhatsApp, or Manual Entry are persisted in PostgreSQL with zero delay.
- **Bulk Action & Confirmation**: Select multiple orders and confirm them in a single click.
- **One-Click Invoice Generator**: Print professional customer invoices and packing slips.
- **Excel/CSV Export**: Export filtered orders with UTF-8 BOM encoding for proper Bengali text rendering in Excel & Google Sheets.

### 3. 🧠 Merchant AI Knowledge Base & Custom Training Panel
- **No-Code FAQ Manager**: Add, edit, or delete custom store Q&A topics directly from the dashboard.
- **Policy Customizer**: Set inside/outside Dhaka delivery timelines, delivery fees (৳120 / ৳150), helpline phone numbers, and return/exchange policies.
- **Interactive Live Simulator**: Test and preview bot responses in real-time within the dashboard before deploying changes.

### 4. 🚚 Courier & Logistics Automation
- **Plug-and-Play Integrations**: Steadfast Courier and Pathao Courier APIs.
- **Instant Tracking Code Generation**: Generates consignment IDs and tracking URLs on booking.
- **Automated SMS & Messenger Notification**: Sends tracking codes to customers automatically upon dispatch.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Customer on Facebook Messenger / WhatsApp] -->|Webhook Event| B[Next.js Serverless Edge / Webhooks]
    B -->|Fetch Context & FAQ Knowledge| C[(Neon Serverless PostgreSQL)]
    B -->|Natural Language Reasoning| D[Google Gemini 1.5 Flash AI]
    B -->|Auto-Create Verified Order| C
    E[Merchant Dashboard / Web App] -->|Real-time Poll & Live Sync| C
    E -->|1-Click Courier Dispatch| F[Steadfast / Pathao Logistics API]
    E -->|Manage FAQs & System Prompt| C
```

---

## 📂 Repository Structure

```
OrderFlow BD/
├── apps/
│   ├── web/                     # Next.js 16 (App Router) Frontend & Webhook API
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx               # Main Dashboard with live metrics
│   │   │   │   ├── orders/page.tsx        # Real-time full-width Order Management
│   │   │   │   ├── bot-settings/page.tsx  # AI Training & Knowledge Base Manager
│   │   │   │   ├── api/orders/route.ts    # Serverless Orders CRUD API
│   │   │   │   ├── api/bot-config/route.ts# Serverless Bot Config & FAQ API
│   │   │   │   └── webhooks/facebook/     # Meta Messenger Webhook Handler
│   │   │   ├── components/                # Reusable UI & Modal components
│   │   │   └── lib/                       # Database, Types, and Helper utilities
│   │   └── package.json
│   │
│   └── api/                     # NestJS Backend & Prisma ORM Service
│       ├── prisma/
│       │   └── schema.prisma    # PostgreSQL Schema (Store, Customer, Order, etc.)
│       └── src/                 # Modular NestJS controllers and services
│
├── vercel.json                  # Monorepo Vercel Deployment Configuration
├── package.json                 # Root monorepo workspace scripts
└── README.md                    # Project Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm** or **pnpm**
- **Neon PostgreSQL Database** (or any PostgreSQL instance)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/alvinmonir411/orderflow_bd.git
cd orderflow_bd
npm install
npm --prefix apps/web install
npm --prefix apps/api install
```

### 2. Configure Environment Variables
Create `.env` in `apps/web/` and `apps/api/`:

```env
# Neon PostgreSQL Connection String
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Meta Facebook Messenger Setup
DEFAULT_FACEBOOK_PAGE_ID="1314475555081210"
DEFAULT_FACEBOOK_PAGE_TOKEN="YOUR_FACEBOOK_PAGE_ACCESS_TOKEN"
DEFAULT_FACEBOOK_VERIFY_TOKEN="orderflow_bd_verify_token"

# Google AI Studio (Gemini)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### 3. Push Database Schema
```bash
npx --prefix apps/api prisma db push
```

### 4. Run Locally
```bash
# Run Next.js Web Dashboard
npm run dev:web

# Run NestJS Backend (Optional)
npm run dev:api
```
- Open [http://localhost:3000](http://localhost:3000) to view the live dashboard.

---

## ⚙️ Meta (Facebook Messenger) Webhook Setup

1. Go to the [Meta for Developers Portal](https://developers.facebook.com/).
2. Select your App and navigate to **Messenger > Webhooks**.
3. Enter the webhook details:
   - **Callback URL**: `https://your-domain.vercel.app/webhooks/facebook`
   - **Verify Token**: `orderflow_bd_verify_token`
4. Subscribe to the following webhook fields:
   - `messages`
   - `messaging_postbacks`
5. Copy your **Page Access Token** and save it in the [Bot Settings](https://web-six-omega-jwewpf4gd5.vercel.app/bot-settings) page on your dashboard.

---

## 🛡️ Security & Reliability
- **Encrypted Environment Configuration**: All API keys and Database tokens are secured in serverless runtime environments.
- **UTF-8 Multi-Language Support**: Native support for Bengali (বাংলা) font encoding in both UI, database, CSV export, and PDF invoice printing.
- **Fail-Safe Fallback**: Automatic rule-based response fallback if AI external API rate limits or latency thresholds are encountered.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Developed with ❤️ for Bangladeshi F-Commerce Merchants.</sub>
</div>
