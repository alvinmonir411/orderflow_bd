<div align="center">

# ⚡ OrderFlow BD 2.0
### Smart Bangladeshi F-Commerce & Social Commerce Automation Platform
**Facebook Messenger & WhatsApp AI Sales Agent • Live Neon PostgreSQL Sync • Direct Customer Messaging • Courier Logistics**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-Serverless-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Modern_Dark-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Meta Webhook](https://img.shields.io/badge/Meta-Messenger_&_WhatsApp-0084FF?style=for-the-badge&logo=messenger)](https://developers.facebook.com/)
[![Vercel Live](https://img.shields.io/badge/Deployment-Vercel_Production-000000?style=for-the-badge&logo=vercel)](https://orderflowbd.vercel.app)

<p align="center">
  <b>OrderFlow BD</b> is an enterprise-grade social commerce ERP and conversational AI sales platform engineered specifically for Bangladeshi businesses. It turns Facebook Messenger and WhatsApp conversations into automated orders with live database synchronization, anti-chit-chat quota protection, direct dashboard-to-customer messaging, and 1-click courier dispatching.
</p>

[🌐 Live Production Website](https://orderflowbd.vercel.app) • [📖 Features](#-key-features) • [🚀 Local Setup Guide](#-local-setup-guide) • [⚙️ Environment Variables](#-environment-variables-env)

</div>

---

## 🌟 Key Features

### 1. 🤖 Google Gemini AI Conversational Sales Agent
- **Natural Bengali & Banglish Understanding**: Autonomously answers queries regarding product details, sizing, pricing, delivery charges (Dhaka ৳120 / Outside ৳150), and store policies in natural, warm Bengali.
- **Anti-Chit-Chat Quota Protection**: Intelligently deflects random small talk and non-business queries after 2 messages by politely redirecting customers to the store helpline (`01700000000`) without consuming expensive AI API tokens.
- **Auto Order Extraction**: Automatically parses 11-digit Bangladeshi phone numbers (013-019), delivery addresses, and chosen variants, creating confirmed orders directly in the database.
- **Smart Model Fallback**: Prioritizes `gemini-3.6-flash` and `gemini-3.5-flash` with graceful failover.

### 2. 💬 Direct Messenger & WhatsApp Customer Messaging
- **Send Custom Messages from Dashboard**: Send real-time messages to any customer directly from the OrderFlow BD table without opening Facebook.
- **1-Click Quick Templates**: Send instant order confirmation, tracking updates, and follow-up templates with a single click.
- **Meta Business Suite Jump Link**: Direct 1-click button to open the exact conversation thread in Meta Business Suite Inbox (`https://business.facebook.com/latest/inbox/messenger...`).
- **Live Transcript & Profile Viewer**: View real customer Facebook profile pictures, display names, and live message history.

### 3. 📦 Product & Live Inventory Management
- **Catalog Management**: Add, update, and monitor product stock and size variants (`Size: M, L, XL`).
- **Real-Time AI Knowledge**: Gemini AI automatically accesses the latest product prices and stock availability when chatting with buyers.

### 4. 🚚 Courier & Logistics Automation
- **Steadfast & Pathao Courier**: 1-click parcel entry and tracking code generation.
- **Automated SMS Notifications**: Send tracking SMS to customers upon order dispatch.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Customer on Messenger / WhatsApp] -->|Webhook Event| B[Next.js Serverless API Route]
    B -->|Fetch Catalog, Policy & Session| C[(Neon PostgreSQL Serverless)]
    B -->|Contextual Reasoning & NLP| D[Google Gemini 3.6 Flash AI]
    B -->|Auto-Create Order| C
    E[Merchant Dashboard] -->|Real-Time Sync| C
    E -->|Direct Message API| F[Meta Graph API v20.0]
    E -->|1-Click Courier Dispatch| G[Steadfast / Pathao API]
```

---

## 🚀 Local Setup Guide

Follow these steps to set up and run OrderFlow BD on your local computer or laptop:

### 1. Clone the Repository
```bash
git clone https://github.com/alvinmonir411/orderflow_bd.git
cd orderflow_bd
npm install
```

### 2. Configure Environment Variables
Create a file named `.env` in `apps/web/`:

**File Path: `apps/web/.env`**
```env
# Neon PostgreSQL Database Connection
DATABASE_URL="postgresql://neondb_owner:npg_fVreJN50Kauw@ep-billowing-shadow-a5svvtgn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Meta Webhook Verification Token
DEFAULT_FACEBOOK_VERIFY_TOKEN="orderflow_bd_verify_token"

# Live App URL
NEXT_PUBLIC_APP_URL="https://orderflowbd.vercel.app"
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Meta (Facebook & WhatsApp) Webhook Configuration

### Facebook Messenger:
1. Go to [Meta for Developers](https://developers.facebook.com/) ➡️ Your App ➡️ **Messenger > Webhooks**.
2. **Callback URL**: `https://orderflowbd.vercel.app/webhooks/facebook`
3. **Verify Token**: `orderflow_bd_verify_token`
4. Subscribe to `messages` and `messaging_postbacks`.

### WhatsApp Cloud API:
1. Go to [Meta for Developers](https://developers.facebook.com/) ➡️ Your WhatsApp Business App ➡️ **WhatsApp > Configuration**.
2. **Callback URL**: `https://orderflowbd.vercel.app/webhooks/whatsapp`
3. **Verify Token**: `orderflow_bd_verify_token`
4. Subscribe to `messages`.

---

## 📂 Project Structure

```
OrderFlow BD/
├── apps/
│   ├── web/                         # Next.js 16 (App Router) Frontend & Webhook API
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx                 # Main Analytics & Orders Dashboard
│   │   │   │   ├── orders/page.tsx          # Real-Time Order Management Table
│   │   │   │   ├── products/page.tsx        # Product & Stock Management
│   │   │   │   ├── bot-settings/page.tsx    # Gemini AI Training & API Settings
│   │   │   │   ├── integrations/page.tsx    # Courier (Steadfast/Pathao) & SMS
│   │   │   │   ├── api/send-message/        # Meta Graph API Direct Messaging
│   │   │   │   ├── api/conversation/        # Live Messenger Transcript & Profile
│   │   │   │   ├── webhooks/facebook/       # Messenger Webhook & Gemini Bot Engine
│   │   │   │   └── webhooks/whatsapp/       # WhatsApp Cloud API Webhook
│   │   │   ├── components/orders/           # DirectMessageModal, Invoice, etc.
│   │   │   └── lib/                         # Neon DB Client, Types & Utilities
│   │   └── .env.example
│   └── api/                         # NestJS Backend API & Prisma Schema
├── vercel.json                      # Vercel Deployment Configuration
├── package.json                     # Root Workspace Scripts
└── README.md                        # Documentation
```

---

## 🛡️ License
This project is licensed under the MIT License.

<div align="center">
  <sub>Crafted with ❤️ for Bangladeshi E-Commerce & F-Commerce Merchants.</sub>
</div>
