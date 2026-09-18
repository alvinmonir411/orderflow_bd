import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'orderflow_session';
const JWT_SECRET = process.env.AUTH_SECRET || 'orderflow_bd_saas_enterprise_jwt_super_secret_key_2026';

// Protected SaaS dashboard routes that require active authentication
const PROTECTED_ROUTES = [
  '/admin',
  '/dashboard',
  '/orders',
  '/messages',
  '/team',
  '/products',
  '/bot-settings',
  '/integrations',
];

// Helper to verify session token in Edge/Node runtime using Web Crypto
async function isSessionTokenValid(token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [encodedPayload, signature] = parts;

    // Verify HMAC-SHA256 signature using Web Crypto
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(encodedPayload));
    
    // Convert ArrayBuffer to base64url string
    const uint8Array = new Uint8Array(signatureBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const expectedSignature = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    if (signature !== expectedSignature) return false;

    // Decode payload and verify expiration
    const payloadJson = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);

    if (Date.now() > payload.exp) return false;
    return true;
  } catch (err) {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = token ? await isSessionTokenValid(token) : false;

  // 1. Check if accessing a protected route without valid authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If already logged in and visiting /login or /register, redirect directly to /dashboard
  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. /products/...)
     * - webhooks (/webhooks/...)
     * - api routes (/api/...)
     */
    '/((?!_next/static|_next/image|favicon.ico|products/|webhooks/|api/).*)',
  ],
};
