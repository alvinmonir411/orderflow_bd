import { NextRequest, NextResponse } from 'next/server';
import {
  getDbAllOrganizations,
  getDbAdminStats,
  approveDbOrganization,
  suspendDbOrganization,
  reactivateDbOrganization,
  deleteDbOrganization,
  initDatabase,
} from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.response) return auth.response;

    const user = auth.user;
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'অনুমোদনহীন অ্যাক্সেস। শুধুমাত্র সুপার অ্যাডমিন এই প্যানেল দেখতে পারেন।' },
        { status: 403 },
      );
    }

    await initDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';

    const [stats, organizations] = await Promise.all([
      getDbAdminStats(),
      getDbAllOrganizations(status),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      organizations,
    });
  } catch (err: any) {
    console.error('[Admin Organizations GET Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.response) return auth.response;

    const user = auth.user;
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'অনুমোদনহীন অ্যাক্সেস। শুধুমাত্র সুপার অ্যাডমিন এই কাজ করতে পারেন।' },
        { status: 403 },
      );
    }

    await initDatabase();
    const body = await req.json();
    const { action, organizationId } = body;

    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'organizationId আবশ্যক' }, { status: 400 });
    }

    if (action === 'approve') {
      const ok = await approveDbOrganization(organizationId, user.id);
      if (!ok) {
        return NextResponse.json({ success: false, error: 'অনুমোদন করতে ব্যর্থ হয়েছে' }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        message: 'অ্যাকাউন্ট সফলভাবে অনুমোদন করা হয়েছে! মার্চেন্ট এখন লগইন করতে পারবে।',
      });
    }

    if (action === 'suspend') {
      const ok = await suspendDbOrganization(organizationId);
      if (!ok) {
        return NextResponse.json({ success: false, error: 'স্থগিত করতে ব্যর্থ হয়েছে' }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        message: 'স্টোর এবং এর সকল ইউজার স্থগিত (Suspended) করা হয়েছে।',
      });
    }

    if (action === 'reactivate') {
      const ok = await reactivateDbOrganization(organizationId);
      if (!ok) {
        return NextResponse.json({ success: false, error: 'পুনরায় সক্রিয় করতে ব্যর্থ হয়েছে' }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        message: 'স্টোরটি পুনরায় সফলভাবে সক্রিয় করা হয়েছে!',
      });
    }

    if (action === 'delete') {
      if (organizationId === 'org-1') {
        return NextResponse.json(
          { success: false, error: 'ডিফল্ট মাস্টার অর্গানাইজেশন ডিলিট করা যাবে না।' },
          { status: 400 },
        );
      }
      const ok = await deleteDbOrganization(organizationId);
      if (!ok) {
        return NextResponse.json({ success: false, error: 'ডিলিট করতে ব্যর্থ হয়েছে' }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        message: 'স্টোর এবং এর সকল ডেটা সফলভাবে ডিলিট করা হয়েছে।',
      });
    }

    return NextResponse.json({ success: false, error: 'অজানা অ্যাকশন' }, { status: 400 });
  } catch (err: any) {
    console.error('[Admin Organizations POST Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
