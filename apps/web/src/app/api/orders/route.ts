import { NextRequest, NextResponse } from 'next/server';
import { getDbOrders, insertDbOrder, updateDbOrderStatus } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const { searchParams } = new URL(request.url);
    const queryOrgId = searchParams.get('orgId');
    
    // Super admin can inspect any org if passed, otherwise default to user's org
    const orgId = user?.role === 'SUPER_ADMIN' && queryOrgId ? queryOrgId : (user?.organizationId || 'org-1');
    const orders = await getDbOrders(orgId);
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('[API GET /orders Error]:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';
    const body = await request.json();

    const created = await insertDbOrder({
      organizationId: orgId,
      customerName: body.customerName || body.customer?.name || 'কাস্টমার',
      customerPhone: body.customerPhone || body.customer?.phone || '01700000000',
      deliveryAddress: body.deliveryAddress || 'ঢাকা',
      deliveryCity: body.deliveryCity || 'ঢাকা',
      channel: body.channel || 'MANUAL_ENTRY',
      status: body.status || 'PENDING_CONFIRMATION',
      itemsPrice: Number(body.itemsPrice) || 850,
      deliveryCharge: Number(body.deliveryCharge) || 120,
      discount: Number(body.discount) || 0,
      productTitle: body.items?.[0]?.product?.title || body.productTitle || 'প্রিমিয়াম প্রোডাক্ট',
      variantName: body.items?.[0]?.variant?.name || body.variantName || 'Standard Size',
      productId: body.items?.[0]?.productId,
    });

    return NextResponse.json({ success: true, order: created });
  } catch (error: any) {
    console.error('[API POST /orders Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.role === 'SUPER_ADMIN' ? undefined : (user?.organizationId || 'org-1');
    const body = await request.json();
    const { orderId, status, courierProvider, courierTrackingId, notes } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const success = await updateDbOrderStatus(orderId, status, {
      courierProvider,
      courierTrackingId,
      notes,
      organizationId: orgId,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'অর্ডারটি খুঁজে পাওয়া যায়নি অথবা এই অর্ডারে আপনার অ্যাক্সেস নেই।' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API PATCH /orders Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

