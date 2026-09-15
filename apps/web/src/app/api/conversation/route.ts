import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, getSql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const psid = searchParams.get('psid');
    const orderId = searchParams.get('orderId');

    const settings = await getBotSettings();
    const pageToken = settings.fbPageToken || process.env.DEFAULT_FACEBOOK_PAGE_TOKEN;

    const sql = getSql();
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

    if (!targetPsid) {
      return NextResponse.json({
        success: false,
        error: 'কাস্টমারের ফেসবুক আইডি (PSID) পাওয়া যায়নি',
        messages: [],
      });
    }

    // 1. Fetch User Profile Info
    let profileData = null;
    try {
      const profileUrl = `https://graph.facebook.com/v20.0/${targetPsid}?fields=first_name,last_name,name,profile_pic&access_token=${pageToken}`;
      const pRes = await fetch(profileUrl);
      if (pRes.ok) {
        profileData = await pRes.json();
      }
    } catch (e) {
      console.error('[Fetch Profile Error]:', e);
    }

    // 2. Fetch Conversation Messages
    let messages: any[] = [];
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
          isPage: m.from?.id === '1314475555081210' || m.from?.name === 'Moner Kotha',
          time: m.created_time,
        }));
      }
    } catch (e) {
      console.error('[Fetch Conversation Error]:', e);
    }

    const inboxUrl = `https://business.facebook.com/latest/inbox/messenger?mailbox_id=1314475555081210&selected_item_id=${targetPsid}`;

    return NextResponse.json({
      success: true,
      psid: targetPsid,
      profile: profileData,
      messages,
      inboxUrl,
    });
  } catch (error: any) {
    console.error('[API GET /api/conversation Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
