import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, updateBotSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getBotSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('[API GET /bot-config Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await updateBotSettings(body);
    const updated = await getBotSettings();
    return NextResponse.json({ success: true, message: 'Settings saved successfully', config: updated });
  } catch (error: any) {
    console.error('[API POST /bot-config Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
