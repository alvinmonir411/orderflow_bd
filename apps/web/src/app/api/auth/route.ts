import { NextRequest, NextResponse } from 'next/server';
import { getSql, initDatabase } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
  getCurrentUser,
  checkLoginRateLimit,
  resetLoginRateLimit,
} from '@/lib/auth';

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM OWNER (Super Admin) — private, hardcoded, NOT in demo
// Only this exact email + password grants SUPER_ADMIN access
// ─────────────────────────────────────────────────────────────────────────────
const PLATFORM_OWNER_EMAILS = [
  'admin@gmail.com',
  'admin@gamil.com',
  'alvinmonir411@gmail.com',
];
const PLATFORM_OWNER_PASSWORD = '13663';

// ─────────────────────────────────────────────────────────────────────────────
// DEMO ACCOUNTS — password-free 1-click access, publicly shown
// Only Business Owner is shown as demo (NO Super Admin, NO Agent)
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_ACCOUNTS: Record<string, { role: 'ADMIN' | 'USER'; name: string; title: string }> = {
  'owner@orderflow.com': { role: 'ADMIN', name: 'Demo Business Owner', title: 'Store Owner' },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'demo') {
    // Only Business Owner shown publicly
    return NextResponse.json({
      success: true,
      demoUsers: [
        {
          role: 'ADMIN',
          label: '\u{1F4BC} Business Owner Demo',
          description: 'Merchant Dashboard — ব্যবসার পূর্ণ ড্যাশবোর্ড দেখুন',
          email: 'owner@orderflow.com',
        },
      ],
    });
  }

  // Get current session user
  const user = await getCurrentUser(req);
  return NextResponse.json({ success: true, user });
}

export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    const sql = getSql();
    const body = await req.json();
    const { action = 'login', email, password, name, organizationName } = body;

    // 1. LOGOUT
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'সফলভাবে লগআউট হয়েছে' });
      return clearSessionCookie(response);
    }

    // 2. REGISTER
    if (action === 'register') {
      const { phone, plan = 'PRO' } = body;
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: 'নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক' },
          { status: 400 },
        );
      }

      const orgName = organizationName || `${name.trim()}'s Store`;
      const baseSlug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'store';
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const uniqueSlug = `${baseSlug}-${randomSuffix}`;
      const orgId = `org-${Date.now()}`;
      const merchantPhone = phone || '01700000000';

      await sql`
        INSERT INTO "Organization" ("id", "name", "slug", "plan", "status", "ownerPhone", "createdAt", "updatedAt")
        VALUES (${orgId}, ${orgName}, ${uniqueSlug}, ${plan}, 'PENDING', ${merchantPhone}, NOW(), NOW())
        ON CONFLICT ("id") DO NOTHING;
      `;

      await sql`
        INSERT INTO "Store" ("id", "name", "slug", "phone", "currency", "organizationId", "createdAt", "updatedAt")
        VALUES (${`store-${orgId}`}, ${orgName}, ${uniqueSlug}, ${merchantPhone}, 'BDT', ${orgId}, NOW(), NOW())
        ON CONFLICT ("id") DO NOTHING;
      `;

      const userId = `usr-${Date.now()}`;
      const avatar = name.trim().slice(0, 2).toUpperCase();
      const passHash = hashPassword(password);

      await sql`
        INSERT INTO "User" ("id", "organizationId", "storeId", "name", "email", "passwordHash", "password", "role", "avatar", "title", "phone", "isActive", "createdAt", "updatedAt")
        VALUES (${userId}, ${orgId}, ${`store-${orgId}`}, ${name}, ${email.toLowerCase().trim()}, ${passHash}, ${passHash}, 'ADMIN', ${avatar}, 'Store Owner', ${merchantPhone}, false, NOW(), NOW())
        ON CONFLICT ("email") DO UPDATE SET
          "name" = EXCLUDED."name",
          "passwordHash" = EXCLUDED."passwordHash",
          "password" = EXCLUDED."password",
          "organizationId" = EXCLUDED."organizationId",
          "storeId" = EXCLUDED."storeId",
          "phone" = EXCLUDED."phone",
          "isActive" = false,
          "updatedAt" = NOW();
      `;

      return NextResponse.json({
        success: true,
        pendingApproval: true,
        message: 'আপনার রেজিস্ট্রেশন সফল হয়েছে! পেমেন্ট নিশ্চিতকরণের পর সুপার অ্যাডমিন অনুমোদন করবেন।',
        details: {
          organizationId: orgId,
          organizationName: orgName,
          ownerName: name,
          email: email.toLowerCase().trim(),
          phone: merchantPhone,
          plan,
        },
      });
    }

    // 2.1 SUBMIT PAYMENT PROOF
    if (action === 'submit_payment_proof') {
      const {
        organizationId,
        email: merchantEmail,
        paymentMethod = 'bKash',
        paymentSenderPhone = '',
        paymentTrxId = '',
        paymentScreenshot = '',
        paymentNote = '',
      } = body;

      if (!organizationId && !merchantEmail) {
        return NextResponse.json(
          { success: false, error: 'organizationId অথবা ইমেইল আবশ্যক' },
          { status: 400 },
        );
      }

      let targetOrgId = organizationId;
      if (!targetOrgId && merchantEmail) {
        const uRows = await sql`
          SELECT "organizationId" FROM "User" WHERE LOWER("email") = ${merchantEmail.toLowerCase().trim()} LIMIT 1;
        `;
        if (uRows.length > 0) {
          targetOrgId = uRows[0].organizationId;
        }
      }

      if (!targetOrgId) {
        return NextResponse.json(
          { success: false, error: 'স্টোর বা অ্যাকাউন্ট খুঁজে পাওয়া যায়নি' },
          { status: 404 },
        );
      }

      await sql`
        UPDATE "Organization"
        SET
          "paymentMethod" = ${paymentMethod},
          "paymentSenderPhone" = ${paymentSenderPhone},
          "paymentTrxId" = ${paymentTrxId},
          "paymentScreenshot" = ${paymentScreenshot},
          "paymentNote" = ${paymentNote},
          "paymentSubmittedAt" = NOW(),
          "updatedAt" = NOW()
        WHERE "id" = ${targetOrgId};
      `;

      return NextResponse.json({
        success: true,
        message: 'পেমেন্ট প্রুফ সফলভাবে জমা দেওয়া হয়েছে! সুপার অ্যাডমিন ভেরিফাই করে আপনার অ্যাকাউন্ট অনুমোদন করবেন।',
      });
    }

    // 3. LOGIN
    if (action === 'login') {
      if (!email) {
        return NextResponse.json(
          { success: false, error: 'ইমেইল প্রদান করুন' },
          { status: 400 },
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // ── SUPER ADMIN (Platform Owner) — requires exact email + password ────────
      // This is YOU only. No demo. No bypass. Password required.
      if (PLATFORM_OWNER_EMAILS.includes(normalizedEmail)) {
        if (!password || password !== PLATFORM_OWNER_PASSWORD) {
          return NextResponse.json(
            { success: false, error: 'ভুল পাসওয়ার্ড' },
            { status: 401 },
          );
        }
        const response = NextResponse.json({
          success: true,
          message: 'স্বাগতম Super Admin! 👑',
          user: {
            id: 'usr-platform-owner',
            organizationId: 'org-1',
            name: 'Alvin Monir',
            email: normalizedEmail,
            role: 'SUPER_ADMIN',
            title: 'Platform Owner',
            avatar: 'AM',
          },
        });
        return setSessionCookie(response, {
          userId: 'usr-platform-owner',
          organizationId: 'org-1',
          name: 'Alvin Monir',
          email: normalizedEmail,
          role: 'SUPER_ADMIN',
        });
      }
      // ── End Super Admin ────────────────────────────────────────────────────────

      // ── Demo accounts: password-free 1-click (only Business Owner) ────────────
      const demoUser = DEMO_ACCOUNTS[normalizedEmail];
      if (demoUser) {
        const userId = `usr-${demoUser.role.toLowerCase()}-demo`;
        const avatar = demoUser.name.slice(0, 2).toUpperCase();
        const response = NextResponse.json({
          success: true,
          message: 'ডেমো লগইন সফল হয়েছে! 🎉',
          user: {
            id: userId,
            organizationId: 'org-1',
            name: demoUser.name,
            email: normalizedEmail,
            role: demoUser.role,
            title: demoUser.title,
            avatar,
          },
        });
        return setSessionCookie(response, {
          userId,
          organizationId: 'org-1',
          name: demoUser.name,
          email: normalizedEmail,
          role: demoUser.role,
        });
      }
      // ── End demo accounts ──────────────────────────────────────────────────────

      // Real merchant accounts: password required
      if (!password) {
        return NextResponse.json(
          { success: false, error: 'পাসওয়ার্ড প্রদান করুন' },
          { status: 400 },
        );
      }

      const clientIp = req.headers.get('x-forwarded-for') || 'local';
      const rateLimitKey = `${clientIp}:${normalizedEmail}`;
      const rateCheck = checkLoginRateLimit(rateLimitKey, 5, 5 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { success: false, error: `অনেকবার ভুল চেষ্টা করা হয়েছে। ${rateCheck.retryAfter || 300} সেকেন্ড পর আবার চেষ্টা করুন।` },
          { status: 429 },
        );
      }

      const rows = await sql`
        SELECT u.id, u."organizationId", u.name, u.email, u."passwordHash", u.role, u.avatar, u.title, u."isActive",
               o.status as "orgStatus"
        FROM "User" u
        LEFT JOIN "Organization" o ON u."organizationId" = o.id
        WHERE u.email = ${normalizedEmail}
        LIMIT 1;
      `;

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'ভুল ইমেইল অথবা পাসওয়ার্ড' },
          { status: 401 },
        );
      }

      const userRow = rows[0];
      const isValidPassword = verifyPassword(password, userRow.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'ভুল ইমেইল অথবা পাসওয়ার্ড' },
          { status: 401 },
        );
      }

      // Check approval status
      if (!userRow.isActive || userRow.orgStatus === 'PENDING') {
        return NextResponse.json(
          {
            success: false,
            isPending: true,
            error: 'আপনার অ্যাকাউন্টটি এখনো অনুমোদিত হয়নি। পেমেন্ট সম্পন্ন করার পর সুপার অ্যাডমিন অনুমোদন করলে লগইন করতে পারবেন।',
          },
          { status: 403 },
        );
      }

      if (userRow.orgStatus === 'SUSPENDED') {
        return NextResponse.json(
          {
            success: false,
            isSuspended: true,
            error: 'আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। সহায়তার জন্য যোগাযোগ করুন।',
          },
          { status: 403 },
        );
      }

      resetLoginRateLimit(rateLimitKey);

      const response = NextResponse.json({
        success: true,
        message: 'লগইন সফল হয়েছে!',
        user: {
          id: userRow.id,
          organizationId: userRow.organizationId,
          name: userRow.name,
          email: userRow.email,
          role: userRow.role,
          title: userRow.title,
          avatar: userRow.avatar || userRow.name.slice(0, 2).toUpperCase(),
        },
      });

      return setSessionCookie(response, {
        userId: userRow.id,
        organizationId: userRow.organizationId,
        name: userRow.name,
        email: userRow.email,
        role: userRow.role,
      });
    }

    return NextResponse.json({ success: false, error: 'অজানা অ্যাকশন' }, { status: 400 });
  } catch (err: any) {
    console.error('[Auth API Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'সার্ভার এরর হয়েছে' },
      { status: 500 },
    );
  }
}
