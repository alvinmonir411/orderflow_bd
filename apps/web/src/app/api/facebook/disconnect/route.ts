import { NextRequest, NextResponse } from 'next/server';
import { updateBotSettings, getSql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await updateBotSettings({
      fbPageId: '',
      fbPageToken: '',
      fbPageName: '',
    });

    try {
      const sql = getSql();
      await sql`
        UPDATE "Store"
        SET "fbPageId" = NULL, "updatedAt" = NOW()
        WHERE "id" = 'store-1';
      `;
    } catch (e) {
      console.warn('[Disconnect Store Update Warning]:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'ফেসবুক পেজ সফলভাবে ডিসকানেক্ট করা হয়েছে',
    });
  } catch (error: any) {
    console.error('[API /api/facebook/disconnect Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
