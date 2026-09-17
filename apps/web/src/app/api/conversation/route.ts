import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, getSql, getDbOrders } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const psid = searchParams.get('psid');
    const orderId = searchParams.get('orderId');
    const isList = searchParams.get('list') === 'true' || (!psid && !orderId);

    const settings = await getBotSettings();
    const pageToken = settings.fbPageToken || process.env.DEFAULT_FACEBOOK_PAGE_TOKEN;
    const sql = getSql();

    // If requesting the FULL list of real conversations
    if (isList) {
      const orders = await getDbOrders();
      let fbConversations: any[] = [];

      // 1. Try to fetch live Facebook Page Conversations from Meta Graph API
      if (pageToken) {
        try {
          const fbUrl = `https://graph.facebook.com/v20.0/me/conversations?fields=id,snippet,updated_time,unread_count,senders,participants,messages.limit(10){id,message,from,created_time}&access_token=${pageToken.trim()}`;
          const fbRes = await fetch(fbUrl);
          if (fbRes.ok) {
            const fbData = await fbRes.json();
            fbConversations = fbData?.data || [];
          }
        } catch (fbErr) {
          console.error('[Fetch Meta Conversations Error]:', fbErr);
        }
      }

      // 2. Fetch all customers from DB
      const customers = await sql`
        SELECT id, name, phone, address, city, psid, "totalOrders", "totalSpent", "createdAt", "updatedAt"
        FROM "Customer"
        ORDER BY "updatedAt" DESC
        LIMIT 50;
      `;

      // 3. Build unified real conversation threads
      const threads: any[] = [];
      const seenPsids = new Set<string>();
      const seenPhones = new Set<string>();

      // First, add threads from real database orders/customers
      for (const ord of orders) {
        const custPsid = ord.psid || (ord.customer as any)?.psid;
        const custPhone = ord.customerPhone;
        const threadKey = custPsid || custPhone || ord.id;

        if (custPsid) seenPsids.add(custPsid);
        if (custPhone) seenPhones.add(custPhone);

        const firstItem = ord.items?.[0];
        const notes = ord.notes || '';
        const noteMessages = notes
          ? notes
              .split('\n')
              .filter((n: string) => n.trim().length > 0)
              .map((n: string, idx: number) => ({
                id: `note-${ord.id}-${idx}`,
                sender: n.includes('গ্রাহক') ? 'customer' : n.includes('AI') ? 'ai' : 'admin',
                text: n.replace(/\[.*?\]\s*/, ''),
                time: new Date(ord.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
              }))
          : [];

        threads.push({
          id: `thread-order-${ord.id}`,
          customerName: ord.customerName || ord.customer?.name || 'কাস্টমার',
          customerPhone: ord.customerPhone || '01700000000',
          customerAddress: ord.deliveryAddress || 'ঢাকা',
          channel: ord.channel || 'FACEBOOK_MESSENGER',
          psid: custPsid || null,
          productInterest: firstItem?.product?.title || 'প্রিমিয়াম কালেকশন',
          productImage: firstItem?.product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
          productPrice: firstItem?.unitPrice || ord.totalPrice,
          lastMessage: notes ? notes.split('\n').pop() || `অর্ডার নং #OF-${ord.orderNumber}` : `অর্ডার নং #OF-${ord.orderNumber} গ্রহণ করা হয়েছে`,
          lastTime: new Date(ord.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          unread: ord.status === 'PENDING_CONFIRMATION',
          orderNumber: ord.orderNumber,
          orderStatus: ord.status,
          totalSpent: ord.totalPrice,
          isAiActive: true,
          messages: noteMessages.length > 0 ? noteMessages : [
            {
              id: `m-init-${ord.id}`,
              sender: 'customer',
              text: `আসসালামু আলাইকুম, আমি ${firstItem?.product?.title || 'প্রোডাক্ট'} অর্ডার করতে চাই।`,
              time: new Date(ord.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
            },
            {
              id: `m-ai-${ord.id}`,
              sender: 'ai',
              text: `ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে। অর্ডার নং #OF-${ord.orderNumber}, মোট প্রদেয়: ৳${ord.totalPrice}।`,
              time: new Date(ord.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
              productCard: {
                title: firstItem?.product?.title || 'প্রিমিয়াম প্রোডাক্ট',
                price: firstItem?.unitPrice || ord.totalPrice,
                image: firstItem?.product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
              },
            },
          ],
        });
      }

      // Next, add threads from Meta Graph API conversations (if not already matched)
      for (const fbConv of fbConversations) {
        const sender = fbConv.senders?.data?.[0];
        const senderId = sender?.id;
        if (!senderId || seenPsids.has(senderId)) continue;
        seenPsids.add(senderId);

        const rawMsgs = fbConv.messages?.data || [];
        const threadMsgs = rawMsgs.reverse().map((m: any) => ({
          id: m.id,
          sender: m.from?.id === '1314475555081210' || m.from?.name === 'Moner Kotha' ? 'ai' : 'customer',
          text: m.message || 'মেসেজ',
          time: new Date(m.created_time).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        }));

        threads.push({
          id: `thread-fb-${senderId}`,
          customerName: sender?.name || 'ফেসবুক গ্রাহক',
          customerPhone: 'ইনবক্স কাস্টমার',
          customerAddress: 'মেসেঞ্জার ইনকোয়ারি',
          channel: 'FACEBOOK_MESSENGER',
          psid: senderId,
          productInterest: 'ইনবক্স মেসেজ',
          productPrice: 0,
          lastMessage: fbConv.snippet || 'নতুন মেসেজ এসেছে',
          lastTime: new Date(fbConv.updated_time).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          unread: fbConv.unread_count > 0,
          isAiActive: true,
          messages: threadMsgs,
        });
      }

      return NextResponse.json({
        success: true,
        threads,
      });
    }

    // Single conversation detail request
    let targetPsid = psid;

    if (!targetPsid && orderId) {
      const rows = await sql`
        SELECT c.psid 
        FROM "Order" o
        LEFT JOIN "Customer" c ON o."customerId" = c.id
        WHERE o.id = ${orderId} OR o."orderNumber"::text = ${String(orderId)}
        LIMIT 1;
      `;
      if (rows.length > 0 && rows[0].psid) {
        targetPsid = rows[0].psid;
      }
    }

    let messages: any[] = [];
    let profileData = null;

    if (targetPsid && pageToken) {
      try {
        const profileUrl = `https://graph.facebook.com/v20.0/${targetPsid}?fields=first_name,last_name,name,profile_pic&access_token=${pageToken}`;
        const pRes = await fetch(profileUrl);
        if (pRes.ok) {
          profileData = await pRes.json();
        }
      } catch (e) {
        console.error('[Fetch Profile Error]:', e);
      }

      try {
        const convUrl = `https://graph.facebook.com/v20.0/me/conversations?user_id=${targetPsid}&fields=messages{message,from,created_time}&access_token=${pageToken}`;
        const cRes = await fetch(convUrl);
        if (cRes.ok) {
          const cData = await cRes.json();
          const rawMsgs = cData?.data?.[0]?.messages?.data || [];
          messages = rawMsgs.reverse().map((m: any) => ({
            id: m.id,
            text: m.message,
            senderName: m.from?.name,
            sender: m.from?.id === '1314475555081210' || m.from?.name === 'Moner Kotha' ? 'ai' : 'customer',
            time: new Date(m.created_time).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          }));
        }
      } catch (e) {
        console.error('[Fetch Conversation Error]:', e);
      }
    }

    return NextResponse.json({
      success: true,
      psid: targetPsid || null,
      profile: profileData,
      messages,
      inboxUrl: targetPsid ? `https://business.facebook.com/latest/inbox/messenger?mailbox_id=1314475555081210&selected_item_id=${targetPsid}` : null,
    });
  } catch (error: any) {
    console.error('[API GET /api/conversation Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
