import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getBotSettings();
    const token = settings.fbPageToken || process.env.DEFAULT_FACEBOOK_PAGE_TOKEN || '';
    const pageId = settings.fbPageId || process.env.DEFAULT_FACEBOOK_PAGE_ID || '';
    const pageName = settings.fbPageName || (pageId === '443213442199594' ? 'FastLain' : 'Facebook Page');

    if (!token || token.length < 10) {
      return NextResponse.json({
        connected: false,
        pageId: '',
        pageName: '',
        webhookSubscribed: false,
        message: 'কোনো ফেসবুক পেজ কানেক্ট করা নেই',
      });
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
