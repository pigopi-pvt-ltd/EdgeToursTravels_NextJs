import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.split(' ')[1];

  const { pathname } = request.nextUrl;

  // Public routes
  if (
    pathname === '/login' || 
    pathname === '/api/login' || 
    pathname === '/api/register' ||
    (pathname === '/api/admin/book-form' && request.method === 'POST')
  ) {
    return NextResponse.next();
  }

  // API routes protection (except public ones)
  if (pathname.startsWith('/api')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    // Admin-only APIs
    if (pathname.startsWith('/api/admin') && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.next();
  }

  // Dashboard routes
  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/employee')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'employee') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/employee/:path*', '/api/:path*'],
};