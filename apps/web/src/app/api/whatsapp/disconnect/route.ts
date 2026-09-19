import { NextRequest, NextResponse } from 'next/server';
import { updateBotSettings, getSql } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';

    await updateBotSettings(
      {
        whatsappConnected: false,
        whatsappToken: '',
        whatsappPhoneId: '',
        whatsappPhone: '',
        whatsappBusinessId: '',
        waapiInstanceId: '',
        waapiApiToken: '',
      },
      orgId
    );

    try {
      const sql = getSql();
      await sql`
        UPDATE "ChannelConnection"
        SET "status" = 'DISCONNECTED', "updatedAt" = NOW()
        WHERE "organizationId" = ${orgId} AND "platform" = 'WHATSAPP';
      `;
    } catch (e) {
      console.warn('[Disconnect WhatsApp ChannelConnection Warning]:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp সফলভাবে ডিসকানেক্ট করা হয়েছে',
    });
  } catch (error: any) {
    console.error('[API /api/whatsapp/disconnect Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
