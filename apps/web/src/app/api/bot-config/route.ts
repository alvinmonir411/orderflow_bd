import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), '.bot-config.json');

export async function GET() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error('Error reading config', err);
  }
  return NextResponse.json({
    fbPageId: process.env.DEFAULT_FACEBOOK_PAGE_ID || '',
    fbPageToken: process.env.DEFAULT_FACEBOOK_PAGE_TOKEN || '',
    geminiApiKey: process.env.GEMINI_API_KEY || (global as any).__BOT_CONFIG__?.geminiApiKey || '',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(body, null, 2), 'utf-8');
    } catch (e) {
      // In read-only serverless environment, store globally in process memory
      (global as any).__BOT_CONFIG__ = body;
    }
    return NextResponse.json({ success: true, message: 'Configuration saved' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
