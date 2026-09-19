import { NextRequest, NextResponse } from 'next/server';
import { updateBotSettings, getBotSettings, getSql, upsertDbChannelConnection } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';

    const body = await request.json();
    const {
      action,
      token,
      provider = 'META',
      whatsappPhoneId,
      whatsappToken,
      whatsappPhone,
      whatsappBusinessId,
      waapiInstanceId,
      waapiApiToken,
    } = body;

    // ACTION 1: DISCOVER WHATSAPP NUMBERS VIA 1-CLICK POPUP
    if (action === 'discover_numbers' || (!action && token && !whatsappPhoneId && !waapiInstanceId)) {
      const cleanToken = (token || whatsappToken || '').trim();
      if (!cleanToken) {
        return NextResponse.json({ success: false, error: 'অনুগ্রহ করে অ্যাক্সেস টোকেন দিন' }, { status: 400 });
      }

      const discoveredNumbers: any[] = [];

      // 1. Check Meta Businesses -> Owned WhatsApp Business Accounts -> Phone Numbers
      try {
        const bizRes = await fetch(
          `https://graph.facebook.com/v21.0/me/businesses?fields=id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,code_verification_status,quality_rating}}&access_token=${cleanToken}`
        );
        const bizData = await bizRes.json();

        if (bizData?.data && Array.isArray(bizData.data)) {
          for (const biz of bizData.data) {
            const wabas = biz.owned_whatsapp_business_accounts?.data || [];
            for (const waba of wabas) {
              const phones = waba.phone_numbers?.data || [];
              for (const p of phones) {
                discoveredNumbers.push({
                  phoneId: p.id,
                  displayPhoneNumber: p.display_phone_number || '',
                  verifiedName: p.verified_name || biz.name || 'WhatsApp Business',
                  wabaId: waba.id,
                  wabaName: waba.name,
                  businessName: biz.name,
                  token: cleanToken,
                });
              }
            }
          }
        }
      } catch (bizErr) {
        console.warn('[WhatsApp Discover Businesses Warning]:', bizErr);
      }

      // 2. Also check client_whatsapp_business_accounts
      try {
        const clientWabaRes = await fetch(
          `https://graph.facebook.com/v21.0/me/client_whatsapp_business_accounts?fields=id,name,phone_numbers{id,display_phone_number,verified_name}&access_token=${cleanToken}`
        );
        const cData = await clientWabaRes.json();
        if (cData?.data && Array.isArray(cData.data)) {
          for (const waba of cData.data) {
            const phones = waba.phone_numbers?.data || [];
            for (const p of phones) {
              if (!discoveredNumbers.some((d) => d.phoneId === p.id)) {
                discoveredNumbers.push({
                  phoneId: p.id,
                  displayPhoneNumber: p.display_phone_number || '',
                  verifiedName: p.verified_name || waba.name || 'WhatsApp Business',
                  wabaId: waba.id,
                  wabaName: waba.name,
                  token: cleanToken,
                });
              }
            }
          }
        }
      } catch (clientErr) {
        console.warn('[WhatsApp Discover Client WABA Warning]:', clientErr);
      }

      // 3. Fallback: If token has profile_id directly
      if (discoveredNumbers.length === 0) {
        try {
          const debugRes = await fetch(
            `https://graph.facebook.com/debug_token?input_token=${cleanToken}&access_token=${cleanToken}`
          );
          const dData = await debugRes.json();
          if (dData?.data?.profile_id) {
            try {
              const phoneRes = await fetch(
                `https://graph.facebook.com/v21.0/${dData.data.profile_id}?fields=display_phone_number,verified_name&access_token=${cleanToken}`
              );
              const pData = await phoneRes.json();
              if (pData?.id) {
                discoveredNumbers.push({
                  phoneId: pData.id,
                  displayPhoneNumber: pData.display_phone_number || '',
                  verifiedName: pData.verified_name || 'WhatsApp Business',
                  token: cleanToken,
                });
              }
            } catch {}
          }
        } catch {}
      }

      return NextResponse.json({
        success: true,
        numbers: discoveredNumbers,
        count: discoveredNumbers.length,
        message:
          discoveredNumbers.length > 0
            ? `🎉 ${discoveredNumbers.length}টি WhatsApp বিজনেস নম্বর পাওয়া গেছে!`
            : 'আপনার মেটা বিজনেস অ্যাকাউন্টে কোনো WhatsApp নম্বর পাওয়া যায়নি। দয়া করে Meta Business Manager-এ WhatsApp অ্যাকাউন্ট যোগ করুন।',
      });
    }

    const currentSettings = await getBotSettings(orgId);

    // 1. META WHATSAPP CLOUD API VALIDATION
    if (provider === 'META') {
      const cleanPhoneId = (whatsappPhoneId || currentSettings.whatsappPhoneId || '').trim();
      const cleanToken = (whatsappToken || currentSettings.whatsappToken || '').trim();

      if (!cleanPhoneId) {
        return NextResponse.json(
          { success: false, error: 'অনুগ্রহ করে Meta WhatsApp Phone Number ID প্রদান করুন।' },
          { status: 400 }
        );
      }

      if (!cleanToken) {
        return NextResponse.json(
          { success: false, error: 'অনুগ্রহ করে Meta WhatsApp Access Token প্রদান করুন।' },
          { status: 400 }
        );
      }

      let detectedPhone = (whatsappPhone || currentSettings.whatsappPhone || '').trim();
      let verifiedName = '';

      // Test against Meta Graph API
      try {
        const testRes = await fetch(
          `https://graph.facebook.com/v21.0/${cleanPhoneId}?fields=display_phone_number,verified_name,code_verification_status&access_token=${cleanToken}`
        );
        const testData = await testRes.json();

        if (testData.error) {
          console.error('[Meta WhatsApp Connect Validation Error]:', testData.error);
          return NextResponse.json(
            {
              success: false,
              error: `Meta ভেরিফিকেশন ব্যর্থ: ${testData.error.message || 'Phone Number ID বা Access Token সঠিক নয়'}`,
            },
            { status: 400 }
          );
        }

        if (testData.display_phone_number) {
          detectedPhone = testData.display_phone_number;
        }
        if (testData.verified_name) {
          verifiedName = testData.verified_name;
        }
      } catch (graphErr: any) {
        console.warn('[Meta Graph API Ping Exception]:', graphErr);
      }

      // Save to database
      await updateBotSettings(
        {
          whatsappConnected: true,
          whatsappProvider: 'META',
          whatsappPhoneId: cleanPhoneId,
          whatsappToken: cleanToken,
          whatsappPhone: detectedPhone,
          whatsappBusinessId: (whatsappBusinessId || currentSettings.whatsappBusinessId || '').trim(),
        },
        orgId
      );

      // Upsert ChannelConnection record
      try {
        await upsertDbChannelConnection(orgId, {
          platform: 'WHATSAPP',
          pageId: cleanPhoneId,
          pageName: verifiedName || detectedPhone || 'WhatsApp Business',
          accessToken: cleanToken,
        });
      } catch (connErr) {
        console.warn('[ChannelConnection Upsert Warning]:', connErr);
      }

      return NextResponse.json({
        success: true,
        message: `🎉 WhatsApp (${detectedPhone || cleanPhoneId}) সফলভাবে কানেক্ট করা হয়েছে!`,
        phone: detectedPhone,
        verifiedName,
      });
    }

    // 2. WAAPI (QR CODE / INSTANCE) VALIDATION
    if (provider === 'WAAPI') {
      const cleanInstanceId = (waapiInstanceId || currentSettings.waapiInstanceId || '').trim();
      const cleanToken = (waapiApiToken || whatsappToken || currentSettings.waapiApiToken || currentSettings.whatsappToken || '').trim();

      if (!cleanInstanceId || !cleanToken) {
        return NextResponse.json(
          { success: false, error: 'WAAPI Instance ID এবং API Token উভয়ই আবশ্যক।' },
          { status: 400 }
        );
      }

      let detectedPhone = (whatsappPhone || currentSettings.whatsappPhone || '').trim();

      // Test against WAAPI client
      try {
        const waapiRes = await fetch(`https://waapi.app/api/v1/instances/${cleanInstanceId}/client/me`, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            accept: 'application/json',
          },
        });
        const waapiData = await waapiRes.json();
        if (waapiRes.ok && waapiData?.data?.wid?.user) {
          detectedPhone = waapiData.data.wid.user;
        }
      } catch (waErr) {
        console.warn('[WAAPI Client Test Exception]:', waErr);
      }

      await updateBotSettings(
        {
          whatsappConnected: true,
          whatsappProvider: 'WAAPI',
          waapiInstanceId: cleanInstanceId,
          waapiApiToken: cleanToken,
          whatsappToken: cleanToken,
          whatsappPhone: detectedPhone,
        },
        orgId
      );

      return NextResponse.json({
        success: true,
        message: `🎉 WAAPI WhatsApp Instance (${cleanInstanceId}) সফলভাবে সংযুক্ত হয়েছে!`,
        phone: detectedPhone,
      });
    }

    return NextResponse.json({ success: false, error: 'অপ্রত্যাশিত প্রোভাইডার নির্বাচন করা হয়েছে' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/whatsapp/connect Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
