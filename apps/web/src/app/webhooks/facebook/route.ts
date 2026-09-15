import { NextRequest, NextResponse } from 'next/server';

// In-memory conversation state for fast serverless responses
const userSessions: Record<string, { state: string; selectedProduct?: string; price?: number }> = {};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log(`[Facebook Webhook GET] mode=${mode}, token=${token}`);

  if (mode === 'subscribe' && challenge) {
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

    if (body.object === 'page') {
      let pageToken =
        (global as any).__BOT_CONFIG__?.fbPageToken ||
        process.env.DEFAULT_FACEBOOK_PAGE_TOKEN ||
        process.env.FB_PAGE_TOKEN ||
        process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

      if (!pageToken) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const configPath = path.join(process.cwd(), '.bot-config.json');
          if (fs.existsSync(configPath)) {
            const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            pageToken = cfg.fbPageToken;
          }
        } catch (e) {}
      }

      for (const entry of body.entry || []) {
        for (const event of entry.messaging || []) {
          const senderId = event.sender?.id;
          if (!senderId || event.message?.is_echo) continue;

          const text = event.message?.text || '';
          const payload = event.postback?.payload || event.message?.quick_reply?.payload;

          await processMessengerEvent(senderId, text, payload, pageToken);
        }
      }

      return new NextResponse('EVENT_RECEIVED', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return new NextResponse('NOT_A_PAGE_EVENT', { status: 200 });
  } catch (error) {
    console.error('[Facebook Webhook Error]:', error);
    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  }
}

async function processMessengerEvent(
  senderId: string,
  text: string,
  payload?: string,
  pageToken?: string,
) {
  const session = userSessions[senderId] || { state: 'IDLE' };
  const lowerText = text.toLowerCase().trim();

  // 1. If payload button clicked
  if (payload) {
    if (payload.startsWith('PROD_')) {
      const prodName = payload === 'PROD_KURTI' ? 'প্রিমিয়াম কাশ্মীরি কুর্তি' : payload === 'PROD_3PIECE' ? 'জয়পুরি কটন থ্রি-পিস' : 'ডিজাইনার পার্টি গাউন';
      const price = payload === 'PROD_KURTI' ? 850 : payload === 'PROD_3PIECE' ? 1250 : 1500;
      
      session.state = 'AWAITING_ADDRESS';
      session.selectedProduct = prodName;
      session.price = price;
      userSessions[senderId] = session;

      await sendFbMessage(
        senderId,
        `আপনি '${prodName} (৳${price})' নির্বাচন করেছেন। 🛍️\n\nঅর্ডারটি কনফার্ম করতে অনুগ্রহ করে আপনার:\n১. পুরো নাম\n২. মোবাইল নম্বর\n৩. সম্পূর্ণ ডেলিভারি ঠিকানা\nলিখে মেসেজ পাঠান (যেমন: তানিয়া আক্তার, 01712345678, মিরপুর-১০, ঢাকা)।`,
        pageToken,
      );
      return;
    }
  }

  // 2. If user provides phone number and address
  const phoneMatch = text.match(/(01[3-9]\d{8})/);
  if (phoneMatch && (session.state === 'AWAITING_ADDRESS' || session.selectedProduct)) {
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const totalPrice = (session.price || 850) + 120; // +120 delivery
    session.state = 'IDLE';
    userSessions[senderId] = session;

    await sendFbMessage(
      senderId,
      `🎉 অভিনন্দন! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।\n\n` +
      `📦 অর্ডার নম্বর: #OF-${orderNum}\n` +
      `👗 প্রোডাক্ট: ${session.selectedProduct || 'প্রিমিয়াম কুর্তি'}\n` +
      `💰 মোট পরিমাণ: ৳${totalPrice} (হোম ডেলিভারি চার্জ সহ, ক্যাশ অন ডেলিভারি)\n` +
      `🚚 ২-৩ কার্যদিবসের মধ্যে কুরিয়ারের মাধ্যমে আপনার ঠিকানায় পৌঁছে যাবে।\n\n` +
      `প্যাকেজটি পাঠানোর পর আপনাকে ট্র্যাকিং কোডসহ এসএমএস ও মেসেজ দেওয়া হবে। ধন্যবাদ সাথে থাকার জন্য! ❤️`,
      pageToken,
    );
    return;
  }

  // 3. Greeting / Main Menu
  session.state = 'IDLE';
  userSessions[senderId] = session;

  await sendFbQuickReplies(
    senderId,
    `আসসালামু আলাইকুম! OrderFlow BD শপে আপনাকে স্বাগতম। 🌸\n\nকোন প্রোডাক্টটি আপনি দেখতে বা অর্ডার করতে চান তা নিচে নির্বাচন করুন 👇`,
    [
      { title: 'প্রিন্ট কুর্তি - ৮৫০', payload: 'PROD_KURTI' },
      { title: 'জয়পুরি থ্রি-পিস - ১২৫০', payload: 'PROD_3PIECE' },
      { title: 'পার্টি গাউন - ১৫০০', payload: 'PROD_GOWN' },
    ],
    pageToken,
  );
}

async function sendFbMessage(recipientId: string, text: string, token?: string) {
  if (!token) {
    console.warn('[Facebook Webhook] Warning: No Page Access Token configured yet to send reply.');
    return;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
      }),
    });
    const data = await res.json();
    console.log('[Facebook Send Message Result]:', data);
  } catch (err) {
    console.error('[Facebook Send Message Error]:', err);
  }
}

async function sendFbQuickReplies(
  recipientId: string,
  text: string,
  quickReplies: Array<{ title: string; payload: string }>,
  token?: string,
) {
  if (!token) {
    console.warn('[Facebook Webhook] Warning: No Page Access Token configured yet to send reply.');
    return;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: {
          text,
          quick_replies: quickReplies.map((qr) => ({
            content_type: 'text',
            title: qr.title.slice(0, 20),
            payload: qr.payload,
          })),
        },
      }),
    });
    const data = await res.json();
    console.log('[Facebook Quick Replies Result]:', data);
  } catch (err) {
    console.error('[Facebook Quick Replies Error]:', err);
  }
}
