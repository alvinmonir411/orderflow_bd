import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_PATH = path.join(process.cwd(), '.bot-config.json');
const TMP_CONFIG_PATH = path.join(os.tmpdir(), 'orderflow_bot_config.json');

export function getBotConfig() {
  try {
    if (fs.existsSync(TMP_CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(TMP_CONFIG_PATH, 'utf-8'));
    }
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading bot config:', err);
  }
  return {
    fbPageId: process.env.DEFAULT_FACEBOOK_PAGE_ID || '',
    fbPageToken: process.env.DEFAULT_FACEBOOK_PAGE_TOKEN || '',
    geminiApiKey: process.env.GEMINI_API_KEY || (global as any).__BOT_CONFIG__?.geminiApiKey || '',
  };
}

export async function GET() {
  return NextResponse.json(getBotConfig());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    (global as any).__BOT_CONFIG__ = body;

    try {
      fs.writeFileSync(TMP_CONFIG_PATH, JSON.stringify(body, null, 2), 'utf-8');
    } catch (e) {}

    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(body, null, 2), 'utf-8');
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Configuration saved successfully', config: body });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

