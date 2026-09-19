import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, updateBotSettings } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';
    const settings = await getBotSettings(orgId);
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('[API GET /bot-config Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';
    const body = await request.json();
    await updateBotSettings(body, orgId);
    const updated = await getBotSettings(orgId);

    // If new Facebook Page Token provided, automatically subscribe Page to Webhooks in Meta Graph API
    if (body.fbPageToken && body.fbPageToken.trim().length > 10) {
      try {
        const subRes = await fetch(`https://graph.facebook.com/v20.0/me/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_reads,message_deliveries&access_token=${body.fbPageToken.trim()}`, {
          method: 'POST',
        });
        const subData = await subRes.json();
        console.log('[Meta Subscribed Apps Result]:', subData);
      } catch (subErr) {
        console.error('[Meta Subscribed Apps Error]:', subErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully', config: updated });
  } catch (error: any) {
    console.error('[API POST /bot-config Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
