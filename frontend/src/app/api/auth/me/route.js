import { NextResponse } from 'next/server';
import { SERVER_URL } from '@/api/utils/baseUrl';

const BACKEND_URL = SERVER_URL;

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';

    // 1. Forward to Express backend if active
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const backendRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Cookie: cookieHeader,
          'X-Requested-With': 'XMLHttpRequest',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status });
    } catch {
      // Backend offline — proceed to local fallback
    }

    // 2. Check local fallback cookie
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: 'usr_local',
        email: 'admin@anuprawat.com',
        name: 'Anup Rawat',
        role: 'admin',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
