# 🚀 OrderFlow BD — F-Commerce Order Automation System

Facebook Messenger ও WhatsApp দিয়ে পরিচালিত অনলাইন ব্যবসার জন্য সবচেয়ে দ্রুতগতির ও সহজ অর্ডার ম্যানেজমেন্ট, অটো চ্যাটবট এবং কুরিয়ার অটোমেশন প্ল্যাটফর্ম।

---

## 📦 প্রজেক্ট আর্কিটেকচার

- **Frontend:** [Next.js 16+ (App Router)](file:///c:/Users/Alvin%20Monir/Desktop/OrderFlow%20BD/apps/web) + Tailwind CSS + Lucide Icons + Sonner
- **Backend:** [NestJS (TypeScript)](file:///c:/Users/Alvin%20Monir/Desktop/OrderFlow%20BD/apps/api)
- **Database:** PostgreSQL on Neon DB (Serverless) + Prisma ORM
- **Integrations:**
  - Meta (Facebook Messenger & WhatsApp Cloud API Webhook)
  - Steadfast Courier & Pathao API (Plug-and-play)
  - Bangladeshi SMS Gateways (Greenweb / BulkSMSBD)

---

## ⚡ দ্রুত শুরু করার নিয়ম (Quick Start)

### ১. ডেটাবেস কানেকশন (Neon DB)
[apps/api/.env](file:///c:/Users/Alvin%20Monir/Desktop/OrderFlow%20BD/apps/api/.env) ফাইলে আপনার Neon PostgreSQL কানেকশন স্ট্রিং দিন:
```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

ডেটাবেস টেবিল তৈরি করতে রান করুন:
```bash
npx --prefix apps/api prisma db push
```

---

### ২. ব্যাকএন্ড ও ফ্রন্টএন্ড রান করা

#### ব্যাকএন্ড চালু করতে:
```bash
npm run dev:api
```
*(API চালু হবে: `http://localhost:4000`)*

#### ফ্রন্টএন্ড ড্যাশবোর্ড চালু করতে:
```bash
npm run dev:web
```
*(ড্যাশবোর্ড ওপেন করুন: `http://localhost:3000`)*

---

## 🤖 ফেসবুক মেসেঞ্জার বট কানেকশন

1. [developers.facebook.com](https://developers.facebook.com) এ একটি Meta App তৈরি করুন।
2. **Messenger Webhook** সেটআপে নিচের তথ্য দিন:
   - **Callback URL:** `https://your-domain.com/webhooks/facebook`
   - **Verify Token:** `orderflow_bd_verify_token`
   - **Subscription Fields:** `messages`, `messaging_postbacks`
3. আপনার Facebook Page Access Token টি ড্যাশবোর্ডের **মেসেঞ্জার ও চ্যাটবট** পেজে পেস্ট করে সেভ করুন।

---

## 🚚 কুরিয়ার অটোমেশন (Steadfast & Pathao)

- ড্যাশবোর্ডের **কুরিয়ার ও এসএমএস** পেজে গিয়ে Steadfast API Key এবং Secret Key দিন।
- অর্ডারের পাশে **[Steadfast বুকিং]** বাটন চাপলেই স্বয়ংক্রিয়ভাবে পার্সেল এন্ট্রি হবে এবং ট্র্যাকিং কোড তৈরি হবে।
