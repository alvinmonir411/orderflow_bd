import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, insertDbOrder, getDbProducts, saveDbChatMessage, getSql } from '@/lib/db';

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'orderflow_bd_secure_verify_2026';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log(`[WhatsApp Webhook GET] mode=${mode}, token=${token}`);

  if (mode === 'subscribe' && (token === WHATSAPP_VERIFY_TOKEN || token === 'orderflow_bd_secure_verify_2026')) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new NextResponse('Verification failed', { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[WhatsApp Webhook POST Event]:', JSON.stringify(body));

    if (body.object === 'whatsapp_business_account') {
      const settings = await getBotSettings();
      const phoneId = settings.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
      const waToken = settings.whatsappToken || process.env.WHATSAPP_ACCESS_TOKEN || '';
      const geminiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY || '';

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value || value.messaging_product !== 'whatsapp') continue;

          const contacts = value.contacts || [];
          const messages = value.messages || [];

          for (const msg of messages) {
            if (msg.type !== 'text' || !msg.text?.body) continue;

            const fromPhone = msg.from; // e.g. 88017XXXXXXXX
            const customerName = contacts[0]?.profile?.name || `Customer (${fromPhone.slice(-4)})`;
            const text = msg.text.body.trim();

            // 1. Save customer message to DB
            await saveDbChatMessage({
              senderId: fromPhone,
              customerName,
              sender: 'customer',
              text,
              channel: 'WHATSAPP',
            });

            // 2. Generate AI response if WhatsApp token & phoneId are configured
            if (phoneId && waToken) {
              const replyText = await generateAiReply(text, customerName, settings, geminiKey);
              
              // 3. Send message via Meta WhatsApp Cloud API
              await sendWhatsAppMessage(phoneId, waToken, fromPhone, replyText);

              // 4. Save AI reply to DB
              await saveDbChatMessage({
                senderId: fromPhone,
                customerName,
                sender: 'ai',
                text: replyText,
                channel: 'WHATSAPP',
              });
            }
          }
        }
      }

      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    }

    return new NextResponse('NOT_WHATSAPP_EVENT', { status: 200 });
  } catch (error: any) {
    console.error('[WhatsApp Webhook Error]:', error);
    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  }
}

async function sendWhatsAppMessage(phoneId: string, token: string, toPhone: string, text: string) {
  try {
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhone,
        type: 'text',
        text: { preview_url: false, body: text },
      }),
    });
    const data = await res.json();
    console.log('[WhatsApp API Send Response]:', data);
    return data;
  } catch (err) {
    console.error('[Send WhatsApp API Error]:', err);
  }
}

async function generateAiReply(userText: string, customerName: string, settings: any, geminiKey: string): Promise<string> {
  if (!geminiKey) {
    return `নমস্কার ${customerName}! OrderFlow BD-তে আপনাকে স্বাগতম। আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন। যেকোনো প্রয়োজনে আমাদের ডেলিভারি চার্জ: ঢাকা ৳${settings.deliveryFeeDhaka || 120}, ঢাকার বাইরে ৳${settings.deliveryFeeOutside || 150}।`;
  }

  try {
    const prompt = `
You are a friendly Bengali F-Commerce AI sales representative for OrderFlow BD on WhatsApp.
Customer Name: ${customerName}
Delivery in Dhaka: ৳${settings.deliveryFeeDhaka || 120} (${settings.deliveryTimeDhaka || '1-2 days'})
Delivery outside Dhaka: ৳${settings.deliveryFeeOutside || 150} (${settings.deliveryTimeOutside || '2-3 days'})
Helpline: ${settings.helplinePhone || '01700000000'}

Customer Message: "${userText}"

Reply politely in natural Bengali (বাংলা). Answer their query clearly and offer to take their order with name, address, and phone number.
`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiText) return aiText.trim();
    }
  } catch (err) {
    console.error('[Gemini WhatsApp Generation Error]:', err);
  }

  return `ধন্যবাদ ${customerName}! আমরা আপনার মেসেজ পেয়েছি। আমাদের টিম অতি দ্রুত আপনার অর্ডারের বিষয়ে রিপ্লাই দেবে।`;
}
