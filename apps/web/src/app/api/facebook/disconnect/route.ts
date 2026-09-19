import { NextRequest, NextResponse } from 'next/server';
import { updateBotSettings, getSql } from '@/lib/db';

import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';

    await updateBotSettings({
      fbPageId: '',
      fbPageToken: '',
      fbPageName: '',
    }, orgId);

    try {
      const sql = getSql();
      // Disconnect ChannelConnection
      await sql`
        UPDATE "ChannelConnection"
        SET "status" = 'DISCONNECTED', "accessToken" = '', "updatedAt" = NOW()
        WHERE "organizationId" = ${orgId} AND "platform" = 'FACEBOOK_MESSENGER';
      `;

      // Update Store record
      await sql`
        UPDATE "Store"
        SET "fbPageId" = NULL, "updatedAt" = NOW()
        WHERE "id" = ${`store-${orgId}`} OR (${orgId} = 'org-1' AND "id" = 'store-1');
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
