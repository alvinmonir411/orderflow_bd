import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, updateBotSettings, upsertDbChannelConnection } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ─── Master WAAPI credentials (OrderFlow BD's own account) ───────────────────
// Set WAAPI_MASTER_TOKEN in your .env / Vercel environment variables
// This is YOUR waapi.app API token — merchants never need their own account
const MASTER_TOKEN = process.env.WAAPI_MASTER_TOKEN || process.env.WAAPI_API_TOKEN || '';

// ─── Helper: get or auto-create a WAAPI instance for this org ────────────────
async function getOrCreateInstance(orgId: string, settings: any): Promise<{ instanceId: string; token: string } | null> {
  const token = MASTER_TOKEN || settings.waapiApiToken || settings.whatsappToken || '';
  if (!token) return null;

  // If this org already has an instance, reuse it
  const existingId = settings.waapiInstanceId || (orgId === 'org-1' ? process.env.WAAPI_INSTANCE_ID || '' : '');
  if (existingId) return { instanceId: existingId, token };

  // Auto-create a new WAAPI instance for this merchant
  try {
    const res = await fetch('https://waapi.app/api/v1/instances', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({ name: `OrderFlow-${orgId}` }),
    });
    const data = await res.json();
    const newInstanceId = data?.data?.id || data?.id || null;

    if (newInstanceId) {
      // Persist the new instance ID so we reuse it next time
      await updateBotSettings({ waapiInstanceId: String(newInstanceId), waapiApiToken: token, whatsappProvider: 'WAAPI' }, orgId);
      return { instanceId: String(newInstanceId), token };
    }
  } catch (err) {
    console.warn('[WAAPI auto-create instance warning]:', err);
  }

  return null;
}

// ─── GET: return QR code or connection status ─────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';
    const settings = await getBotSettings(orgId);

    const creds = await getOrCreateInstance(orgId, settings);

    if (!creds) {
      // No master token configured — fall back to manual setup
      return NextResponse.json({
        status: 'SETUP_NEEDED',
        message: 'WAAPI টোকেন কনফিগার করা নেই। অ্যাডমিন প্যানেলে WAAPI_MASTER_TOKEN সেট করুন।',
      });
    }

    const { instanceId, token } = creds;

    // 1. Check if already connected
    try {
      const meRes = await fetch(`https://waapi.app/api/v1/instances/${instanceId}/client/me`, {
        headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
      });
      const meData = await meRes.json();

      if (meRes.ok && meData?.data?.wid?.user) {
        const phone = meData.data.wid.user;
        const pushname = meData.data.pushname || '';

        if (!settings.whatsappConnected || settings.whatsappPhone !== phone) {
          await updateBotSettings({ whatsappConnected: true, whatsappProvider: 'WAAPI', whatsappPhone: phone, waapiInstanceId: instanceId, waapiApiToken: token }, orgId);
          try { await upsertDbChannelConnection(orgId, { platform: 'WHATSAPP', pageId: instanceId, pageName: pushname || phone, accessToken: token }); } catch {}
        }

        return NextResponse.json({ status: 'CONNECTED', phone, pushname, instanceId });
      }
    } catch {}

    // 2. Start the instance (wake it up if sleeping)
    try {
      await fetch(`https://waapi.app/api/v1/instances/${instanceId}/client/action/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', accept: 'application/json' },
      });
      await new Promise((r) => setTimeout(r, 2000));
    } catch {}

    // 3. Fetch QR code
    try {
      const qrRes = await fetch(`https://waapi.app/api/v1/instances/${instanceId}/client/qr`, {
        headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
      });
      const qrData = await qrRes.json();

      const qrCode =
        qrData?.data?.qrCode?.base64 ||
        qrData?.data?.qrCode ||
        qrData?.data?.qr ||
        qrData?.qrCode ||
        null;

      if (qrCode) {
        return NextResponse.json({ status: 'SCAN_QR_CODE', qrCode, instanceId });
      }

      // Fallback action endpoint
      const actionRes = await fetch(`https://waapi.app/api/v1/instances/${instanceId}/client/action/get-qr-code`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', accept: 'application/json' },
      });
      const actionData = await actionRes.json();
      const actionQr =
        actionData?.data?.qrCode?.base64 ||
        actionData?.data?.qrCode ||
        actionData?.data?.qr ||
        null;

      if (actionQr) {
        return NextResponse.json({ status: 'SCAN_QR_CODE', qrCode: actionQr, instanceId });
      }

      return NextResponse.json({ status: 'WAITING_FOR_QR', message: 'QR কোড তৈরি হচ্ছে...' });
    } catch (err: any) {
      return NextResponse.json({ status: 'ERROR', error: 'QR লোড করতে সমস্যা হয়েছে' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ status: 'ERROR', error: error.message }, { status: 500 });
  }
}

// ─── POST: manually save custom WAAPI credentials (advanced/optional) ─────────
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';
    const { instanceId, token } = await request.json();

    if (!instanceId || !token) {
      return NextResponse.json({ success: false, error: 'Instance ID ও Token আবশ্যক' }, { status: 400 });
    }

    await updateBotSettings({
      waapiInstanceId: String(instanceId).trim(),
      waapiApiToken: String(token).trim(),
      whatsappToken: String(token).trim(),
      whatsappProvider: 'WAAPI',
    }, orgId);

    return NextResponse.json({ success: true, message: 'সেভ হয়েছে, QR লোড হচ্ছে...' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
