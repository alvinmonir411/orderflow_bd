import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, getSql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerPhone, psid, message, channel } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'মেসেজ খালি হতে পারবে না' }, { status: 400 });
    }

    const settings = await getBotSettings();
    const pageToken = settings.fbPageToken || process.env.DEFAULT_FACEBOOK_PAGE_TOKEN;

    const sql = getSql();
    let targetPsid = psid;

    // If PSID not provided directly, lookup from Database by orderId or customerPhone
    if (!targetPsid && (orderId || customerPhone)) {
      try {
        if (orderId) {
          const rows = await sql`
            SELECT c.psid 
            FROM "Order" o
            LEFT JOIN "Customer" c ON o."customerId" = c.id
            WHERE o.id = ${orderId} OR o."orderNumber"::text = ${String(orderId)}
            LIMIT 1;
          `;
          if (rows.length > 0 && rows[0].psid) {
            targetPsid = rows[0].psid;
          }
        }

        if (!targetPsid && customerPhone) {
          const custRows = await sql`
            SELECT psid FROM "Customer" 
            WHERE phone = ${customerPhone} AND psid IS NOT NULL AND psid != ''
            LIMIT 1;
          `;
          if (custRows.length > 0 && custRows[0].psid) {
            targetPsid = custRows[0].psid;
          }
        }

        if (!targetPsid) {
          const anyCust = await sql`
            SELECT psid FROM "Customer" 
            WHERE psid IS NOT NULL AND psid != ''
            ORDER BY "updatedAt" DESC 
            LIMIT 1;
          `;
          if (anyCust.length > 0 && anyCust[0].psid) {
            targetPsid = anyCust[0].psid;
          }
        }
      } catch (dbErr) {
        console.error('[DB PSID Lookup Error]:', dbErr);
      }
    }

    let fbSent = false;
    let fbError = null;

    // Send via Facebook Messenger Graph API
    if (targetPsid && pageToken) {
      try {
        const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${pageToken.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: targetPsid },
            message: { text: message.trim() },
            messaging_type: 'RESPONSE',
          }),
        });

        const data = await res.json();
        if (res.ok && data.message_id) {
          fbSent = true;
        } else {
          fbError = data.error?.message || 'Meta API returned error';
          console.error('[FB Send Message Error]:', data);
        }
      } catch (err: any) {
        fbError = err.message;
        console.error('[FB Fetch Error]:', err);
      }
    }

    // Send via WhatsApp (Official Meta WhatsApp Cloud API or Waapi)
    let waSent = false;
    const cleanPhone = (customerPhone || targetPsid || '').replace(/[^0-9]/g, '');
    if ((channel === 'WHATSAPP' || !targetPsid) && cleanPhone && cleanPhone.length >= 10) {
      const formattedPhone = cleanPhone.startsWith('88') ? cleanPhone : cleanPhone.startsWith('0') ? `88${cleanPhone}` : `880${cleanPhone}`;
      
      // 1. Check if Meta WhatsApp Cloud API is configured
      const metaPhoneId = settings.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
      const metaToken = settings.whatsappToken || process.env.WHATSAPP_ACCESS_TOKEN || '';
      const isMetaProvider = settings.whatsappProvider === 'META' || (metaPhoneId && metaToken?.startsWith('EAA'));

      if (isMetaProvider && metaPhoneId && metaToken) {
        try {
          const metaRes = await fetch(`https://graph.facebook.com/v21.0/${metaPhoneId}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${metaToken.trim()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: formattedPhone,
              type: 'text',
              text: { preview_url: false, body: message.trim() },
            }),
          });
          const metaData = await metaRes.json();
          if (metaRes.ok && metaData.messages?.[0]?.id) {
            waSent = true;
          } else {
            console.error('[Meta WhatsApp Cloud API Error]:', metaData);
          }
        } catch (metaErr) {
          console.error('[Meta WhatsApp Send Fetch Error]:', metaErr);
        }
      }

      // 2. Fallback to Waapi if Meta Cloud API wasn't used or succeeded
      if (!waSent) {
        const instanceId = settings.waapiInstanceId || '104344';
        const token = settings.waapiApiToken || settings.whatsappToken || 'KhHNKuRBXDQ871SPnIPHle3cRZnb9cB5tuzhEMGEc945dcca';
        const chatId = `${formattedPhone}@c.us`;

        if (instanceId && token) {
          try {
            const url = `https://waapi.app/api/v1/instances/${instanceId}/client/action/send-message`;
            let waRes = await fetch(url, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                accept: 'application/json',
              },
              body: JSON.stringify({
                chatId,
                message: message.trim(),
              }),
            });
            let waData = await waRes.json();
            if (waRes.ok) {
              waSent = true;
            } else if (waData.message && waData.message.includes('Your trial instance is only able to send actions to')) {
              const match = waData.message.match(/([0-9]+@c\.us)/);
              if (match && match[1]) {
                waRes = await fetch(url, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                  },
                  body: JSON.stringify({
                    chatId: match[1],
                    message: message.trim(),
                  }),
                });
                waData = await waRes.json();
                if (waRes.ok) waSent = true;
              }
            }
          } catch (waErr) {
            console.error('[Waapi Manual Send Error]:', waErr);
          }
        }
      }
    }

    // Persist admin reply to ChatMessage table in Neon DB
    try {
      const { saveDbChatMessage } = await import('@/lib/db');
      await saveDbChatMessage({
        senderId: targetPsid || (cleanPhone ? `${cleanPhone}@c.us` : 'admin'),
        customerName: 'গ্রাহক',
        sender: 'admin',
        text: message.trim(),
        channel: channel === 'WHATSAPP' || waSent ? 'WHATSAPP' : 'FACEBOOK_MESSENGER',
      });
    } catch (saveErr) {
      console.error('[Save Admin Chat Message Error]:', saveErr);
    }

    // Save note to Order in database
    if (orderId) {
      try {
        const noteEntry = `[${new Date().toLocaleTimeString('bn-BD')}] সেন্ট মেসেজ (${channel || (waSent ? 'WhatsApp' : 'Messenger')}): "${message.trim()}"`;
        await sql`
          UPDATE "Order"
          SET notes = COALESCE(notes || E'\n', '') || ${noteEntry},
              "updatedAt" = NOW()
          WHERE id = ${orderId} OR "orderNumber"::text = ${String(orderId)};
        `;
      } catch (noteErr) {
        console.error('[Save Note Error]:', noteErr);
      }
    }

    return NextResponse.json({
      success: true,
      deliveredToMessenger: fbSent,
      deliveredToWhatsApp: waSent,
      targetPsid: targetPsid || null,
      message: (fbSent || waSent)
        ? 'গ্রাহকের কাছে সফলভাবে মেসেজ পাঠানো হয়েছে! 🚀'
        : 'মেসেজটি সফলভাবে রেকর্ড করা হয়েছে এবং গ্রাহকের অর্ডারে সেভ হয়েছে!',
      warning: (!targetPsid && !waSent) ? 'মেসেজটি হিস্ট্রিতে সেভ করা হয়েছে।' : fbError,
    });
  } catch (error: any) {
    console.error('[API /api/send-message Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
