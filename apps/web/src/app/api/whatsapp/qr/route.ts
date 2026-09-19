import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, updateBotSettings, upsertDbChannelConnection } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';

    const settings = await getBotSettings(orgId);

    const instanceId =
      settings.waapiInstanceId ||
      (orgId === 'org-1' ? process.env.WAAPI_INSTANCE_ID || '' : '');
    const token =
      settings.waapiApiToken ||
      settings.whatsappToken ||
      (orgId === 'org-1' ? process.env.WAAPI_API_TOKEN || process.env.WHATSAPP_TOKEN || '' : '');

    // If no instance credentials configured yet
    if (!instanceId || !token) {
      return NextResponse.json({
        status: 'SETUP_NEEDED',
        message: 'WAAPI Instance ID এবং API Token কনফিগার করা নেই।',
        instanceId: instanceId || '',
        hasToken: Boolean(token),
      });
    }

    // 1. Check if the instance is ALREADY CONNECTED via WAAPI
    try {
      const meRes = await fetch(`https://waapi.app/api/v1/instances/${instanceId}/client/me`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          accept: 'application/json',
        },
      });

      const meData = await meRes.json();
      if (meRes.ok && meData?.data?.wid?.user) {
        const phone = meData.data.wid.user;
        const pushname = meData.data.pushname || 'WhatsApp User';

        // Auto-save connected status in database
        if (!settings.whatsappConnected || settings.whatsappPhone !== phone) {
          await updateBotSettings(
            {
              whatsappConnected: true,
              whatsappProvider: 'WAAPI',
              whatsappPhone: phone,
            },
            orgId
          );

          try {
            await upsertDbChannelConnection(orgId, {
              platform: 'WHATSAPP',
              pageId: instanceId,
              pageName: pushname || phone,
              accessToken: token,
            });
          } catch {}
        }

        return NextResponse.json({
          status: 'CONNECTED',
          phone,
          pushname,
          instanceId,
          message: `🎉 WhatsApp (${phone}) সফলভাবে সংযুক্ত রয়েছে!`,
        });
      }
    } catch (meErr) {
      console.warn('[WAAPI Client Me Check Warning]:', meErr);
    }

    // 2. If not connected, fetch the Live QR Code from WAAPI
    try {
      const qrRes = await fetch(`https://waapi.app/api/v1/instances/${instanceId}/client/qr`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          accept: 'application/json',
        },
      });

      const qrData = await qrRes.json();

      if (qrRes.ok && qrData?.data?.qrCode) {
        const qrBase64 = qrData.data.qrCode.base64 || qrData.data.qrCode;
        return NextResponse.json({
          status: 'SCAN_QR_CODE',
          qrCode: qrBase64,
          instanceId,
          message: 'লাইভ QR কোড প্রস্তুত। আপনার ফোনের WhatsApp দিয়ে স্ক্যান করুন।',
        });
      }

      // Alternative WAAPI endpoint: get-qr-code action
      const actionQrRes = await fetch(
        `https://waapi.app/api/v1/instances/${instanceId}/client/action/get-qr-code`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        }
      );
      const actionData = await actionQrRes.json();
      if (actionQrRes.ok && actionData?.data?.qrCode) {
        const qrBase64 = actionData.data.qrCode.base64 || actionData.data.qrCode;
        return NextResponse.json({
          status: 'SCAN_QR_CODE',
          qrCode: qrBase64,
          instanceId,
          message: 'লাইভ QR কোড প্রস্তুত। আপনার ফোনের WhatsApp দিয়ে স্ক্যান করুন।',
        });
      }

      return NextResponse.json({
        status: 'WAITING_FOR_QR',
        message: qrData?.message || 'QR কোড লোড হচ্ছে, অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন...',
        instanceId,
      });
    } catch (qrErr: any) {
      console.error('[WAAPI QR Fetch Error]:', qrErr);
      return NextResponse.json(
        { status: 'ERROR', error: qrErr.message || 'QR কোড লোড করতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[API /api/whatsapp/qr Error]:', error);
    return NextResponse.json({ status: 'ERROR', error: error.message }, { status: 500 });
  }
}

// Save or Update WAAPI Instance directly from QR Modal
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';

    const body = await request.json();
    const { instanceId, token } = body;

    if (!instanceId || !token) {
      return NextResponse.json(
        { success: false, error: 'Instance ID এবং API Token আবশ্যক' },
        { status: 400 }
      );
    }

    const cleanInstance = String(instanceId).trim();
    const cleanToken = String(token).trim();

    await updateBotSettings(
      {
        waapiInstanceId: cleanInstance,
        waapiApiToken: cleanToken,
        whatsappToken: cleanToken,
        whatsappProvider: 'WAAPI',
      },
      orgId
    );

    return NextResponse.json({
      success: true,
      message: 'WAAPI ক্রেডেনশিয়াল সেভ হয়েছে। এখন QR কোড লোড হচ্ছে...',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
