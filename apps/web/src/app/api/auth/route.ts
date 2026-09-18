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

// Demo accounts: password-free 1-click access (no password needed)
const DEMO_ACCOUNTS: Record<string, { role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'; name: string; title: string }> = {
  'superadmin@orderflow.com': { role: 'SUPER_ADMIN', name: 'Alvin Super Admin', title: 'Platform Owner' },
  'owner@orderflow.com':      { role: 'ADMIN',       name: 'Alvin Monir',       title: 'Store Owner' },
  'agent@orderflow.com':      { role: 'USER',        name: 'Rahim Ahmed',       title: 'Live Chat Specialist' },
  'support@orderflow.com':    { role: 'USER',        name: 'Fatima Rahman',     title: 'Support Executive' },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'demo') {
    // Super Admin is NOT listed — private platform owner account only
    return NextResponse.json({
      success: true,
      demoUsers: [
        {
          role: 'ADMIN',
          label: '\u{1F4BC} Store Owner / Merchant',
          description: 'Business Manager & Team Administrator',
          email: 'owner@orderflow.com',
        },
        {
          role: 'USER',
          label: '\u{1F4AC} Live Chat Specialist',
          description: 'Support Agent & Order Manager',
          email: 'agent@orderflow.com',
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
      const response = NextResponse.json({ success: true, message: '\u09b8\u09ab\u09b2\u09ad\u09be\u09ac\u09c7 \u09b2\u0997\u0986\u0989\u099f \u09b9\u09af\u09bc\u09c7\u099b\u09c7' });
      return clearSessionCookie(response);
    }

    // 2. REGISTER
    if (action === 'register') {
      const { phone, plan = 'PRO' } = body;
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: '\u09a8\u09be\u09ae, \u0987\u09ae\u09c7\u0987\u09b2 \u098f\u09ac\u0982 \u09aa\u09be\u09b8\u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1 \u0986\u09ac\u09b6\u09cd\u09af\u0995' },
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

      // Create Organization in PENDING status (awaiting super admin payment verification)
      await sql`
        INSERT INTO "Organization" ("id", "name", "slug", "plan", "status", "ownerPhone", "createdAt", "updatedAt")
        VALUES (${orgId}, ${orgName}, ${uniqueSlug}, ${plan}, 'PENDING', ${merchantPhone}, NOW(), NOW())
        ON CONFLICT ("id") DO NOTHING;
      `;

      // Create Store for this Organization
      await sql`
        INSERT INTO "Store" ("id", "name", "slug", "phone", "currency", "organizationId", "createdAt", "updatedAt")
        VALUES (${`store-${orgId}`}, ${orgName}, ${uniqueSlug}, ${merchantPhone}, 'BDT', ${orgId}, NOW(), NOW())
        ON CONFLICT ("id") DO NOTHING;
      `;

      // Create User as ADMIN with isActive = false until Super Admin approves
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
        message: '\u0986\u09aa\u09a8\u09be\u09b0 \u09b0\u09c7\u099c\u09bf\u09b8\u09cd\u099f\u09cd\u09b0\u09c7\u09b6\u09a8 \u09b8\u09ab\u09b2 \u09b9\u09af\u09bc\u09c7\u099b\u09c7! \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f\u099f\u09bf \u09af\u09be\u099a\u09be\u0987 \u0993 \u09aa\u09c7\u09ae\u09c7\u09a8\u09cd\u099f \u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4\u0995\u09b0\u09a3\u09c7\u09b0 \u09aa\u09b0 \u09b8\u09c1\u09aa\u09be\u09b0 \u0985\u09cd\u09af\u09be\u09a1\u09ae\u09bf\u09a8 \u0985\u09a8\u09c1\u09ae\u09cb\u09a6\u09a8 \u0995\u09b0\u09ac\u09c7\u09a8\u0964',
        details: {
          organizationName: orgName,
          ownerName: name,
          email: email.toLowerCase().trim(),
          phone: merchantPhone,
          plan,
        },
      });
    }

    // 3. LOGIN
    if (action === 'login') {
      if (!email) {
        return NextResponse.json(
          { success: false, error: '\u0987\u09ae\u09c7\u0987\u09b2 \u09aa\u09cd\u09b0\u09a6\u09be\u09a8 \u0995\u09b0\u09c1\u09a8' },
          { status: 400 },
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // ── Demo accounts: password-free instant 1-click access ──────────────────
      const demoUser = DEMO_ACCOUNTS[normalizedEmail];
      if (demoUser) {
        const userId = `usr-${demoUser.role.toLowerCase().replace(/_/g, '-')}-demo`;
        const avatar = demoUser.name.slice(0, 2).toUpperCase();
        const response = NextResponse.json({
          success: true,
          message: '\u09a1\u09c7\u09ae\u09cb \u09b2\u0997\u0987\u09a8 \u09b8\u09ab\u09b2 \u09b9\u09af\u09bc\u09c7\u099b\u09c7! \ud83c\udf89',
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
      // ── End demo accounts ─────────────────────────────────────────────────────

      // Real accounts: password is mandatory
      if (!password) {
        return NextResponse.json(
          { success: false, error: '\u09aa\u09be\u09b8\u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1 \u09aa\u09cd\u09b0\u09a6\u09be\u09a8 \u0995\u09b0\u09c1\u09a8' },
          { status: 400 },
        );
      }

      const clientIp = req.headers.get('x-forwarded-for') || 'local';
      const rateLimitKey = `${clientIp}:${normalizedEmail}`;
      const rateCheck = checkLoginRateLimit(rateLimitKey, 5, 5 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { success: false, error: `\u0985\u09a8\u09c7\u0995\u09ac\u09be\u09b0 \u09ad\u09c1\u09b2 \u099a\u09c7\u09b7\u09cd\u099f\u09be \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964 \u0985\u09a8\u09c1\u0997\u09cd\u09b0\u09b9 \u0995\u09b0\u09c7 ${rateCheck.retryAfter || 300} \u09b8\u09c7\u0995\u09c7\u09a8\u09cd\u09a1 \u09aa\u09b0 \u0986\u09ac\u09be\u09b0 \u099a\u09c7\u09b7\u09cd\u099f\u09be \u0995\u09b0\u09c1\u09a8\u0964` },
          { status: 429 },
        );
      }

      const rows = await sql`
        SELECT u.id, u."organizationId", u.name, u.email, u."passwordHash", u.role, u.avatar, u.title, u."isActive",
               o.status as "orgStatus", o.name as "orgName", o.plan as "orgPlan"
        FROM "User" u
        LEFT JOIN "Organization" o ON u."organizationId" = o.id
        WHERE u.email = ${normalizedEmail}
        LIMIT 1;
      `;

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, error: '\u09ad\u09c1\u09b2 \u0987\u09ae\u09c7\u0987\u09b2 \u0985\u09a5\u09ac\u09be \u09aa\u09be\u09b8\u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1' },
          { status: 401 },
        );
      }

      const userRow = rows[0];
      const isValidPassword = verifyPassword(password, userRow.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: '\u09ad\u09c1\u09b2 \u0987\u09ae\u09c7\u0987\u09b2 \u0985\u09a5\u09ac\u09be \u09aa\u09be\u09b8\u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1' },
          { status: 401 },
        );
      }

      // Check approval and active status
      if (!userRow.isActive || userRow.orgStatus === 'PENDING') {
        if (userRow.orgStatus === 'PENDING' || !userRow.isActive) {
          return NextResponse.json(
            {
              success: false,
              isPending: true,
              error: '\u0986\u09aa\u09a8\u09be\u09b0 \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f\u099f\u09bf \u098f\u0996\u09a8\u09cb \u0985\u09a8\u09c1\u09ae\u09cb\u09a6\u09bf\u09a4 \u09b9\u09af\u09bc\u09a8\u09bf\u0964 \u09ac\u09bf\u0995\u09be\u09b6/\u09a8\u0997\u09a6\u09c7 \u09aa\u09c7\u09ae\u09c7\u09a8\u09cd\u099f \u09b8\u09ae\u09cd\u09aa\u09a8\u09cd\u09a8 \u0995\u09b0\u09be\u09b0 \u09aa\u09b0 \u09b8\u09c1\u09aa\u09be\u09b0 \u0985\u09cd\u09af\u09be\u09a1\u09ae\u09bf\u09a8 \u0985\u09a8\u09c1\u09ae\u09cb\u09a6\u09a8 \u0995\u09b0\u09b2\u09c7 \u0986\u09aa\u09a8\u09bf \u09b2\u0997\u0987\u09a8 \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7\u09a8\u0964',
            },
            { status: 403 },
          );
        }
        if (userRow.orgStatus === 'SUSPENDED') {
          return NextResponse.json(
            {
              success: false,
              isSuspended: true,
              error: '\u0986\u09aa\u09a8\u09be\u09b0 \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f\u099f\u09bf \u09b8\u09be\u09ae\u09af\u09bc\u09bf\u0995\u09ad\u09be\u09ac\u09c7 \u09b8\u09cd\u09a5\u0997\u09bf\u09a4 (Suspended) \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964 \u09b8\u09b9\u09be\u09af\u09bc\u09a4\u09be\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09c1\u09aa\u09be\u09b0 \u0985\u09cd\u09af\u09be\u09a1\u09ae\u09bf\u09a8\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09af\u09cb\u0997\u09be\u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964',
            },
            { status: 403 },
          );
        }
        return NextResponse.json(
          { success: false, error: '\u0986\u09aa\u09a8\u09be\u09b0 \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f\u099f\u09bf \u09a8\u09bf\u09b7\u09cd\u0995\u09cd\u09b0\u09bf\u09af\u09bc \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964' },
          { status: 403 },
        );
      }

      resetLoginRateLimit(rateLimitKey);

      const userPayload = {
        userId: userRow.id,
        organizationId: userRow.organizationId,
        name: userRow.name,
        email: userRow.email,
        role: userRow.role,
      };

      const response = NextResponse.json({
        success: true,
        message: '\u09b2\u0997\u0987\u09a8 \u09b8\u09ab\u09b2 \u09b9\u09af\u09bc\u09c7\u099b\u09c7!',
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

      return setSessionCookie(response, userPayload);
    }

    return NextResponse.json({ success: false, error: '\u0985\u099c\u09be\u09a8\u09be \u0985\u09cd\u09af\u09be\u0995\u09b6\u09a8' }, { status: 400 });
  } catch (err: any) {
    console.error('[Auth API Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || '\u09b8\u09be\u09b0\u09cd\u09ad\u09be\u09b0 \u098f\u09b0\u09b0 \u09b9\u09af\u09bc\u09c7\u099b\u09c7' },
      { status: 500 },
    );
  }
}
