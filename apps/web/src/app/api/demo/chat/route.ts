import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEMO_PRODUCTS = [
  { id: 'p-1', title: 'প্রিমিয়াম কাশ্মীরি কুর্তি', price: 850, category: 'কুর্তি', sizes: 'M, L, XL' },
  { id: 'p-2', title: 'জয়পুরি কটন আনস্টিচড থ্রি-পিস', price: 1250, category: 'থ্রি-পিস', sizes: 'Free Size (Unstitched)' },
  { id: 'p-3', title: 'ডিজাইনার পার্টি গাউন', price: 1500, category: 'গাউন', sizes: 'M, L, XL' },
  { id: 'p-4', title: 'গর্জিয়াস ভেলভেট পার্টি গাউন (কালো)', price: 1850, category: 'গাউন', sizes: 'M, L, XL' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;
    const text = (message || '').trim();

    if (!text) {
      return NextResponse.json({ reply: 'অনুগ্রহ করে কিছু লিখে পাঠান।' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';

    // 1. Try Google AI Studio (Gemini)
    if (apiKey && apiKey.length > 10) {
      try {
        const systemPrompt = `You are the official Bangladeshi F-Commerce AI sales representative for "Moner Kotha Fashion".
Your name is "Moner Kotha Fashion AI সেলস বট" (Moner Kotha Fashion Official AI Sales Assistant).
If the customer asks who you are, what your name is ("name ki", "tomar nam ki", "who are you", "tumi ke", "apnar nam ki"), always proudly and politely introduce yourself as the official AI Sales Assistant of "Moner Kotha Fashion".
Catalog:
1. প্রিমিয়াম কাশ্মীরি কুর্তি - ৳৮৫০ (সাইজ: M, L, XL)
2. জয়পুরি কটন আনস্টিচড থ্রি-পিস - ৳১২৫০ (১০০% পিওর কটন, সেলাইবিহীন)
3. ডিজাইনার পার্টি গাউন - ৳১৫০০ (সাইজ: M, L, XL)
4. গর্জিয়াস ভেলভেট পার্টি গাউন (কালো) - ৳১৮৫০ (সাইজ: M, L, XL)

Delivery Policy:
- ডেলিভারি চার্জ: ঢাকায় ৳৭০, ঢাকার বাইরে ৳১২০।
- ক্যাশ অন ডেলিভারি (কোনো অগ্রিম নেই)। পণ্য চেক করে নেওয়ার সুবিধা আছে।
- ডেলিভারি সময়: ঢাকায় ২৪-৪৮ ঘণ্টা, বাইরে ২-৩ দিন।

Rules:
- Understand both Bengali and Banglish (e.g. "koto", "kiki product ache", "aita ki khub valo", "dam koto", "size ache", "order korbo", "name ki", "tomar nam ki").
- Always reply in warm, natural Bengali with polite emojis. Keep answers concise (2-3 sentences max).
- If customer asks what products are available ("kiki product ache", "collection"), list the dresses with prices.
- If customer asks price ("koto", "dam"), quote accurate prices from catalog.
- If customer asks quality ("aita ki khub valo"), praise the fabric quality and explain the 100% cotton/silk guarantee and checking facility.
- If customer wants to order ("order korbo", "confrim"), ask for Name, 11-digit Phone, and Delivery Address.
- If customer gives phone & address, congratulate them and confirm the order warmly!`;

        const contents: any[] = [];
        // Include previous context
        const past = history.slice(-6);
        for (const h of past) {
          contents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nCustomer: "${text}"` }],
        });

        const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];
        for (const model of models) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
            const gRes = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents,
                generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
              }),
            });
            const gData = await gRes.json();
            const reply = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              return NextResponse.json({
                success: true,
                reply: reply.replace(/JSON_START[\s\S]*?JSON_END/g, '').trim(),
                source: 'gemini',
              });
            }
          } catch (_) {}
        }
      } catch (geminiErr) {
        console.warn('[Demo Gemini API Error, using NLP fallback]:', geminiErr);
      }
    }

    // 2. Intelligent Bangladeshi NLP Fallback (handles Bengali + Banglish smoothly)
    const lower = text.toLowerCase();

    // Bot Name / Identity queries ("name ki", "tomar nam ki", "who are you", "tumi ke", "আপনার নাম কি")
    if (
      lower.includes('name ki') ||
      lower.includes('nam ki') ||
      lower.includes('tomar nam') ||
      lower.includes('tomar name') ||
      lower.includes('apnar nam') ||
      lower.includes('apnar name') ||
      lower.includes('who are you') ||
      lower.includes('tumi ke') ||
      lower.includes('tumi kar') ||
      lower.includes('apni ke') ||
      lower.includes('নাম কি') ||
      lower.includes('তোমার নাম') ||
      lower.includes('আপনার নাম') ||
      lower.includes('তুমি কে') ||
      lower.includes('আপনি কে') ||
      lower.includes('বট এর নাম') ||
      lower.includes('বটের নাম')
    ) {
      return NextResponse.json({
        success: true,
        reply: `আসসালামু আলাইকুম! আমি **Moner Kotha Fashion**-এর অফিসিয়াল AI সেলস অ্যাসিস্ট্যান্ট (AI Sales Bot) 🌸\n\nআমি ২৪ ঘণ্টা আমাদের শপের সম্মানিত কাস্টমারদের যেকোনো ড্রেসের সাইজ, দাম ও কালেকশন সম্পর্কে তথ্য জানাতে এবং সরাসরি হোম ডেলিভারি অর্ডার নিতে কাজ করি।\n\nআজকে আপনাকে কোন চমৎকার কালেকশনটি দেখাতে পারি? 😊`,
        quickReplies: ['আজকের কালেকশন দেখতে চাই', 'থ্রি-পিসের দাম কত?', 'ডেলিভারি চার্জ কত?'],
        source: 'nlp',
      });
    }

    // Check Phone number provided -> Order Confirmation
    const phoneMatch = text.match(/01[3-9]\d{8}/);
    if (phoneMatch) {
      const extractedName = text.split(/[,।\n]/)[0]?.replace(/01[3-9]\d{8}/, '').trim();
      const customerName = (extractedName && extractedName.length > 2 && extractedName.length < 30) ? extractedName : 'সম্মানিত কাস্টমার';
      const addressParts = text.split(/[,।\n]/).slice(1).join(', ').trim();
      const deliveryAddress = addressParts.length > 5 ? addressParts : (text.includes('ঢাকা') || text.includes('dhaka')) ? 'ধানমন্ডি, ঢাকা' : 'মিরপুর-১০, ঢাকা';

      return NextResponse.json({
        success: true,
        reply: `🎉 আলহামদুলিল্লাহ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।\n\n📦 অর্ডার নম্বর: #OF-8942\n👗 প্রোডাক্ট: জয়পুরি কটন আনস্টিচড থ্রি-পিস\n📞 মোবাইল: ${phoneMatch[0]}\n💰 মোট বিল: ৳১৩২০ (হোম ডেলিভারি চার্জ সহ, ১০০% ক্যাশ অন ডেলিভারি)\n🚚 আগামী ২৪-৪৮ ঘণ্টার মধ্যে পার্সেলটি আপনার ঠিকানায় পৌঁছে যাবে।\n\nডেলিভারি ম্যানের কাছ থেকে চেক করে নেওয়ার সুবিধা রয়েছে। ধন্যবাদ আমাদের সাথে কেনাকাটা করার জন্য! ✨`,
        quickReplies: ['ধন্যবাদ!', 'অর্ডার চালান প্রিন্ট করুন'],
        source: 'nlp',
        orderCreated: true,
        orderData: {
          customerName,
          customerPhone: phoneMatch[0],
          deliveryAddress,
          productTitle: 'জয়পুরি কটন আনস্টিচড থ্রি-পিস',
          itemsPrice: 1250,
          deliveryCharge: 70,
          totalPrice: 1320,
        },
      });
    }

    // Product collection queries ("kiki product", "collection", "dress", "কি কি প্রোডাক্ট")
    if (
      lower.includes('kiki') ||
      lower.includes('ki ki') ||
      lower.includes('product') ||
      lower.includes('collection') ||
      lower.includes('dress') ||
      lower.includes('item') ||
      lower.includes('কি কি') ||
      lower.includes('কালেকশন') ||
      lower.includes('প্রোডাক্ট') ||
      lower.includes('পোশাক')
    ) {
      return NextResponse.json({
        success: true,
        reply: `আমাদের বর্তমানের সেরা হট-সেলিং কালেকশনগুলো নিচে দেওয়া হলো: 🌸\n\n১. **জয়পুরি কটন আনস্টিচড থ্রি-পিস** - ৳১২৫০ (১০০% পিওর সুতি)\n২. **প্রিমিয়াম কাশ্মীরি কুর্তি** - ৳৮৫০ (সাইজ: M, L, XL)\n৩. **ডিজাইনার পার্টি গাউন** - ৳১৫০০ (সাইজ: M, L, XL)\n৪. **গর্জিয়াস ভেলভেট পার্টি গাউন (কালো)** - ৳১৮৫০\n\nআপনি কোন কালেকশনটি দেখতে চাচ্ছেন বা অর্ডার করতে চান? 😊`,
        quickReplies: ['জয়পুরি থ্রি-পিস দেখতে চাই', 'পার্টি গাউন এর সাইজ কত?', 'অর্ডার করতে চাই'],
        source: 'nlp',
      });
    }

    // Price queries ("koto", "dam", "price", "দাম কত")
    if (
      lower.includes('koto') ||
      lower.includes('dam') ||
      lower.includes('daam') ||
      lower.includes('price') ||
      lower.includes('দাম') ||
      lower.includes('কত') ||
      lower.includes('টাকা')
    ) {
      return NextResponse.json({
        success: true,
        reply: `আমাদের জয়পুরি কটন থ্রি-পিসের অফার প্রাইস মাত্র ৳১২৫০ (রেগুলার ১৫০০ টাকা)! কাশ্মীরি কুর্তি ৳৮৫০ এবং গর্জিয়াস পার্টি গাউন ৳১৫০০। 🌸\n\nসবগুলো প্রোডাক্টেই ক্যাশ অন ডেলিভারি এবং ৩ দিনের ফ্রি সাইজ এক্সচেঞ্জ সুবিধা পাবেন। আপনি কোনটি নিতে চাচ্ছেন?`,
        quickReplies: ['১ পিস অর্ডার করব', 'ঢাকার বাইরে ডেলিভারি চার্জ কত?'],
        source: 'nlp',
      });
    }

    // Quality queries ("valo", "quality", "kemon", "ভালো", "কেমন")
    if (
      lower.includes('valo') ||
      lower.includes('bhalo') ||
      lower.includes('quality') ||
      lower.includes('kemon') ||
      lower.includes('ভালো') ||
      lower.includes('কেমন') ||
      lower.includes('কাপড়') ||
      lower.includes('কোয়ালিটি')
    ) {
      return NextResponse.json({
        success: true,
        reply: `জি আলহামদুলিল্লাহ, আমাদের প্রতিটা প্রোডাক্ট ১০০% পিওর সুতি ও প্রিমিয়াম এক্সপোর্ট কোয়ালিটির ফেব্রিক দিয়ে তৈরি! ❤️ কালার ও কাপড়ের ১০০% গ্যারান্টি পাবেন এবং ডেলিভারিম্যানের সামনে পার্সেল খুলে চেক করে নেওয়ার সুবিধা আছে।`,
        quickReplies: ['আমি ১ পিস নিতে চাই', 'অর্ডার করতে কী লাগবে?'],
        source: 'nlp',
      });
    }

    // Delivery queries ("delivery", "charge", "ডেলিভারি", "চার্জ")
    if (
      lower.includes('delivery') ||
      lower.includes('delivary') ||
      lower.includes('charge') ||
      lower.includes('ডেলিভারি') ||
      lower.includes('চার্জ') ||
      lower.includes('কবে পাব')
    ) {
      return NextResponse.json({
        success: true,
        reply: `🚚 আমাদের ডেলিভারি চার্জ ঢাকা সিটিতে মাত্র ৳৭০ (২৪-৪৮ ঘণ্টার মধ্যে) এবং ঢাকার বাইরে ৳১২০ (২-৩ দিনের মধ্যে)। কোনো অগ্রিম পেমেন্ট ছাড়াই সম্পূর্ণ ক্যাশ অন ডেলিভারি!`,
        quickReplies: ['অর্ডার কনফার্ম করতে চাই', 'ক্যাশ অন ডেলিভারি হবে?'],
        source: 'nlp',
      });
    }

    // Order intention queries ("order", "confrim", "confirm", "নিব", "করব")
    if (
      lower.includes('order') ||
      lower.includes('confirm') ||
      lower.includes('confrim') ||
      lower.includes('nibo') ||
      lower.includes('korbo') ||
      lower.includes('অর্ডার') ||
      lower.includes('নিব') ||
      lower.includes('কনফার্ম')
    ) {
      return NextResponse.json({
        success: true,
        reply: `অসাধারণ পছন্দ! আপনার অর্ডারটি নিশ্চিত করতে অনুগ্রহ করে নিচের তথ্যগুলো লিখে পাঠান: 👇\n\n১. আপনার নাম\n২. ১১ ডিজিটের মোবাইল নম্বর\n৩. সম্পূর্ণ ডেলিভারি ঠিকানা\n৪. প্রোডাক্টের নাম ও সাইজ\n\nআমি এখনই আপনার অর্ডারটি কনফার্ম করে দিচ্ছি! 🌸`,
        quickReplies: ['তানভীর, 01712334455, মিরপুর ১০ ঢাকা'],
        source: 'nlp',
      });
    }

    // Size queries ("size", "xl", "m", "l", "সাইজ")
    if (
      lower.includes('size') ||
      lower.includes('xl') ||
      lower.includes('xxl') ||
      lower.includes('সাইজ') ||
      lower.includes('মাপ')
    ) {
      return NextResponse.json({
        success: true,
        reply: `আমাদের কুর্তি ও গাউনে M (৩৮), L (৪০) এবং XL (৪২) সাইজ এভেইলেবল আছে। আর থ্রি-পিস সম্পূর্ণ ফ্রি সাইজ (আনস্টিচড)। আপনার কোন সাইজটি লাগবে? 👗`,
        quickReplies: ['Size: L (40)', 'Size: XL (42)', 'ফ্রি সাইজ নিব'],
        source: 'nlp',
      });
    }

    // General greetings ("hi", "hello", "salam", "হাই", "হ্যালো", "সালাম")
    if (
      lower.includes('hi') ||
      lower.includes('hello') ||
      lower.includes('salam') ||
      lower.includes('slaam') ||
      lower.includes('সালাম') ||
      lower.includes('হ্যালো') ||
      lower.includes('হাই')
    ) {
      return NextResponse.json({
        success: true,
        reply: `ওয়ালাইকুম আসসালাম! Moner Kotha Fashion-এ আপনাকে স্বাগতম। 🌸 আমি আপনার ব্যক্তিগত এআই সেলস অ্যাসিস্ট্যান্ট।\nআজকে আপনাকে চমৎকার কোন ড্রেস বা কুর্তিটি দেখাতে পারি? 😊`,
        quickReplies: ['আজকের স্পেশাল কালেকশন দেখান', 'থ্রি-পিস এর দাম কত?'],
        source: 'nlp',
      });
    }

    // Smart Conversational fallback (Never static dumb text!)
    return NextResponse.json({
      success: true,
      reply: `ধন্যবাদ আপনার মেসেজের জন্য! 🌸 আমাদের স্টোরে প্রিমিয়াম কাশ্মীরি কুর্তি (৳৮৫০), জয়পুরি কটন থ্রি-পিস (৳১২৫০) ও পার্টি গাউন (৳১৫০০) এর স্টক এভেইলেবল আছে। আপনি কি প্রোডাক্টের ছবি ও বিস্তারিত দেখতে চান নাকি সরাসরি অর্ডার কনফার্ম করতে চান? 😊`,
      quickReplies: ['কালেকশন দেখতে চাই', 'ডেলিভারি চার্জ কত?', 'অর্ডার করতে চাই'],
      source: 'nlp',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      reply: 'ধন্যবাদ! আমাদের সেলস অ্যাসিস্ট্যান্ট আপনার সাথে আছে। আপনি কী ধরণের প্রোডাক্ট খুঁজছেন বলুন? 😊',
    });
  }
}
