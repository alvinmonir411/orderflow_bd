import { NextRequest, NextResponse } from 'next/server';
import {
  getDbTeamMembers,
  createDbTeamMember,
  updateDbTeamMemberRole,
  deleteDbTeamMember,
} from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth.response) return auth.response;

    const user = auth.user;
    const orgId = user.organizationId || 'org-1';
    const members = await getDbTeamMembers(orgId);

    return NextResponse.json({
      success: true,
      members,
      currentUserRole: user.role || 'ADMIN',
    });
  } catch (err: any) {
    console.error('[Team GET Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.response) return auth.response;

    const currentUser = auth.user;
    const body = await req.json();
    const { name, email, role = 'USER', title, phone, password = 'agent123' } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'নাম এবং ইমেইল প্রদান করুন' },
        { status: 400 },
      );
    }

    const orgId = currentUser.organizationId || 'org-1';
    const newMember = await createDbTeamMember({
      organizationId: orgId,
      name,
      email,
      password,
      role,
      title: title || (role === 'ADMIN' ? 'Team Lead' : 'Support Specialist'),
      phone,
    });

    return NextResponse.json({
      success: true,
      message: 'নতুন টিম মেম্বার সফলভাবে যুক্ত হয়েছে!',
      member: newMember,
    });
  } catch (err: any) {
    console.error('[Team POST Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ success: false, error: 'ইউজার আইডি ও রোল আবশ্যক' }, { status: 400 });
    }

    const success = await updateDbTeamMemberRole(userId, role);
    return NextResponse.json({
      success,
      message: `টিম মেম্বারের রোল '${role}' এ আপডেট করা হয়েছে`,
    });
  } catch (err: any) {
    console.error('[Team PATCH Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'ইউজার আইডি আবশ্যক' }, { status: 400 });
    }

    const success = await deleteDbTeamMember(userId);
    return NextResponse.json({
      success,
      message: 'টিম মেম্বার সফলভাবে রিমুভ করা হয়েছে',
    });
  } catch (err: any) {
    console.error('[Team DELETE Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

