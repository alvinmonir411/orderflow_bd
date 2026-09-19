import { NextRequest, NextResponse } from 'next/server';
import {
  getBotSettings,
  getSql,
  getDbOrders,
  getDbChatThreads,
  getDbChatMessagesBySender,
  getDbConversations,
  getDbChannelConnections,
  upsertDbConversation,
  updateDbConversationAssignment,
  updateDbConversationStatus,
  setDbConversationTags,
  addDbInternalNote,
  getDbInternalNotes,
  addDbConversationTimeline,
  getDbConversationTimeline,
} from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: true, threads: [] });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryOrgId = searchParams.get('orgId');
    const orgId = user?.role === 'SUPER_ADMIN' && queryOrgId ? queryOrgId : (user?.organizationId || 'org-1');

    const psid = searchParams.get('psid');
    const orderId = searchParams.get('orderId');
    const convId = searchParams.get('convId');
    const isList = searchParams.get('list') === 'true' || (!psid && !orderId && !convId);

    // Multi-tenant page credentials from ChannelConnection
    let pageToken = '';
    let pageId = '';
    try {
      const conns = await getDbChannelConnections(orgId);
      const fbConn = conns.find((c: any) => c.platform === 'FACEBOOK_MESSENGER' && c.status === 'CONNECTED');
      if (fbConn && fbConn.accessToken) {
        pageToken = fbConn.accessToken || '';
        pageId = fbConn.pageId || '';
      }
    } catch (_) {}

    if (!pageToken) {
      const settings = await getBotSettings(orgId);
      pageToken = settings.fbPageToken || '';
      pageId = settings.fbPageId || '';
    }
    const sql = getSql();

    // If requesting details (internal notes and timeline) for a specific conversation
    if (convId) {
      const [notes, timeline] = await Promise.all([
        getDbInternalNotes(orgId, convId),
        getDbConversationTimeline(orgId, convId),
      ]);
      return NextResponse.json({
        success: true,
        convId,
        notes,
        timeline,
      });
    }

    // If requesting the FULL list of real conversations
    if (isList) {
      const [orders, dbThreads, dbConversations] = await Promise.all([
        getDbOrders(orgId),
        getDbChatThreads(orgId),
        getDbConversations(orgId),
      ]);

      const convMap = new Map<string, any>();
      for (const c of dbConversations) {
        convMap.set(c.senderId, c);
        convMap.set(c.id, c);
      }

      let fbConversations: any[] = [];

      // 1. Try to fetch live Facebook Page Conversations from Meta Graph API
      if (pageToken) {
        try {
          const fbUrl = `https://graph.facebook.com/v20.0/me/conversations?fields=id,snippet,updated_time,unread_count,senders,participants,messages.limit(10){id,message,from,created_time}&access_token=${pageToken.trim()}`;
          const fbRes = await fetch(fbUrl, { signal: AbortSignal.timeout(2500) });
          if (fbRes.ok) {
            const fbData = await fbRes.json();
            fbConversations = fbData?.data || [];
          }
        } catch (fbErr) {
          // Soft fail for Meta graph network errors without breaking internal CRM
        }
      }

      const threads: any[] = [];
      const seenPsids = new Set<string>();

      // 2. Add threads from recorded ChatMessage table (scoped to orgId)
      for (const dbt of dbThreads) {
        if (!dbt.senderId) continue;
        seenPsids.add(dbt.senderId);

        const msgs = await getDbChatMessagesBySender(dbt.senderId, orgId);
        const matchedOrder = orders.find(
          (o) => o.psid === dbt.senderId || (o.customerPhone && dbt.senderId.includes(o.customerPhone)),
        );

        const dbC = convMap.get(dbt.senderId) || {};

        threads.push({
          id: `thread-${dbt.senderId}`,
          customerName: dbt.c_name || dbt.customerName || (matchedOrder?.customerName) || 'ফেসবুক গ্রাহক',
          customerPhone: dbt.c_phone || (matchedOrder?.customerPhone) || '01938909812',
          customerAddress: dbt.c_address || (matchedOrder?.deliveryAddress) || 'মিরপুর, ঢাকা',
          channel: dbt.channel || 'FACEBOOK_MESSENGER',
          psid: dbt.senderId,
          productInterest: dbt.productTitle || (matchedOrder?.items?.[0]?.product?.title) || 'এক্সক্লুসিভ পার্টি গাউন',
          productImage: dbt.productImage || (matchedOrder?.items?.[0]?.product?.images?.[0]) || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80',
          productPrice: dbt.productPrice || (matchedOrder?.totalPrice) || 1750,
          lastMessage: dbt.lastText || 'মেসেজ এসেছে',
          lastTime: new Date(dbt.lastTime).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          unread: true,
          orderNumber: matchedOrder?.orderNumber || 1049,
          orderStatus: matchedOrder?.status || 'PENDING_CONFIRMATION',
          totalSpent: matchedOrder?.totalPrice || 1870,
          isAiActive: dbC.isAiActive !== undefined ? dbC.isAiActive : true,
          status: dbC.status || 'OPEN',
          assignedToId: dbC.assignedToId || null,
          assignedToName: dbC.assignedToName || null,
          tags: dbC.tags || ['🔥 Hot Lead'],
          messages: msgs.map((m: any) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
            productCard: m.productTitle ? {
              title: m.productTitle,
              price: m.productPrice || 1750,
              image: m.productImage || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80',
            } : undefined,
          })),
        });
      }

      // 3. Add threads from real database orders for this org
      for (const ord of orders) {
        const custPsid = ord.psid || (ord.customer as any)?.psid;
        const threadKey = custPsid || ord.customerPhone || ord.id;
        if (custPsid && seenPsids.has(custPsid)) continue;
        if (custPsid) seenPsids.add(custPsid);

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

        const dbC = (custPsid ? convMap.get(custPsid) : null) || convMap.get(ord.id) || {};

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
          status: dbC.status || (ord.status === 'DELIVERED' ? 'RESOLVED' : ord.status === 'CANCELLED' ? 'CLOSED' : 'OPEN'),
          assignedToId: dbC.assignedToId || user?.id || null,
          assignedToName: dbC.assignedToName || user?.name || 'অ্যাসাইন করা হয়নি',
          tags: dbC.tags || ['💎 VIP', '🛍️ Interested'],
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

      // 4. Add threads from Meta Graph API conversations (if not already added)
      if (fbConversations.length > 0) {
        for (const fbConv of fbConversations) {
          const sender = fbConv.senders?.data?.[0];
          const senderId = sender?.id;
          if (!senderId || seenPsids.has(senderId)) continue;
          seenPsids.add(senderId);

          const rawMsgs = fbConv.messages?.data || [];
          const threadMsgs = rawMsgs.reverse().map((m: any) => ({
            id: m.id,
            sender: (pageId && m.from?.id === pageId) ? 'ai' : 'customer',
            text: m.message || 'মেসেজ',
            time: new Date(m.created_time).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          }));

          const dbC = convMap.get(senderId) || {};

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
            status: dbC.status || 'OPEN',
            assignedToId: dbC.assignedToId || null,
            assignedToName: dbC.assignedToName || null,
            tags: dbC.tags || ['⏰ Follow Up'],
            messages: threadMsgs,
          });
        }
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
        WHERE (o.id = ${orderId} OR o."orderNumber"::text = ${String(orderId)})
          AND o."organizationId" = ${orgId}
        LIMIT 1;
      `;
      if (rows.length > 0 && rows[0].psid) {
        targetPsid = rows[0].psid;
      }
    }

    let messages: any[] = [];
    let profileData = null;

    if (targetPsid) {
      const dbMsgs = await getDbChatMessagesBySender(targetPsid, orgId);
      if (dbMsgs.length > 0) {
        messages = dbMsgs.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          time: new Date(m.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        }));
      }

      if (pageToken) {
        try {
          const profileUrl = `https://graph.facebook.com/v20.0/${targetPsid}?fields=first_name,last_name,name,profile_pic&access_token=${pageToken}`;
          const pRes = await fetch(profileUrl);
          if (pRes.ok) {
            profileData = await pRes.json();
          }
        } catch (e) {
          console.error('[Fetch Profile Error]:', e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      psid: targetPsid || null,
      profile: profileData,
      messages,
      inboxUrl: targetPsid && pageId ? `https://business.facebook.com/latest/inbox/messenger?mailbox_id=${pageId}&selected_item_id=${targetPsid}` : null,
    });
  } catch (error: any) {
    console.error('[API GET /api/conversation Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';
    const actorId = user?.id || 'usr-admin-1';
    const actorName = user?.name || 'Admin';
    const body = await request.json();
    const { action, convId, senderId, assignedToId, assignedToName, status, tags, noteContent } = body;

    const targetConvId = convId || (senderId ? `conv-${senderId}` : `conv-${Date.now()}`);

    // 1. UPDATE ASSIGNMENT
    if (action === 'assign') {
      await updateDbConversationAssignment(orgId, targetConvId, assignedToId || null, actorId, actorName);
      return NextResponse.json({
        success: true,
        message: assignedToName ? `চ্যাটটি ${assignedToName}-কে অ্যাসাইন করা হয়েছে` : 'চ্যাটটি আনঅ্যাসাইন করা হয়েছে',
      });
    }

    // 2. UPDATE STATUS
    if (action === 'status') {
      await updateDbConversationStatus(orgId, targetConvId, status, actorId, actorName);
      return NextResponse.json({
        success: true,
        message: `স্ট্যাটাস '${status}' এ আপডেট করা হয়েছে`,
      });
    }

    // 3. UPDATE TAGS
    if (action === 'tags') {
      await setDbConversationTags(orgId, targetConvId, tags || [], actorId, actorName);
      return NextResponse.json({
        success: true,
        message: 'কাস্টম ট্যাগ সফলভাবে সেভ হয়েছে',
      });
    }

    // 4. ADD INTERNAL NOTE
    if (action === 'add_note') {
      if (!noteContent || !noteContent.trim()) {
        return NextResponse.json({ success: false, error: 'নোটের বিবরণ লিখুন' }, { status: 400 });
      }

      const note = await addDbInternalNote(
        orgId,
        targetConvId,
        actorId,
        actorName,
        noteContent.trim(),
      );

      return NextResponse.json({
        success: true,
        message: 'ইন্টারনাল নোট সংরক্ষিত হয়েছে',
        note,
      });
    }

    return NextResponse.json({ success: false, error: 'অজানা অ্যাকশন' }, { status: 400 });
  } catch (err: any) {
    console.error('[API POST /api/conversation Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

