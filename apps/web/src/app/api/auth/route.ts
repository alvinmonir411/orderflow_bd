import { NextRequest, NextResponse } from 'next/server';
import { getSql, initDatabase } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getCurrentUser,
} from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'demo') {
    return NextResponse.json({
      success: true,
      demoUsers: [
        {
          role: 'SUPER_ADMIN',
          label: '👑 Super Admin',
          description: 'SaaS Platform Owner & Full System Access',
          email: 'superadmin@orderflow.com',
          password: 'admin123',
        },
        {
          role: 'ADMIN',
          label: '💼 Store Owner / Merchant',
          description: 'Business Manager & Team Administrator',
          email: 'owner@orderflow.com',
          password: 'admin123',
        },
        {
          role: 'USER',
          label: '💬 Live Chat Specialist',
          description: 'Support Agent & Order Manager',
          email: 'agent@orderflow.com',
          password: 'agent123',
        },
      ],
    });
  }

  // Get current session user
  const user = await getCurrentUser(req);
  return NextResponse.json({
    success: true,
    user,
  });
}

export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    const sql = getSql();
    const body = await req.json();
    const { action = 'login', email, password, name, organizationName, role } = body;

    // 1. LOGOUT
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'সফলভাবে লগআউট হয়েছে' });
      return clearSessionCookie(response);
    }

    // 2. REGISTER
    if (action === 'register') {
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: 'নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক' },
          { status: 400 },
        );
      }

      const orgName = organizationName || `${name.trim()}'s Store`;
      const orgSlug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || `org-${Date.now()}`;
      const orgId = `org-${Date.now()}`;

      // Create Organization
      await sql`
        INSERT INTO "Organization" ("id", "name", "slug", "plan", "createdAt", "updatedAt")
        VALUES (${orgId}, ${orgName}, ${orgSlug}, 'PRO', NOW(), NOW())
        ON CONFLICT ("slug") DO NOTHING;
      `;

      // Create Store
      await sql`
        INSERT INTO "Store" ("id", "name", "slug", "phone", "currency", "createdAt", "updatedAt")
        VALUES (${`store-${orgId}`}, ${orgName}, ${orgSlug}, '01700000000', 'BDT', NOW(), NOW())
        ON CONFLICT ("id") DO NOTHING;
      `;

      // Create User as ADMIN
      const userId = `usr-${Date.now()}`;
      const avatar = name.trim().slice(0, 2).toUpperCase();
      const passHash = hashPassword(password);

      await sql`
        INSERT INTO "User" ("id", "organizationId", "name", "email", "passwordHash", "role", "avatar", "title", "isActive", "createdAt")
        VALUES (${userId}, ${orgId}, ${name}, ${email.toLowerCase().trim()}, ${passHash}, 'ADMIN', ${avatar}, 'Store Owner', true, NOW())
        ON CONFLICT ("email") DO UPDATE SET
          "name" = EXCLUDED."name",
          "passwordHash" = EXCLUDED."passwordHash",
          "organizationId" = EXCLUDED."organizationId";
      `;

      const response = NextResponse.json({
        success: true,
        message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!',
        user: {
          id: userId,
          organizationId: orgId,
          name,
          email: email.toLowerCase().trim(),
          role: 'ADMIN',
          title: 'Store Owner',
          avatar,
        },
      });

      return setSessionCookie(response, {
        userId,
        organizationId: orgId,
        name,
        email: email.toLowerCase().trim(),
        role: 'ADMIN',
      });
    }

    // 3. LOGIN (Demo or Standard credentials)
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন' },
          { status: 400 },
        );
      }

      const rows = await sql`
        SELECT id, "organizationId", name, email, "passwordHash", role, avatar, title, "isActive"
        FROM "User"
        WHERE email = ${email.toLowerCase().trim()}
        LIMIT 1;
      `;

      if (rows.length === 0) {
        // If not found, check if it's one of the default demo emails
        const demoDefaults: Record<string, { role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'; name: string; title: string }> = {
          'superadmin@orderflow.com': { role: 'SUPER_ADMIN', name: 'Alvin Super Admin', title: 'Platform Owner' },
          'owner@orderflow.com': { role: 'ADMIN', name: 'Alvin Monir', title: 'Store Owner' },
          'agent@orderflow.com': { role: 'USER', name: 'Rahim Ahmed', title: 'Live Chat Specialist' },
          'support@orderflow.com': { role: 'USER', name: 'Fatima Rahman', title: 'Support Executive' },
        };

        const matchedDemo = demoDefaults[email.toLowerCase().trim()];
        if (matchedDemo && (password === 'admin123' || password === 'agent123')) {
          const userId = `usr-${matchedDemo.role.toLowerCase()}-demo`;
          const avatar = matchedDemo.name.slice(0, 2).toUpperCase();

          const response = NextResponse.json({
            success: true,
            message: 'ডেমো লগইন সফল হয়েছে!',
            user: {
              id: userId,
              organizationId: 'org-1',
              name: matchedDemo.name,
              email: email.toLowerCase().trim(),
              role: matchedDemo.role,
              title: matchedDemo.title,
              avatar,
            },
          });

          return setSessionCookie(response, {
            userId,
            organizationId: 'org-1',
            name: matchedDemo.name,
            email: email.toLowerCase().trim(),
            role: matchedDemo.role,
          });
        }

        return NextResponse.json(
          { success: false, error: 'ভুল ইমেইল অথবা পাসওয়ার্ড' },
          { status: 401 },
        );
      }

      const userRow = rows[0];
      if (!userRow.isActive) {
        return NextResponse.json(
          { success: false, error: 'আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।' },
          { status: 403 },
        );
      }

      const isValidPassword = verifyPassword(password, userRow.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।' },
          { status: 401 },
        );
      }

      const userPayload = {
        userId: userRow.id,
        organizationId: userRow.organizationId,
        name: userRow.name,
        email: userRow.email,
        role: userRow.role,
      };

      const response = NextResponse.json({
        success: true,
        message: 'লগইন সফল হয়েছে!',
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

    return NextResponse.json({ success: false, error: 'অজানা অ্যাকশন' }, { status: 400 });
  } catch (err: any) {
    console.error('[Auth API Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'সার্ভার এরর হয়েছে' },
      { status: 500 },
    );
  }
}
