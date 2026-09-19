import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';

    const settings = await getBotSettings(orgId);

    const provider = settings.whatsappProvider || 'META';
    const phone = settings.whatsappPhone || '';
    const phoneId = settings.whatsappPhoneId || (orgId === 'org-1' ? process.env.WHATSAPP_PHONE_NUMBER_ID || '' : '');
    const token = settings.whatsappToken || (orgId === 'org-1' ? process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN || '' : '');
    const businessId = settings.whatsappBusinessId || '';
    const instanceId = settings.waapiInstanceId || (orgId === 'org-1' ? process.env.WAAPI_INSTANCE_ID || '' : '');
    const waapiToken = settings.waapiApiToken || (orgId === 'org-1' ? process.env.WAAPI_API_TOKEN || '' : '');

    // IMPORTANT: Only trust the explicit `whatsappConnected` flag.
    // Do NOT infer connected state from env-var tokens — those persist after disconnect.
    const isConnected = Boolean(settings.whatsappConnected);

    let displayPhoneNumber = phone;
    let verifiedName = '';
    let isValidToken = false;

    // Check Meta Graph API if Meta Cloud API is chosen
    if (provider === 'META' && phoneId && token && token.length > 10) {
      try {
        const metaRes = await fetch(
          `https://graph.facebook.com/v21.0/${phoneId}?fields=display_phone_number,verified_name,code_verification_status&access_token=${token.trim()}`
        );
        const metaData = await metaRes.json();
        if (metaRes.ok && metaData?.id) {
          isValidToken = true;
          if (metaData.display_phone_number) displayPhoneNumber = metaData.display_phone_number;
          if (metaData.verified_name) verifiedName = metaData.verified_name;
        }
      } catch (metaErr) {
        console.warn('[WhatsApp Status Meta Check Warning]:', metaErr);
      }
    }

    // Check WAAPI instance status if WAAPI is chosen
    if (provider === 'WAAPI' && instanceId && (waapiToken || token)) {
      try {
        const activeWaToken = waapiToken || token;
        const waapiRes = await fetch(`https://waapi.app/api/v1/instances/${instanceId}/client/me`, {
          headers: {
            Authorization: `Bearer ${activeWaToken.trim()}`,
            accept: 'application/json',
          },
        });
        const waapiData = await waapiRes.json();
        if (waapiRes.ok && waapiData?.data) {
          isValidToken = true;
          if (waapiData.data?.wid?.user) {
            displayPhoneNumber = waapiData.data.wid.user;
          }
          if (waapiData.data?.pushname) {
            verifiedName = waapiData.data.pushname;
          }
        }
      } catch (waapiErr) {
        console.warn('[WhatsApp Status Waapi Check Warning]:', waapiErr);
      }
    }

    const origin = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'https://orderflowbd.vercel.app';

    return NextResponse.json({
      connected: isConnected,
      provider,
      phone: displayPhoneNumber || phone,
      displayPhoneNumber: displayPhoneNumber || phone,
      verifiedName,
      phoneId,
      businessId,
      instanceId,
      hasToken: Boolean(token || waapiToken),
      isValidToken,
      webhookUrl: `${origin}/webhooks/whatsapp`,
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'orderflow_bd_secure_verify_2026',
    });
  } catch (error: any) {
    console.error('[API /api/whatsapp/status Error]:', error);
    return NextResponse.json({ connected: false, error: error.message }, { status: 500 });
  }
}
