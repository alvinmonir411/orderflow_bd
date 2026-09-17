import { NextRequest, NextResponse } from 'next/server';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dgaiqqh7k';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '584391462478369';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const imageUrl = formData.get('url') as string | null;

    if (imageUrl) {
      return NextResponse.json({ url: imageUrl });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary using Unsigned upload or direct FormData
    const cFormData = new FormData();
    cFormData.append('file', base64Data);
    cFormData.append('upload_preset', 'ml_default'); // standard default or unsigned

    let res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: cFormData,
    });

    let data = await res.json();

    // If unsigned upload preset failed, try orderflow preset or return base64
    if (!res.ok || !data.secure_url) {
      const altFormData = new FormData();
      altFormData.append('file', base64Data);
      altFormData.append('upload_preset', 'orderflow');

      const altRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: altFormData,
      });
      const altData = await altRes.json();
      if (altRes.ok && altData.secure_url) {
        return NextResponse.json({ url: altData.secure_url });
      }

      // Fallback: return optimized base64 or secure placeholder
      return NextResponse.json({ url: base64Data, warning: 'Cloudinary direct preset not active, used base64' });
    }

    return NextResponse.json({ url: data.secure_url });
  } catch (error) {
    console.error('[Upload API Error]:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
