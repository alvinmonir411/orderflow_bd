<div align="center">

# ⚡ OrderFlow BD
### বাংলাদেশের F-Commerce মার্চেন্টদের জন্য AI-চালিত সেলস অটোমেশন প্ল্যাটফর্ম

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-Serverless-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br />

**OrderFlow BD** হলো বাংলাদেশের F-Commerce (Facebook Commerce) মার্চেন্টদের জন্য একটি production-ready SaaS প্ল্যাটফর্ম। Google Gemini AI দিয়ে চালিত এই সিস্টেম ২৪/৭ বাংলায় কাস্টমারের সাথে কথা বলে, অর্ডার নেয়, এবং ড্যাশবোর্ডে সব কিছু ম্যানেজ করে।

[🚀 লাইভ ডেমো](https://orderflowbd.vercel.app/demo/dashboard) • [🔐 প্রোডাকশন লগইন](https://orderflowbd.vercel.app/login) • [🐛 ইস্যু রিপোর্ট](https://github.com/alvinmonir411/orderflow_bd/issues)

</div>

---

## 🎯 কী কী করে এই সিস্টেম

### মূল ৩টি কাজ:

```
১. কাস্টমার Facebook Messenger-এ মেসেজ করে
        ↓
২. AI স্বয়ংক্রিয়ভাবে বাংলায় উত্তর দেয়, প্রোডাক্ট দেখায়, অর্ডার নেয়
        ↓
৩. মার্চেন্ট Dashboard-এ অর্ডার দেখা যায়, confirm করা যায়, invoice print করা যায়
```

---

## ✅ এখন যা কাজ করছে

| ফিচার | স্ট্যাটাস |
|---|---|
| Facebook Messenger AI Auto-Reply | ✅ সক্রিয় |
| বাংলা/Banglish ভাষা বোঝা | ✅ সক্রিয় |
| অর্ডার ম্যানেজমেন্ট Dashboard | ✅ সক্রিয় |
| প্রোডাক্ট ক্যাটালগ | ✅ সক্রিয় |
| 80mm Thermal Invoice PDF | ✅ সক্রিয় |
| CRM Inbox (Messages) | ✅ সক্রিয় |
| Multi-Tenant (একাধিক মার্চেন্ট) | ✅ সক্রিয় |
| Admin Panel | ✅ সক্রিয় |
| WhatsApp Integration | 🔜 শীঘ্রই আসছে |

---

## 💡 কেন দরকার — সমস্যাটা কী

বাংলাদেশের ৯৫% F-Commerce seller Facebook-এ বিক্রি করে। কিন্তু:

- রাত ১২টায় কাস্টমার মেসেজ করলে → কোনো reply নেই → sale miss
- একজন agent সর্বোচ্চ ৩০-৪০টা chat handle করতে পারে
- অর্ডার Excel-এ লিখলে হারিয়ে যায়, invoice বানাতে ঘণ্টা লাগে

**OrderFlow BD এর সমাধান:**

```
কাস্টমার:  "ভাই 42 size এর কালো শার্ট আছে? Cash on delivery হবে?"
AI Bot:     "জি ভাই! 42 size কালো শার্ট আছে, দাম ৮৫০ টাকা। 
             সারা বাংলাদেশে Cash on Delivery আছে।
             অর্ডার করতে আপনার নাম ও ঠিকানা দিন। 😊"
```

---

## 🌟 মূল ফিচার

### 1. 🤖 Google Gemini AI Sales Bot
- বাংলা, Banglish, মিশ্র ভাষা সব বোঝে
- প্রোডাক্ট দেখায়, দাম বলে, size গাইড করে
- Phone number ও address নিজে extract করে
- Fraud prevention — ভুয়া নম্বর চেনে

### 2. 💬 CRM Inbox (`/messages`)
- সব Messenger conversation এক জায়গায়
- Status: Open → Pending → Resolved → Closed
- Agent assignment, Internal notes
- Hot Lead, VIP, Complaint tag

### 3. 📦 Order Management (`/orders`)
- 8-stage order tracking
- Bulk order processing
- 80mm Thermal + A4 Invoice generator
- 1-click WhatsApp customer link

### 4. 🛍️ Product Catalog (`/products`)
- Product variants (size, color)
- Stock management
- Image upload (Cloudinary)

### 5. 👑 Multi-Tenant Admin (`/admin`)
- সব মার্চেন্টের oversight
- Approval workflow
- Merchant suspend/activate

### 6. 🎮 Live Demo Sandbox (`/demo`)
- Account ছাড়াই test করা যায়
- Mock data দিয়ে পুরো flow দেখা যায়

---

## 🏗️ Tech Stack

```
Frontend:   Next.js 14 + TypeScript + Tailwind CSS
Backend:    Next.js API Routes (Serverless)
Database:   Neon Serverless PostgreSQL
AI:         Google Gemini 2.5 Flash
Hosting:    Vercel
Images:     Cloudinary
Auth:       Custom HMAC-SHA256 Session (HttpOnly Cookie)
Webhook:    Meta Graph API (Facebook Messenger)
```

---

## 🚀 Local Development

### Prerequisites
- Node.js v20+
- Neon PostgreSQL account (free)
- Google Gemini API Key (free)
- Facebook Developer App (Facebook Page থাকলেই হবে)

### Setup

```bash
# 1. Clone
git clone https://github.com/alvinmonir411/orderflow_bd.git
cd orderflow_bd

# 2. Install
npm install

# 3. Environment
cp apps/web/.env.example apps/web/.env
# .env file-এ আপনার credentials দিন

# 4. Database setup
cd apps/web
node test-security.mjs

# 5. Run
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API Key |
| `DEFAULT_FACEBOOK_PAGE_TOKEN` | ✅ | Facebook Page Access Token |
| `DEFAULT_FACEBOOK_PAGE_ID` | ✅ | Facebook Page ID |
| `DEFAULT_FACEBOOK_VERIFY_TOKEN` | ✅ | Webhook verify token |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | ✅ | Facebook App ID |

---

## 🛡️ Security

- **PBKDF2 Password Hashing** — SHA-512, 10,000 iterations
- **HMAC-SHA256 Session Tokens** — Tamper-proof, HttpOnly cookies
- **Rate Limiting** — 5 failed logins → 5 min block
- **Tenant Isolation** — প্রতিটা query `organizationId` দিয়ে scoped

---

## 🗺️ Roadmap

- [x] **v1.0** — CRM Inbox, Manual Orders, Invoice Generator
- [x] **v1.5** — Multi-Tenant, Security, Facebook Webhook
- [x] **v2.0** — Google Gemini AI Sales Bot, Admin Panel, Demo Sandbox
- [x] **v2.1** — UI/UX Polish, Bot Settings, Product Catalog
- [ ] **v2.2** — WhatsApp Business Integration
- [ ] **v2.3** — Steadfast & Pathao Courier Auto-Booking
- [ ] **v2.4** — bKash/Nagad Payment Tracking
- [ ] **v2.5** — Mobile App (PWA)

---

## 📄 License

MIT License — Developed by **Alvin Monir**

For enterprise inquiries: [GitHub](https://github.com/alvinmonir411)
