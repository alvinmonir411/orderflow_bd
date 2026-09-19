import { NextRequest, NextResponse } from 'next/server';
import { getSql, getDbProducts } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const searchParams = request.nextUrl.searchParams;
    const queryOrgId = searchParams.get('orgId');
    const orgId = user?.role === 'SUPER_ADMIN' && queryOrgId ? queryOrgId : (user?.organizationId || 'org-1');

    const products = await getDbProducts(orgId);
    return NextResponse.json(products);
  } catch (error) {
    console.error('[Products GET API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sql = getSql();
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';

    const body = await request.json();
    const { title, category, description, basePrice, stock, images } = body;

    const id = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const cat = category?.trim() || 'সাধারণ';
    const desc = description?.trim() || '';
    const imgArray = Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80'];

    const newProd = await sql`
      INSERT INTO "Product" ("id", "storeId", "organizationId", "title", "category", "description", "basePrice", "stock", "isActive", "images", "createdAt", "updatedAt")
      VALUES (${id}, ${`store-${orgId}`}, ${orgId}, ${title}, ${cat}, ${desc}, ${Number(basePrice) || 0}, ${Number(stock) || 0}, true, ${imgArray}, NOW(), NOW())
      RETURNING 
        id,
        "storeId",
        title,
        category,
        description,
        "basePrice"::float as "basePrice",
        stock,
        "isActive",
        images,
        "createdAt",
        "updatedAt";
    `;

    return NextResponse.json(newProd[0]);
  } catch (error) {
    console.error('[Products POST API Error]:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const sql = getSql();
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';

    const body = await request.json();
    const { id, title, category, description, basePrice, stock, images, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const cat = category?.trim() || 'সাধারণ';
    const desc = description !== undefined ? description : '';
    const active = isActive !== undefined ? isActive : true;
    const price = Number(basePrice) || 0;
    const stockQty = Number(stock) || 0;

    let imgArray: string[] | undefined = undefined;
    if (Array.isArray(images) && images.length > 0) {
      imgArray = images;
    }

    if (imgArray) {
      await sql`
        UPDATE "Product"
        SET 
          title = ${title},
          category = ${cat},
          description = ${desc},
          "basePrice" = ${price},
          stock = ${stockQty},
          images = ${imgArray},
          "isActive" = ${active},
          "updatedAt" = NOW()
        WHERE id = ${id} AND ("organizationId" = ${orgId} OR (${orgId} = 'org-1' AND "organizationId" IS NULL));
      `;
    } else {
      await sql`
        UPDATE "Product"
        SET 
          title = ${title},
          category = ${cat},
          description = ${desc},
          "basePrice" = ${price},
          stock = ${stockQty},
          "isActive" = ${active},
          "updatedAt" = NOW()
        WHERE id = ${id} AND ("organizationId" = ${orgId} OR (${orgId} = 'org-1' AND "organizationId" IS NULL));
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Products PUT API Error]:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const sql = getSql();
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';

    const body = await request.json();
    const { id, stockDelta, stock, title, category, basePrice, images, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (stockDelta !== undefined) {
      await sql`
        UPDATE "Product"
        SET stock = GREATEST(0, stock + ${stockDelta}), "updatedAt" = NOW()
        WHERE id = ${id} AND ("organizationId" = ${orgId} OR (${orgId} = 'org-1' AND "organizationId" IS NULL));
      `;
    } else if (stock !== undefined && title === undefined) {
      await sql`
        UPDATE "Product"
        SET stock = ${stock}, "updatedAt" = NOW()
        WHERE id = ${id} AND ("organizationId" = ${orgId} OR (${orgId} = 'org-1' AND "organizationId" IS NULL));
      `;
    } else {
      // Full or partial field updates
      const cat = category?.trim() || undefined;
      const price = basePrice !== undefined ? Number(basePrice) : undefined;
      const stockVal = stock !== undefined ? Number(stock) : undefined;

      await sql`
        UPDATE "Product"
        SET 
          title = COALESCE(${title || null}, title),
          category = COALESCE(${cat || null}, category),
          "basePrice" = COALESCE(${price !== undefined ? price : null}, "basePrice"),
          stock = COALESCE(${stockVal !== undefined ? stockVal : null}, stock),
          images = COALESCE(${images || null}, images),
          "isActive" = COALESCE(${isActive !== undefined ? isActive : null}, "isActive"),
          "updatedAt" = NOW()
        WHERE id = ${id} AND ("organizationId" = ${orgId} OR (${orgId} = 'org-1' AND "organizationId" IS NULL));
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Products PATCH API Error]:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const sql = getSql();
  try {
    const user = await getCurrentUser(request);
    const orgId = user?.organizationId || 'org-1';

    const searchParams = request.nextUrl.searchParams;
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Delete associated OrderItems or keep consistency
    try {
      await sql`DELETE FROM "OrderItem" WHERE "productId" = ${id};`;
    } catch (e) {}

    await sql`DELETE FROM "Product" WHERE id = ${id} AND ("organizationId" = ${orgId} OR (${orgId} = 'org-1' AND "organizationId" IS NULL));`;

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[Products DELETE API Error]:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
