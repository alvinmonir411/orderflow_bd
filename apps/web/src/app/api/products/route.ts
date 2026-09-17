import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET() {
  const sql = getSql();
  try {
    const products = await sql`
      SELECT 
        id,
        "storeId",
        title,
        "basePrice"::float as "basePrice",
        stock,
        "isActive",
        images,
        "createdAt",
        "updatedAt"
      FROM "Product"
      ORDER BY "createdAt" DESC;
    `;

    return NextResponse.json(products);
  } catch (error) {
    console.error('[Products GET API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sql = getSql();
  try {
    const body = await request.json();
    const { title, basePrice, stock, images } = body;

    const id = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const imgArray = Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80'];

    const newProd = await sql`
      INSERT INTO "Product" ("id", "storeId", "title", "basePrice", "stock", "isActive", "images", "createdAt", "updatedAt")
      VALUES (${id}, 'store-1', ${title}, ${Number(basePrice) || 0}, ${Number(stock) || 0}, true, ${imgArray}, NOW(), NOW())
      RETURNING *;
    `;

    return NextResponse.json(newProd[0]);
  } catch (error) {
    console.error('[Products POST API Error]:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const sql = getSql();
  try {
    const body = await request.json();
    const { id, stockDelta, stock } = body;

    if (stockDelta !== undefined) {
      await sql`
        UPDATE "Product"
        SET stock = GREATEST(0, stock + ${stockDelta}), "updatedAt" = NOW()
        WHERE id = ${id};
      `;
    } else if (stock !== undefined) {
      await sql`
        UPDATE "Product"
        SET stock = ${stock}, "updatedAt" = NOW()
        WHERE id = ${id};
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Products PATCH API Error]:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
