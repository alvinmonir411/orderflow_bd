import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, updateBotSettings, getSql, upsertDbChannelConnection } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, token, pageId, pageToken, pageName, orgId } = body;

    // ACTION 1: INSPECT TOKEN & DISCOVER PAGES
    if (action === 'inspect_token' || (!action && token && !pageId)) {
      const cleanToken = (token || '').trim();
      if (!cleanToken) {
        return NextResponse.json({ success: false, error: 'অনুগ্রহ করে ফেসবুক অ্যাক্সেস টোকেন দিন' }, { status: 400 });
      }

      // 1. First test debug_token to see token type and permissions
      let tokenType = 'UNKNOWN';
      let debugData: any = null;
      try {
        const debugRes = await fetch(`https://graph.facebook.com/debug_token?input_token=${cleanToken}&access_token=${cleanToken}`);
        const dJson = await debugRes.json();
        if (dJson?.data) {
          debugData = dJson.data;
          tokenType = dJson.data.type || 'UNKNOWN';
        }
      } catch (e) {
        console.warn('[Debug Token Warning]:', e);
      }

      // 2. If it's a User Token, fetch all manageable Facebook Pages via /me/accounts
      const accountsRes = await fetch(`https://graph.facebook.com/v20.0/me/accounts?fields=id,name,category,picture,access_token,tasks&access_token=${cleanToken}`);
      const accountsData = await accountsRes.json();

      if (accountsData?.data && Array.isArray(accountsData.data) && accountsData.data.length > 0) {
        const pages = accountsData.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category || 'Facebook Page',
          picture: p.picture?.data?.url || '',
          pageToken: p.access_token,
          tasks: p.tasks || [],
        }));

        return NextResponse.json({
          success: true,
          tokenType: 'USER',
          pagesCount: pages.length,
          pages,
          message: `${pages.length}টি ফেসবুক পেজ পাওয়া গেছে`,
        });
      }

      // 3. If /me/accounts didn't return pages, it might be a Page Access Token directly
      // Let's check /me with the token
      let pId = debugData?.profile_id || '';
      let pName = 'Facebook Page';
      let pCategory = 'Business Page';
      let pPic = '';

      try {
        const meRes = await fetch(`https://graph.facebook.com/v20.0/me?fields=id,name,category,picture&access_token=${cleanToken}`);
        const meData = await meRes.json();
        if (meData?.id) {
          pId = meData.id;
          pName = meData.name || pName;
          pCategory = meData.category || pCategory;
          pPic = meData.picture?.data?.url || '';
        }
      } catch (meErr) {
        console.warn('[Me Query Warning]:', meErr);
      }

      if (pId || cleanToken.startsWith('EAA')) {
        return NextResponse.json({
          success: true,
          tokenType: 'PAGE',
          pagesCount: 1,
          pages: [
            {
              id: pId || 'facebook_page',
              name: pName || 'Facebook Page',
              category: pCategory,
              picture: pPic,
              pageToken: cleanToken,
            },
          ],
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: accountsData?.error?.message || 'টোকেনটি দিয়ে ফেসবুক পেজ খুঁজে পাওয়া যায়নি। দয়া করে সঠিক টোকেন বা পারমিশন চেক করুন।',
        },
        { status: 400 },
      );
    }

    // ACTION 2: CONNECT SPECIFIC PAGE
    if (action === 'connect_page' || (pageId && pageToken)) {
      const targetPageId = (pageId || '').trim();
      const targetPageToken = (pageToken || '').trim();
      const targetPageName = (pageName || 'Facebook Page').trim();

      if (!targetPageId || !targetPageToken) {
        return NextResponse.json({ success: false, error: 'Page ID এবং Page Access Token আবশ্যক' }, { status: 400 });
      }

      // 1. Subscribe Page to Webhook in Meta API
      let webhookSubscribed = false;
      let subscriptionDetails = null;
      try {
        const subRes = await fetch(
          `https://graph.facebook.com/v20.0/me/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_reads,message_deliveries&access_token=${targetPageToken}`,
          { method: 'POST' },
        );
        const subData = await subRes.json();
        subscriptionDetails = subData;
        if (subData?.success) {
          webhookSubscribed = true;
        }
      } catch (subErr) {
        console.error('[Meta Subscribed Apps Exception]:', subErr);
      }

      // 2. Get current user's organizationId
      const currentUser = await getCurrentUser(request);
      const userOrgId = currentUser?.organizationId || orgId || 'org-1';

      // 3. Save ChannelConnection per org (so webhook can route to correct dashboard)
      await upsertDbChannelConnection(userOrgId, {
        platform: 'FACEBOOK_MESSENGER',
        pageId: targetPageId,
        pageName: targetPageName,
        accessToken: targetPageToken,
      });

      // 4. Update BotSettings in Neon DB (global fallback for org-1)
      if (userOrgId === 'org-1') {
        await updateBotSettings({
          fbPageId: targetPageId,
          fbPageToken: targetPageToken,
          fbPageName: targetPageName,
        });
      } else {
        // For non-default orgs, store settings in their org-scoped BotSettings
        try {
          const sql = getSql();
          await sql`
            INSERT INTO "BotSettings" ("id", "storeId", "organizationId", "fbPageId", "fbPageToken", "fbPageName", "updatedAt")
            VALUES (${`settings-${userOrgId}`}, ${`store-${userOrgId}`}, ${userOrgId}, ${targetPageId}, ${targetPageToken}, ${targetPageName}, NOW())
            ON CONFLICT ("id") DO UPDATE SET
              "fbPageId" = EXCLUDED."fbPageId",
              "fbPageToken" = EXCLUDED."fbPageToken",
              "fbPageName" = EXCLUDED."fbPageName",
              "updatedAt" = NOW();
          `;
        } catch (botErr) {
          console.warn('[BotSettings upsert for new org warning]:', botErr);
        }
      }

      // 5. Also update Store record if available
      try {
        const sql = getSql();
        await sql`
          UPDATE "Store"
          SET "fbPageId" = ${targetPageId}, "updatedAt" = NOW()
          WHERE "id" = ${`store-${userOrgId}`} OR "id" = 'store-1';
        `;
      } catch (storeErr) {
        console.warn('[Store Update fbPageId Warning]:', storeErr);
      }

      return NextResponse.json({
        success: true,
        message: `🎉 '${targetPageName}' পেজটি সফলভাবে কানেক্ট ও সাবস্ক্রাইব করা হয়েছে!`,
        page: {
          id: targetPageId,
          name: targetPageName,
        },
        webhookSubscribed,
        subscriptionDetails,
      });
    }

    return NextResponse.json({ success: false, error: 'অজানা অ্যাকশন অনুরোধ' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/facebook/connect Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'সার্ভারে অভ্যন্তরীণ ত্রুটি হয়েছে' }, { status: 500 });
  }
}
