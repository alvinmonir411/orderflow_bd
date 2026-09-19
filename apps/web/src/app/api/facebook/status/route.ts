import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, getDbChannelConnections } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({
        connected: false,
        pageId: '',
        pageName: '',
        webhookSubscribed: false,
        message: 'কোনো ফেসবুক পেজ কানেক্ট করা নেই',
      });
    }

    const orgId = user.organizationId || 'org-1';

    let token = '';
    let pageId = '';
    let pageName = '';

    // First check ChannelConnection for this user's organization
    try {
      const conns = await getDbChannelConnections(orgId);
      const fbConn = conns.find((c: any) => c.platform === 'FACEBOOK_MESSENGER' && c.status === 'CONNECTED');
      if (fbConn && fbConn.accessToken) {
        token = fbConn.accessToken || '';
        pageId = fbConn.pageId || '';
        pageName = fbConn.pageName || '';
      }
    } catch (_) {}

    // Fallback to BotSettings for this specific organization
    if (!token) {
      const settings = await getBotSettings(orgId);
      token = settings.fbPageToken || '';
      pageId = settings.fbPageId || '';
      pageName = settings.fbPageName || '';
    }

    if (!token || token.length < 10) {
      return NextResponse.json({
        connected: false,
        pageId: '',
        pageName: '',
        webhookSubscribed: false,
        message: 'কোনো ফেসবুক পেজ কানেক্ট করা নেই',
      });
    }

    // If pageName is missing, fetch real page name from Meta Graph API
    if (!pageName || pageName === 'Facebook Page') {
      try {
        const meRes = await fetch(`https://graph.facebook.com/v20.0/me?fields=name&access_token=${token}`);
        const meData = await meRes.json();
        if (meData?.name) {
          pageName = meData.name;
        }
      } catch (e) {}
    }
    if (!pageName) {
      pageName = 'Facebook Page';
    }

    // Check Graph API live subscription
    let webhookSubscribed = false;
    let subscribedApps: any[] = [];
    let isValidToken = false;
    let tokenExpiry = null;

    try {
      const subRes = await fetch(`https://graph.facebook.com/v20.0/me/subscribed_apps?access_token=${token}`);
      const subData = await subRes.json();
      if (subData?.data && Array.isArray(subData.data)) {
        subscribedApps = subData.data;
        webhookSubscribed = subData.data.length > 0;
        isValidToken = true;
      } else if (subData?.error) {
        console.warn('[Facebook Status Graph Warning]:', subData.error);
      }
    } catch (e) {
      console.warn('[Facebook Status Check Warning]:', e);
    }

    // Also check debug_token
    try {
      const debugRes = await fetch(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`);
      const debugData = await debugRes.json();
      if (debugData?.data?.is_valid) {
        isValidToken = true;
        tokenExpiry = debugData.data.expires_at;
      }
    } catch (e) {}

    return NextResponse.json({
      connected: true,
      pageId,
      pageName,
      isValidToken,
      tokenExpiry,
      webhookSubscribed,
      subscribedFields: subscribedApps[0]?.subscribed_fields || ['messages', 'messaging_postbacks'],
      webhookUrl: 'https://orderflowbd.vercel.app/webhooks/facebook',
      verifyToken: 'orderflow_bd_verify_token',
    });
  } catch (error: any) {
    console.error('[API /api/facebook/status Error]:', error);
    return NextResponse.json({ connected: false, error: error.message }, { status: 500 });
  }
}
