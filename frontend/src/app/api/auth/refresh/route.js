import { NextResponse } from 'next/server';
import { SERVER_URL } from '@/api/utils/baseUrl';

const BACKEND_URL = SERVER_URL;

export async function POST(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';

    // Forward refresh request to standalone Express backend
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const backendRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          Cookie: cookieHeader,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Origin: request.headers.get('origin') || 'http://localhost:3000',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await backendRes.json();
      const nextResponse = NextResponse.json(data, { status: backendRes.status });

      // Forward Set-Cookie headers from Express to Next.js client
      const setCookies = backendRes.headers.getSetCookie?.() || [];
      setCookies.forEach((cookieStr) => {
        nextResponse.headers.append('set-cookie', cookieStr);
      });

      return nextResponse;
    } catch {
      // Backend unreachable
    }

    return NextResponse.json(
      { success: false, message: 'Backend unreachable for token refresh' },
      { status: 503 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Token refresh error' },
      { status: 500 }
    );
  }
}
