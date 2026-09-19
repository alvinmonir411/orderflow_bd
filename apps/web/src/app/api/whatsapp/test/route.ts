import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';

    const body = await request.json();
    const { phone, message } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'টেস্ট মেসেজ পাঠানোর জন্য ফোন নম্বর লিখুন' },
        { status: 400 }
      );
    }

    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      return NextResponse.json(
        { success: false, error: 'সঠিক ১১ ডিজিটের ফোন নম্বর দিন (যেমন: 017XXXXXXXX)' },
        { status: 400 }
      );
    }

    const formattedPhone = clean.startsWith('88') ? clean : clean.startsWith('0') ? `88${clean}` : `880${clean}`;
    const testText =
      (message || '').trim() ||
      '🌸 OrderFlow BD টেস্ট মেসেজ: আপনার WhatsApp ইন্টিগ্রেশন ও সেলস বট সফলভাবে সংযুক্ত এবং সক্রিয় রয়েছে! 🎉';

    const settings = await getBotSettings(orgId);
    const provider = settings.whatsappProvider || 'META';

    // 1. Send via Meta WhatsApp Cloud API
    if (provider === 'META') {
      const phoneId = settings.whatsappPhoneId || (orgId === 'org-1' ? process.env.WHATSAPP_PHONE_NUMBER_ID || '' : '');
      const token = settings.whatsappToken || (orgId === 'org-1' ? process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN || '' : '');

      if (!phoneId || !token) {
        return NextResponse.json(
          { success: false, error: 'Meta WhatsApp Phone ID অথবা Access Token কনফিগার করা নেই' },
          { status: 400 }
        );
      }

      const metaRes = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: { preview_url: false, body: testText },
        }),
      });

      const metaData = await metaRes.json();
      if (metaRes.ok && metaData.messages?.[0]?.id) {
        return NextResponse.json({
          success: true,
          message: `টেস্ট মেসেজ সফলভাবে ${formattedPhone} নম্বরে পাঠানো হয়েছে!`,
          messageId: metaData.messages[0].id,
        });
      } else {
        const errorMsg = metaData.error?.message || 'মেটা এপিআই ত্রুটি ফেরত পাঠিয়েছে';
        return NextResponse.json(
          {
            success: false,
            error: `মেটা বার্তা পাঠাতে পারেনি: ${errorMsg}. মনে রাখবেন, ট্রায়াল নম্বরে পাঠানোর আগে নম্বরটি Meta App এ Recipient হিসেবে যোগ থাকতে হয়।`,
          },
          { status: 400 }
        );
      }
    }

    // 2. Send via WAAPI
    if (provider === 'WAAPI') {
      const instanceId = settings.waapiInstanceId || (orgId === 'org-1' ? process.env.WAAPI_INSTANCE_ID || '' : '');
      const token = settings.waapiApiToken || settings.whatsappToken || (orgId === 'org-1' ? process.env.WAAPI_API_TOKEN || process.env.WHATSAPP_TOKEN || '' : '');

      if (!instanceId || !token) {
        return NextResponse.json(
          { success: false, error: 'WAAPI Instance ID অথবা API Token কনফিগার করা নেই' },
          { status: 400 }
        );
      }

      const chatId = `${formattedPhone}@c.us`;
      const url = `https://waapi.app/api/v1/instances/${instanceId}/client/action/send-message`;

      const waRes = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          chatId,
          message: testText,
        }),
      });

      const waData = await waRes.json();
      if (waRes.ok) {
        return NextResponse.json({
          success: true,
          message: `WAAPI টেস্ট মেসেজ সফলভাবে ${chatId} এ পাঠানো হয়েছে!`,
          data: waData,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: `WAAPI ত্রুটি: ${waData.message || 'মেসেজ পাঠানো সম্ভব হয়নি'}`,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: false, error: 'অজানা WhatsApp প্রোভাইডার' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/whatsapp/test Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
